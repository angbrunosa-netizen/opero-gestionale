// components/ImageGallery.js
import React, { useState, useEffect, useRef } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ 
  images = [], 
  transitionEffect = 'fade', 
  autoPlay = false, 
  interval = 3000,
  showControls = true,
  selectable = false,
  selectedImages = [],
  onSelectionChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [selection, setSelection] = useState(selectedImages);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
      }, interval);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, interval, images.length]);

  useEffect(() => {
    setSelection(selectedImages);
  }, [selectedImages]);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleImageSelection = (imageId) => {
    if (!selectable) return;
    
    let newSelection;
    if (selection.includes(imageId)) {
      newSelection = selection.filter(id => id !== imageId);
    } else {
      newSelection = [...selection, imageId];
    }
    
    setSelection(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  if (images.length === 0) {
    return <div className="image-gallery empty">Nessuna immagine disponibile</div>;
  }

  return (
    <div className="image-gallery">
      <div className={`gallery-slide ${transitionEffect}`}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`slide ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image.url})` }}
          >
            {selectable && (
              <div 
                className={`selection-checkbox ${selection.includes(image.id) ? 'selected' : ''}`}
                onClick={() => toggleImageSelection(image.id)}
              >
                {selection.includes(image.id) && '✓'}
              </div>
            )}
            <div className="slide-caption">
              <h3>{image.titolo}</h3>
              {image.descrizione && <p>{image.descrizione}</p>}
            </div>
          </div>
        ))}
      </div>

      {showControls && (
        <div className="gallery-controls">
          <button className="control-btn prev" onClick={goToPrevious}>
            &#10094;
          </button>
          <button className="control-btn next" onClick={goToNext}>
            &#10095;
          </button>
          {autoPlay && (
            <button className="control-btn play-pause" onClick={togglePlayPause}>
              {isPlaying ? '❚❚' : '▶'}
            </button>
          )}
        </div>
      )}

      <div className="gallery-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;