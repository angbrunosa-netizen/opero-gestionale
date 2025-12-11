// services/VPSDeployer.js
// Servizio per il deploy di siti statici su VPS

const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { NodeSSH } = require('node-ssh');
const { execSync } = require('child_process');

class VPSDeployer {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp-deploy');
  }

  /**
   * Deploy sito su VPS
   */
  async deploySite(websiteId, sitePath, vpsConfig, domain) {
    console.log(`🚀 Inizio deploy sito ${websiteId} su VPS`);

    try {
      // 1. Crea pacchetto deploy
      const packagePath = await this.createDeployPackage(websiteId, sitePath);

      // 2. Upload su VPS
      const uploadResult = await this.uploadToVPS(packagePath, vpsConfig);

      // 3. Estrai e configura su VPS
      const deployResult = await this.setupOnVPS(websiteId, domain, vpsConfig);

      // 4. Pulizia temporanei
      await this.cleanup(packagePath);

      return {
        success: true,
        uploadResult,
        deployResult,
        siteUrl: `https://${domain}`
      };

    } catch (error) {
      console.error('❌ Errore deploy VPS:', error);
      throw error;
    }
  }

  /**
   * Crea pacchetto di deploy
   */
  async createDeployPackage(websiteId, sitePath) {
    console.log('📦 Creazione pacchetto deploy...');

    const packageDir = path.join(this.tempDir, `site-${websiteId}`);
    const packagePath = path.join(this.tempDir, `site-${websiteId}.zip`);

    // Crea directory temporanea
    await fs.mkdir(packageDir, { recursive: true });

    // Copia file sito
    await this.copyDirectory(sitePath, packageDir);

    // Aggiungi file di configurazione deploy
    await this.addDeployConfig(packageDir, websiteId);

    // Crea ZIP
    await this.createZip(packageDir, packagePath);

    // Rimuovi directory temporanea
    await fs.rmdir(packageDir, { recursive: true });

    return packagePath;
  }

  /**
   * Copia directory ricorsivamente
   */
  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Aggiunge configurazione deploy
   */
  async addDeployConfig(packageDir, websiteId) {
    const deployConfig = {
      websiteId,
      deployDate: new Date().toISOString(),
      nodeVersion: '18.x',
      buildCommand: 'npm run build',
      startCommand: 'npm start',
      environment: 'production'
    };

    await fs.writeFile(
      path.join(packageDir, 'deploy.config.json'),
      JSON.stringify(deployConfig, null, 2)
    );

    // Aggiungi script deploy
    const deployScript = `#!/bin/bash
# Deploy script per sito ${websiteId}

echo "🚀 Inizio deploy sito ${websiteId}"

# Installa dipendenze
npm ci --only=production

# Build sito
npm run build

# Setup PM2 (se installato)
if command -v pm2 &> /dev/null; then
    echo "🔄 Riavvio applicazione con PM2"
    pm2 restart site-${websiteId} || pm2 start npm --name "site-${websiteId}" -- start
else
    echo "⚠️ PM2 non installato, avvio con nohup"
    nohup npm start > /dev/null 2>&1 &
fi

echo "✅ Deploy completato"
`;

    await fs.writeFile(path.join(packageDir, 'deploy.sh'), deployScript);
  }

  /**
   * Crea file ZIP
   */
  async createZip(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  /**
   * Upload su VPS
   */
  async uploadToVPS(packagePath, vpsConfig) {
    console.log('⬆️ Upload su VPS...');

    const {
      host,
      username,
      password,
      sshKey,
      deployPath = '/var/www/sites'
    } = vpsConfig;

    if (!host || !username || (!password && !sshKey)) {
      throw new Error('Configurazione VPS incompleta: host, username e password/sshKey richiesti');
    }

    const ssh = new NodeSSH();

    try {
      // Connetti al VPS
      if (sshKey) {
        await ssh.connect({
          host,
          username,
          privateKey: sshKey
        });
      } else {
        await ssh.connect({
          host,
          username,
          password
        });
      }

      // Crea directory deploy su VPS
      const remoteDir = `${deployPath}/site-${Date.now()}`;
      await ssh.executeCommand(`mkdir -p ${remoteDir}`);

      // Upload file
      const fileName = path.basename(packagePath);
      const remotePath = `${remoteDir}/${fileName}`;

      await ssh.putFile(packagePath, remotePath);

      // Disconnetti
      ssh.dispose();

      return { success: true, remotePath, remoteDir };

    } catch (error) {
      console.error('❌ Errore upload:', error);
      ssh.dispose();
      throw new Error('Upload fallito: ' + error.message);
    }
  }

  /**
   * Setup su VPS
   */
  async setupOnVPS(websiteId, domain, vpsConfig) {
    console.log('⚙️ Setup su VPS...');

    const { deployPath = '/var/www/sites' } = vpsConfig;
    const siteName = `site-${websiteId}`;
    const siteDir = `${deployPath}/${siteName}`;
    const zipFile = `${deployPath}/site-${websiteId}.zip`;

    const setupCommands = [
      // Estrai ZIP
      `cd ${deployPath} && unzip -o ${zipFile} -d ${siteName}`,

      // Rimuovi ZIP
      `rm ${zipFile}`,

      // Entra directory e setup
      `cd ${siteName}`,

      // Installa Next.js CLI se non presente
      `npm install -g next@latest || true`,

      // Installa dipendenze
      `npm ci --only=production`,

      // Build sito
      `npm run build`,

      // Setup PM2 per production
      `pm2 delete ${siteName} || true`,
      `pm2 start npm --name "${siteName}" -- start`,

      // Setup Nginx (se richiesto)
      this.generateNginxConfig(domain, siteDir)
    ];

    for (const command of setupCommands) {
      if (command) {
        await this.executeSSHCommand(command, vpsConfig);
      }
    }

    return { success: true, siteDir, domain };
  }

  /**
   * Esegue comando SSH
   */
  async executeSSHCommand(command, vpsConfig) {
    const { host, username, password, sshKey } = vpsConfig;

    let sshCommand;
    if (sshKey) {
      sshCommand = `ssh -i "${sshKey}" ${username}@${host} "${command}"`;
    } else {
      sshCommand = `sshpass -p "${password}" ssh ${username}@${host} "${command}"`;
    }

    try {
      execSync(sshCommand, { stdio: 'inherit', timeout: 30000 });
      return { success: true };
    } catch (error) {
      console.error(`❌ Errore comando SSH: ${command}`, error);
      throw new Error(`Comando SSH fallito: ${error.message}`);
    }
  }

  /**
   * Genera configurazione Nginx
   */
  generateNginxConfig(domain, siteDir) {
    const nginxConfig = `
server {
    listen 80;
    server_name ${domain} www.${domain};

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${domain} www.${domain};

    # SSL (to be configured)
    # ssl_certificate /path/to/certificate.crt;
    # ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /_next/static/ {
        alias ${siteDir}/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /static/ {
        alias ${siteDir}/public/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
`;

    return `sudo tee /etc/nginx/sites-available/${domain} << 'EOF'
${nginxConfig}
EOF

sudo ln -sf /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx`;
  }

  /**
   * Pulizia file temporanei
   */
  async cleanup(packagePath) {
    try {
      await fs.unlink(packagePath);
    } catch (error) {
      console.warn('⚠️ Cleanup file temporaneo fallito:', error.message);
    }
  }

  /**
   * Test connessione VPS
   */
  async testVPSConnection(vpsConfig) {
    try {
      const testCommand = 'echo "Connection successful"';
      const result = await this.executeSSHCommand(testCommand, vpsConfig);
      return { success: true, message: 'Connessione VPS riuscita' };
    } catch (error) {
      return { success: false, message: 'Connessione VPS fallita: ' + error.message };
    }
  }
}

module.exports = VPSDeployer;