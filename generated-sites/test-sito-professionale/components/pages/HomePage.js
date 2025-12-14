
import React from 'react';

export default function HomePage({ content }) {
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
  // Questi componenti verranno generati dinamicamente
  const components = {
    hero: (props) => <div>Hero Section: {JSON.stringify(props)}</div>,
    text: (props) => <div>Text Section: {JSON.stringify(props)}</div>,
    image: (props) => <div>Image Section: {JSON.stringify(props)}</div>,
    contact: (props) => <div>Contact Section: {JSON.stringify(props)}</div>,
    gallery: (props) => <div>Gallery Section: {JSON.stringify(props)}</div>
  };

  return components[type];
}
