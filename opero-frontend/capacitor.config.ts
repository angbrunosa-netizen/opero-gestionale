import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.opero.gestionale',
  appName: 'opero',
  webDir: 'build',

  // --- INIZIO MODIFICA: FORZA HTTP ---
  // Sovrascriviamo qualsiasi impostazione nascosta che
  // forza 'https' e diciamo all'app di girare su 'http'.
 /* server: {
    androidScheme: 'http'
  }
  // --- FINE MODIFICA ---*/
};

export default config;