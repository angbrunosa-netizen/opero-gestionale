/**
 * Nome File: BlockRegistry.js
 * Percorso: components/BlockRegistry.js
 * Data: 15/12/2025
 * Versione: 1.0.0
 * Descrizione: Mappa i codici DB ai componenti React.
 */
import dynamic from 'next/dynamic';

// Importazione dinamica (Lazy Loading) per performance ottimali
const HeroBlock = dynamic(() => import('./blocks/HeroBlock'));
const VetrinaBlock = dynamic(() => import('./blocks/VetrinaBlock'));
const HtmlBlock = dynamic(() => import('./blocks/HtmlBlock'));
const MapsBlock = dynamic(() => import('./blocks/MapsBlock'));
const MediaSocialBlock = dynamic(() => import('./blocks/MediaSocialBlock'));
const BlogListBlock = dynamic(() => import('./blocks/BlogListBlock'));
const CatalogSelectionBlock = dynamic(() => import('./blocks/CatalogSelectionBlock'));
const FlipCardGalleryBlock = dynamic(() => import('./blocks/FlipCardGalleryBlock'));
const DynamicImageGalleryBlock = dynamic(() => import('./blocks/DynamicImageGalleryBlock'));

// Mappa: Nome nel Database -> Componente React
export const BLOCK_REGISTRY = {
  'HERO': HeroBlock,
  'VETRINA': VetrinaBlock,
  'HTML': HtmlBlock,
  'MAPS': MapsBlock,
  'MEDIA_SOCIAL': MediaSocialBlock,
  'BLOG_LIST': BlogListBlock,
  'CATALOG_SELECTION': CatalogSelectionBlock,
  'FLIP_CARD_GALLERY': FlipCardGalleryBlock,
  'DYNAMIC_IMAGE_GALLERY': DynamicImageGalleryBlock,
};