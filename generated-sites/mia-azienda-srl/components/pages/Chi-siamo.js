
import React from 'react';
import Image from 'next/image';
import HeroSection from '../sections/HeroSection';
import TextSection from '../sections/TextSection';
import ImageSection from '../sections/ImageSection';
import ContactSection from '../sections/ContactSection';
import GallerySection from '../sections/GallerySection';

export default function Chi-siamo({ content }) {
  if (!content || !content.sections) {
    return <div>Nessun contenuto disponibile</div>;
  }

  return (
    <main>
      {content.sections.map((section, index) => {
        const SectionComponent = getSectionComponent(section.type);
        return SectionComponent ? (
          <SectionComponent key={section.id || index} data={section} />
        ) : null;
      })}
    </main>
  );
}

function getSectionComponent(type) {
  const components = {
    hero: HeroSection,
    text: TextSection,
    image: ImageSection,
    contact: ContactSection,
    gallery: GallerySection
  };

  return components[type];
}
