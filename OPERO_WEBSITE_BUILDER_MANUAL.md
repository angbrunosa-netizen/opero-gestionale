# Opero Website Builder - Programming Manual

*Version 1.0 - December 2025*

## Table of Contents
1. [Project Overview](#project-overview)
2. [Development Guidelines](#development-guidelines)
3. [Current Implementation Status](#current-implementation-status)
4. [Development Setup](#development-setup)
5. [Key Components Documentation](#key-components-documentation)
6. [Gallery System](#gallery-system)
7. [Best Practices](#best-practices)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

### Architecture Summary

The Opero Website Builder is a full-stack web application built with a Node.js/Express backend and React frontend. The system enables companies to create and manage professional websites with integrated galleries, static pages, and e-commerce capabilities.

**Key Architectural Components:**
- **Backend**: Node.js with Express.js framework
- **Frontend**: React.js with modern hooks and functional components
- **Database**: MySQL with Knex.js for migrations and queries
- **File Storage**: Aruba Cloud S3 integration for media files
- **Authentication**: JWT-based with middleware protection

### Tech Stack

#### Backend Dependencies
```json
{
  "express": "^4.21.2",
  "knex": "^3.1.0",
  "mysql2": "^3.14.4",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5-lts.1",
  "aws-sdk": "^2.x.x",
  "cors": "^2.8.5",
  "bcrypt": "^5.1.1",
  "uuid": "^9.0.1"
}
```

#### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.9.6",
  "axios": "^1.13.2",
  "@heroicons/react": "^2.2.0",
  "react-quill": "^2.0.0",
  "react-dropzone": "^14.3.8",
  "lucide-react": "^0.554.0"
}
```

### Current Features Implemented

1. **Website Management**
   - Create/edit/delete websites for companies
   - Subdomain management
   - Template customization
   - SEO settings

2. **Static Pages Management**
   - WYSIWYG page editor
   - JSON-based content structure
   - SEO metadata per page
   - Publication status control

3. **Gallery System**
   - Multiple gallery types (grid, masonry, carousel)
   - Advanced customization options
   - Image management with S3 storage
   - Lightbox functionality

4. **Template Customization**
   - Color scheme management
   - Typography controls
   - Layout configurations
   - Header/footer customization

5. **File Management**
   - S3 integration for file storage
   - Image optimization
   - CDN delivery via Cloudflare

### Database Structure

#### Core Tables

**siti_web_aziendali** - Main website table
- `id` (Primary)
- `id_ditta` (Company ID)
- `subdomain` (Unique subdomain)
- `site_title`, `site_description`
- `template_config` (JSON)
- `domain_status` (active/inactive/pending)
- `created_at`, `updated_at`

**pagine_sito_web** - Static pages
- `id` (Primary)
- `id_sito_web` (FK)
- `slug` (URL slug)
- `titolo`, `contenuto_html`, `contenuto_json`
- `meta_title`, `meta_description`
- `is_published`, `menu_order`

**wg_galleries** - Photo galleries
- `id` (Primary)
- `id_sito_web` (FK)
- `id_pagina` (FK, nullable)
- `nome_galleria`, `slug`, `descrizione`
- `layout` (grid-2, grid-3, grid-4, masonry, carousel)
- `impostazioni` (JSON)
- `sort_order`, `is_active`

**wg_gallery_images** - Gallery images
- `id` (Primary)
- `id_galleria` (FK)
- `id_file` (FK to dm_files)
- `caption`, `alt_text`, `title_text`
- `order_pos`
- `impostazioni` (JSON)

**template_siti_web** - Available templates
- `id` (Primary)
- `nome_template`
- `categoria` (basic/premium/ecommerce)
- `config_schema` (JSON)

---

## Development Guidelines

### Coding Standards

#### JavaScript/React Standards
1. **Use functional components with hooks**
   ```javascript
   // Good
   const MyComponent = ({ prop1, prop2 }) => {
     const [state, setState] = useState(null);
     // Component logic
   };

   // Bad
   class MyComponent extends React.Component {
     // ...
   }
   ```

2. **Use ES6+ features**
   ```javascript
   // Use destructuring
   const { data, loading, error } = useApiCall();

   // Use arrow functions
   const handleClick = () => {
     // Handler logic
   };
   ```

3. **PropType validation (when not using TypeScript)**
   ```javascript
   MyComponent.propTypes = {
     prop1: PropTypes.string.isRequired,
     prop2: PropTypes.number,
     onAction: PropTypes.func
   };
   ```

#### Naming Conventions
- **Components**: PascalCase (e.g., `WebsiteBuilder`, `TemplateCustomizer`)
- **Files**: PascalCase for components (e.g., `WebsiteBuilder.js`)
- **Variables**: camelCase (e.g., `siteConfig`, `galleryLayout`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Database columns**: snake_case (e.g., `id_sito_web`)

### File Organization

```
opero/
├── backend/
│   ├── routes/
│   │   ├── website.js          # Website-specific routes
│   │   ├── auth.js             # Authentication routes
│   │   └── ...
│   ├── services/
│   │   ├── websiteService.js   # Business logic
│   │   └── ...
│   ├── utils/
│   │   ├── auth.js             # Auth middleware
│   │   ├── s3Client.js         # S3 configuration
│   │   └── ...
│   └── migrations/             # Database migrations
└── opero-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── website/        # Website-specific components
    │   │   ├── common/         # Shared components
    │   │   └── ...
    │   ├── services/
    │   │   ├── api.js          # API client
    │   │   └── websiteService.js
    │   └── utils/
```

### Component Patterns

1. **Container/Presentation Pattern**
   ```javascript
   // Container (logic)
   const WebsiteContainer = () => {
     const [data, setData] = useState(null);
     // Business logic

     return <WebsiteView data={data} actions={{...}} />;
   };

   // Presentation (UI)
   const WebsiteView = ({ data, actions }) => {
     return <div>{/* UI only */}</div>;
   };
   ```

2. **Custom Hooks Pattern**
   ```javascript
   const useWebsiteData = (websiteId) => {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       // Fetch logic
     }, [websiteId]);

     return { data, loading, refetch: () => {} };
   };
   ```

### API Design Principles

1. **RESTful endpoints**
   ```
   GET    /api/website              # List websites
   GET    /api/website/:id          # Get single website
   POST   /api/website              # Create website
   PUT    /api/website/:id          # Update website
   DELETE /api/website/:id          # Delete website

   GET    /api/website/:id/pages    # Get website pages
   POST   /api/website/:id/pages    # Create page
   ```

2. **Response format**
   ```javascript
   // Success response
   {
     success: true,
     data: { /* response data */ },
     pagination: { /* if applicable */ }
   }

   // Error response
   {
     success: false,
     error: "Error message",
     code: "ERROR_CODE"
   }
   ```

3. **Status codes**
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Internal Server Error

---

## Current Implementation Status

### Working Components

#### Frontend Components
1. **WebsiteBuilderUNIFIED** - Main website management interface
2. **TemplateCustomizer** - Template appearance customization
3. **ImageGalleryManager** - Gallery and media management
4. **GalleryAdvancedCustomizer_SIMPLE** - Advanced gallery settings
5. **PagesManager** - Static pages management
6. **WebsiteEditor** - WYSIWYG page editor

#### Backend Components
1. **Website routes** (`/routes/website.js`)
2. **Authentication middleware**
3. **S3 file upload handling**
4. **Database migrations**
5. **API endpoints for galleries and pages**

### Database Tables Status

✅ **Implemented:**
- `siti_web_aziendali` - Core website data
- `pagine_sito_web` - Static pages
- `template_siti_web` - Template definitions
- `wg_galleries` - Photo galleries
- `wg_gallery_images` - Gallery images
- `website_analytics` - Analytics data
- `website_activity_log` - Activity tracking

### API Endpoints

#### Website Management
```javascript
GET    /api/website/list              # List all websites
POST   /api/website/create            # Create new website
GET    /api/website/:id               # Get website details
PUT    /api/website/:id               # Update website
DELETE /api/website/:id               # Delete website
POST   /api/website/:id/publish       # Publish/unpublish website
```

#### Pages Management
```javascript
GET    /api/website/:id/pages         # List website pages
POST   /api/website/:id/pages         # Create page
GET    /api/website/:id/pages/:pageId # Get page details
PUT    /api/website/:id/pages/:pageId # Update page
DELETE /api/website/:id/pages/:pageId # Delete page
POST   /api/website/:id/pages/:pageId/publish # Toggle publish
```

#### Galleries Management
```javascript
GET    /api/website/:siteId/galleries              # List galleries
POST   /api/website/:siteId/galleries              # Create gallery
GET    /api/website/:siteId/galleries/:galleryId   # Get gallery
PUT    /api/website/:siteId/galleries/:galleryId   # Update gallery
DELETE /api/website/:siteId/galleries/:galleryId   # Delete gallery
POST   /api/website/:siteId/galleries/:galleryId/images # Add images
PUT    /api/website/:siteId/galleries/:galleryId/images/order # Reorder
```

#### File Management
```javascript
POST   /api/website/:websiteId/upload    # Upload file
GET    /api/website/:websiteId/images    # Get uploaded images
DELETE /api/website/:websiteId/images/:imageId # Delete image
```

### Frontend Features

#### Template Customization
- ✅ Color scheme selection with presets
- ✅ Typography controls (font family, sizes, weights)
- ✅ Layout configuration (spacing, width, borders)
- ✅ Header and footer customization
- ✅ Gallery global settings

#### Gallery System
- ✅ Multiple layout options (grid, masonry, carousel)
- ✅ Advanced customization modal
- ✅ Hover effects and animations
- ✅ Lightbox functionality
- ✅ Image ordering and management
- ✅ Caption and alt text support

#### Page Builder
- ✅ WYSIWYG editor integration
- ✅ JSON-based content structure
- ✅ SEO metadata management
- ✅ Publication status control
- ✅ Menu ordering

---

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn
- Git

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd opero
   ```

2. **Backend setup**
   ```bash
   # Install dependencies
   npm install

   # Copy environment file
   cp .env.example .env

   # Edit .env with your configuration
   nano .env
   ```

3. **Database setup**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE operodb;

   # Run migrations
   npm run migrate

   # Or run specific migrations
   npx knex migrate:latest
   ```

4. **Frontend setup**
   ```bash
   cd opero-frontend
   npm install
   ```

### Configuration

#### Environment Variables (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=operodb
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# S3 Configuration
S3_BUCKET_NAME=your-bucket
S3_REGION=it-mil-1
S3_ENDPOINT=your-s3-endpoint
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# Server
NODE_ENV=development
PORT=3000
```

### Running the Application

1. **Start backend**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

2. **Start frontend**
   ```bash
   cd opero-frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Database Migrations

#### Create new migration
```bash
npx knex migrate:make migration_name
```

#### Run migrations
```bash
npx knex migrate:latest
```

#### Rollback migration
```bash
npx knex migrate:rollback
```

#### View migration status
```bash
npx knex migrate:status
```

---

## Key Components Documentation

### WebsiteBuilderUNIFIED

The main component for website management, providing a unified interface for all website-related operations.

**Props:**
```javascript
{
  site: Object,           // Initial site data
  onSave: Function,       // Save callback
  onCancel: Function,     // Cancel callback
  mode: 'edit' | 'create' // Component mode
}
```

**State Management:**
- Uses local state for immediate UI updates
- Implements auto-save with 2-second debounce
- Manages multiple sections (pages, template, galleries, etc.)

**Key Features:**
- Tabbed interface for different sections
- Auto-save functionality
- Error handling and user feedback
- Loading states management

### TemplateCustomizer

Advanced template customization component with real-time preview capabilities.

**Configuration Sections:**
1. **Colors and Branding**
   - Predefined color schemes
   - Custom color pickers
   - Background colors

2. **Typography**
   - Font family selection
   - Font sizes and weights
   - Line height settings

3. **Layout and Spacing**
   - Container width
   - Section spacing
   - Border radius
   - Card styles

4. **Header and Footer**
   - Header styles
   - Logo positioning
   - Navigation style
   - Footer layout

**Usage Example:**
```javascript
const [templateConfig, setTemplateConfig] = useState({});

<TemplateCustomizer
  config={templateConfig}
  onConfigChange={setTemplateConfig}
/>
```

### GalleryAdvancedCustomizer_SIMPLE

Modal component for advanced gallery customization settings.

**Features:**
- Layout selection (grid, masonry, carousel)
- Styling options (spacing, borders, colors)
- Hover effects configuration
- Lightbox settings
- Advanced options (lazy loading, compression)

**Tabs:**
1. Layout - Gallery layout options
2. Style - Visual appearance settings
3. Effects - Hover animations
4. Lightbox - Lightbox behavior
5. Advanced - Performance options

### API Routes

The website API routes provide comprehensive endpoints for website management.

**Authentication:**
- Currently disabled for debugging (lines 21, 147 in server.js)
- Should be re-enabled with `verifyToken` middleware

**Key Routes:**

Website CRUD:
```javascript
GET    /api/website/list              // List websites
POST   /api/website/create            // Create website
GET    /api/website/:id               // Get website
PUT    /api/website/:id               // Update website
```

Pages Management:
```javascript
GET    /api/website/:id/pages         // List pages
POST   /api/website/:id/pages         // Create page
PUT    /api/website/:id/pages/:id     // Update page
```

File Upload:
```javascript
POST   /api/website/:id/upload        // Upload file
```

**Response Format:**
```javascript
// Success
{
  success: true,
  data: { /* response data */ }
}

// Error
{
  success: false,
  error: "Error message"
}
```

---

## Gallery System

### Complete Implementation Details

The gallery system is a comprehensive photo management solution with advanced customization options.

#### Database Schema

**wg_galleries Table:**
```sql
CREATE TABLE wg_galleries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_sito_web INT NOT NULL,
  id_pagina INT NULL,
  nome_galleria VARCHAR(255) NOT NULL,
  slug VARCHAR(200),
  descrizione TEXT,
  layout ENUM('grid-2', 'grid-3', 'grid-4', 'masonry', 'carousel'),
  impostazioni JSON DEFAULT '{}',
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**wg_gallery_images Table:**
```sql
CREATE TABLE wg_gallery_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_galleria INT NOT NULL,
  id_file INT NOT NULL,
  caption TEXT,
  alt_text VARCHAR(500),
  title_text VARCHAR(255),
  order_pos INT NOT NULL DEFAULT 0,
  impostazioni JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Frontend Integration

**Gallery Manager Component:**
```javascript
import ImageGalleryManager from './website/ImageGalleryManager';

<ImageGalleryManager
  images={images}
  onUpload={handleUpload}
  onDelete={handleDelete}
  galleryConfig={gallerySettings}
/>
```

**Gallery Customizer Integration:**
```javascript
import GalleryAdvancedCustomizer from './website/GalleryAdvancedCustomizer_SIMPLE';

// In TemplateCustomizer
const handleGalleryAdvanced = () => {
  setShowGalleryAdvanced(true);
};

// Modal usage
<GalleryAdvancedCustomizer
  config={config}
  onConfigChange={updateConfig}
  onClose={() => setShowGalleryAdvanced(false)}
/>
```

#### API Endpoints

**Gallery Operations:**
```javascript
// List galleries
GET /api/website/:siteId/galleries

// Create gallery
POST /api/website/:siteId/galleries
{
  "nome_galleria": "Gallery Name",
  "layout": "grid-3",
  "impostazioni": {}
}

// Update gallery
PUT /api/website/:siteId/galleries/:galleryId

// Delete gallery (soft delete)
DELETE /api/website/:siteId/galleries/:galleryId

// Add images to gallery
POST /api/website/:siteId/galleries/:galleryId/images
{
  "images": [
    {
      "id_file": 123,
      "caption": "Image caption",
      "alt_text": "Alt text"
    }
  ]
}
```

#### Configuration Options

**Layout Types:**
- `grid-2`: 2-column grid
- `grid-3`: 3-column grid (default)
- `grid-4`: 4-column grid
- `masonry`: Pinterest-style layout
- `carousel`: Slider layout

**Stling Options:**
- Spacing: compact, medium, spacious
- Border radius: none, small, medium, large
- Border color: custom color picker
- Shadow effects

**Effects:**
- Zoom on hover
- Shadow on hover
- Show captions on hover

**Lightbox:**
- Enable/disable
- Transition effects: fade, slide, zoom

**Advanced Options:**
- Lazy loading
- Image compression
- WebP format support
- Responsive images

### Public Gallery Access

For public website display, galleries can be accessed via:

```javascript
// Public gallery view
GET /api/public/website/:siteId/galleries/:galleryId

// Public gallery by slug
GET /api/public/website/:siteId/galleries/slug/:slug
```

---

## Best Practices

### Security Considerations

1. **Input Validation**
   ```javascript
   // Backend validation example
   const validateGalleryInput = (data) => {
     const schema = Joi.object({
       nome_galleria: Joi.string().max(255).required(),
       layout: Joi.string().valid('grid-2', 'grid-3', 'grid-4', 'masonry', 'carousel'),
       impostazioni: Joi.object()
     });

     return schema.validate(data);
   };
   ```

2. **SQL Injection Prevention**
   ```javascript
   // Use parameterized queries
   const [result] = await dbPool.execute(
     'SELECT * FROM siti_web_aziendali WHERE id = ?',
     [websiteId]
   );
   ```

3. **File Upload Security**
   ```javascript
   // File type validation
   const fileFilter = (req, file, cb) => {
     const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
     cb(null, allowedTypes.includes(file.mimetype));
   };
   ```

4. **Authentication & Authorization**
   ```javascript
   // Middleware example
   const requireWebsiteAccess = async (req, res, next) => {
     const websiteId = req.params.id;

     // Check user permissions
     const hasAccess = await checkWebsiteAccess(req.user.id, websiteId);

     if (!hasAccess) {
       return res.status(403).json({ error: 'Access denied' });
     }

     next();
   };
   ```

### Performance Optimization

1. **Database Optimization**
   ```javascript
   // Use indexes for common queries
   CREATE INDEX idx_siti_web_ditta ON siti_web_aziendali(id_ditta);
   CREATE INDEX idx_galleries_sito ON wg_galleries(id_sito_web, is_active);

   // Use joins efficiently
   const query = `
     SELECT g.*, COUNT(gi.id) as image_count
     FROM wg_galleries g
     LEFT JOIN wg_gallery_images gi ON g.id = gi.id_galleria
     WHERE g.id_sito_web = ?
     GROUP BY g.id
   `;
   ```

2. **Caching Strategy**
   ```javascript
   // Simple in-memory cache for frequent queries
   const cache = new Map();

   const getCachedWebsite = async (id) => {
     if (cache.has(id)) {
       return cache.get(id);
     }

     const website = await fetchWebsite(id);
     cache.set(id, website);

     // Clear cache after 5 minutes
     setTimeout(() => cache.delete(id), 300000);

     return website;
   };
   ```

3. **Image Optimization**
   ```javascript
   // S3 upload with compression
   const uploadOptimizedImage = async (file) => {
     // Compress image before upload
     const compressed = await compressImage(file, {
       quality: 80,
       maxWidth: 1920,
       format: 'webp'
     });

     // Upload to S3
     return await s3Upload(compressed);
   };
   ```

### Error Handling

1. **Consistent Error Responses**
   ```javascript
   // Error handling middleware
   const errorHandler = (err, req, res, next) => {
     console.error('Error:', err);

     // Don't expose internal errors in production
     const message = process.env.NODE_ENV === 'production'
       ? 'Internal server error'
       : err.message;

     res.status(err.status || 500).json({
       success: false,
       error: message,
       code: err.code || 'INTERNAL_ERROR'
     });
   };
   ```

2. **Frontend Error Boundaries**
   ```javascript
   class ErrorBoundary extends React.Component {
     constructor(props) {
       super(props);
       this.state = { hasError: false };
     }

     static getDerivedStateFromError(error) {
       return { hasError: true };
     }

     render() {
       if (this.state.hasError) {
         return <h1>Something went wrong.</h1>;
       }
       return this.props.children;
     }
   }
   ```

### Code Organization

1. **Service Layer Pattern**
   ```javascript
   // services/websiteService.js
   class WebsiteService {
     static async createWebsite(data) {
       // Business logic
       const validation = this.validateWebsiteData(data);
       if (!validation.isValid) {
         throw new Error(validation.error);
       }

       // Database operations
       return await this.saveWebsite(data);
     }

     static validateWebsiteData(data) {
       // Validation logic
     }
   }
   ```

2. **Custom Hooks**
   ```javascript
   // hooks/useWebsite.js
   export const useWebsite = (websiteId) => {
     const [website, setWebsite] = useState(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       fetchWebsite(websiteId)
         .then(setWebsite)
         .finally(() => setLoading(false));
     }, [websiteId]);

     return { website, loading };
   };
   ```

---

## API Reference

### Authentication

**Currently disabled for debugging purposes**

When enabled, all protected routes require:
```javascript
Authorization: Bearer <jwt_token>
```

### Website Endpoints

#### GET /api/website/list
Retrieve list of websites.

**Query Parameters:**
- `id_ditta` (optional): Filter by company ID
- `limit` (default: 50): Pagination limit
- `offset` (default: 0): Pagination offset
- `include_stats` (default: true): Include statistics

**Response:**
```javascript
{
  success: true,
  data: [
    {
      id: 1,
      id_ditta: 123,
      subdomain: "company1",
      domain_status: "active",
      site_title: "Company Website",
      template_config: {},
      created_at: "2025-12-08T10:00:00Z",
      stats: {
        pages_count: 5,
        published_pages: 3,
        galleries_count: 2,
        images_count: 25
      }
    }
  ],
  pagination: {
    total: 100,
    limit: 50,
    offset: 0,
    has_more: true
  }
}
```

#### POST /api/website/create
Create a new website.

**Request Body:**
```javascript
{
  ditta_id: 123,
  subdomain: "newwebsite",
  site_title: "New Website",
  template_id: 1,
  theme_config: {
    primary_color: "#3B82F6",
    font_family: "Inter"
  },
  catalog_settings: {
    enable_catalog: false
  }
}
```

**Response:**
```javascript
{
  success: true,
  sito_id: 456,
  message: "Website created successfully",
  url: "https://newwebsite.operocloud.it",
  website: { /* website data */ }
}
```

### Gallery Endpoints

#### GET /api/website/:siteId/galleries
List all galleries for a website.

**Response:**
```javascript
{
  success: true,
  data: [
    {
      id: 1,
      nome_galleria: "Gallery Name",
      slug: "gallery-name",
      layout: "grid-3",
      numero_immagini: 12,
      sort_order: 1,
      created_at: "2025-12-08T10:00:00Z"
    }
  ]
}
```

#### POST /api/website/:siteId/galleries
Create a new gallery.

**Request Body:**
```javascript
{
  nome_galleria: "New Gallery",
  descrizione: "Gallery description",
  layout: "grid-3",
  impostazioni: {
    spacing: "medium",
    border_radius: "small"
  },
  meta_title: "Gallery SEO Title",
  meta_description: "Gallery SEO Description"
}
```

#### POST /api/website/:siteId/galleries/:galleryId/images
Add images to a gallery.

**Request Body:**
```javascript
{
  images: [
    {
      id_file: 789,
      caption: "Image caption",
      alt_text: "Alt text for accessibility",
      title_text: "Image title",
      order_pos: 0
    }
  ]
}
```

### File Upload Endpoints

#### POST /api/website/:websiteId/upload
Upload a file to S3.

**Request:** multipart/form-data
- `file`: The file to upload
- `refId` (optional): Reference ID
- `refType` (optional): Reference type
- `privacy` (optional): Privacy level

**Response:**
```javascript
{
  success: true,
  file: {
    id_file: 789,
    file_name_originale: "image.jpg",
    previewUrl: "https://cdn.operocloud.it/path/to/image.jpg",
    url: "https://cdn.operocloud.it/path/to/image.jpg",
    tipo_file: "image/jpeg",
    dimensione_file: 2048576
  }
}
```

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```
   Error: ECONNREFUSED
   ```
   **Solution:** Check MySQL service is running and credentials in .env are correct

2. **S3 Upload Failures**
   ```
   Error: ENOTFOUND - S3 host not found
   ```
   **Solution:** Verify S3 endpoint and credentials in environment variables

3. **CORS Issues**
   ```
   Access to fetch at 'http://localhost:3001' has been blocked by CORS policy
   ```
   **Solution:** Check CORS configuration in server.js

4. **Migration Failures**
   ```
   Migration "20251208100000_create_wg_galleries_tables" failed
   ```
   **Solution:** Check SQL syntax and table dependencies

### Debug Mode

Enable debug logging by setting in .env:
```bash
DEBUG_SQL=true
DEBUG_S3=true
LOG_LEVEL=debug
```

### Testing API Endpoints

Use curl or Postman to test endpoints:

```bash
# Test website list
curl -X GET http://localhost:3001/api/website/list

# Test file upload
curl -X POST \
  -F "file=@test.jpg" \
  -F "refType=WEBSITE_IMAGES" \
  http://localhost:3001/api/website/1/upload
```

### Performance Monitoring

Monitor response times and errors:
```javascript
// Add to routes for monitoring
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});
```

### Database Maintenance

Regular maintenance tasks:
```sql
-- Optimize tables
OPTIMIZE TABLE siti_web_aziendali;
OPTIMIZE TABLE wg_galleries;

-- Check for orphaned records
SELECT * FROM wg_gallery_images
WHERE id_file NOT IN (SELECT id FROM dm_files);

-- Cleanup old activity logs
DELETE FROM website_activity_log
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

---

## Contributing Guidelines

### Code Review Process
1. Create feature branch from main
2. Make changes with proper documentation
3. Test thoroughly
4. Submit pull request
5. Code review and approval
6. Merge to main

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/gallery-improvements

# Make changes
git add .
git commit -m "feat: add gallery masonry layout"

# Push and create PR
git push origin feature/gallery-improvements
```

### Documentation Updates
- Update this manual for new features
- Add API documentation for new endpoints
- Include code examples
- Update database schema documentation

---

## Conclusion

This manual provides a comprehensive overview of the Opero Website Builder system. For additional information or questions about specific implementations, please refer to the inline code documentation or contact the development team.

### Contact Information
- Development Team: [dev@opero.it](mailto:dev@opero.it)
- Documentation: [docs@opero.it](mailto:docs@opero.it)
- Support: [support@opero.it](mailto:support@opero.it)

### Version History
- v1.0 - December 2025 - Initial release
- Future versions will be documented with change logs