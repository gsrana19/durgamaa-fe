import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllImages } from '../services/api';

const ConstructionImagesGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await getAllImages();
      setImages(data);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (image) => {
    const firstImageUrl = (image.imageUrls && image.imageUrls.length > 0) 
      ? image.imageUrls[0] 
      : image.imageUrl;
    setSelectedImage({
      url: firstImageUrl,
      title: image.title || 'Temple Construction',
      date: image.createdAt
    });
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => {
      const imgUrl = (img.imageUrls && img.imageUrls.length > 0) 
        ? img.imageUrls[0] 
        : img.imageUrl;
      return imgUrl === selectedImage.url;
    });
    
    if (currentIndex === -1) return;
    
    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % images.length
      : (currentIndex - 1 + images.length) % images.length;
    
    const nextImage = images[nextIndex];
    const nextImageUrl = (nextImage.imageUrls && nextImage.imageUrls.length > 0) 
      ? nextImage.imageUrls[0] 
      : nextImage.imageUrl;
    
    setSelectedImage({
      url: nextImageUrl,
      title: nextImage.title || 'Temple Construction',
      date: nextImage.createdAt
    });
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (selectedImage) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateImage('prev');
        if (e.key === 'ArrowRight') navigateImage('next');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, images]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-saffron-50 to-white">
      {/* Header */}
      <div className="bg-saffron-600 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">🖼️ Construction Images Gallery</h1>
              <p className="text-base md:text-lg text-saffron-100">
                View all images from our temple construction progress
              </p>
            </div>
            <Link
              to="/mandir-nirmaan-seva"
              className="px-6 py-3 bg-white text-saffron-600 rounded-lg hover:bg-gray-100 transition font-semibold text-base md:text-lg"
            >
              ← Back to Updates
            </Link>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading images...</div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <div className="text-6xl mb-4">🖼️</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No images uploaded yet.</h2>
            <p className="text-gray-500">Please check back soon for construction updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {images.map((image, index) => {
              const imageUrl = (image.imageUrls && image.imageUrls.length > 0) 
                ? image.imageUrls[0] 
                : image.imageUrl;
              
              if (!imageUrl) return null;
              
              return (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 hover:border-saffron-400 transition-all hover:shadow-lg"
                  onClick={() => openLightbox(image)}
                >
                  <img
                    src={imageUrl}
                    alt={image.title || 'Temple Construction'}
                    className="w-full h-48 md:h-64 object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end">
                    {image.title && (
                      <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity w-full bg-gradient-to-t from-black/60 to-transparent">
                        <h3 className="text-sm font-semibold truncate">{image.title}</h3>
                        <p className="text-xs text-gray-200">
                          {new Date(image.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-7xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-saffron-400 text-4xl font-bold z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
            >
              ×
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-saffron-400 text-4xl font-bold z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-saffron-400 text-4xl font-bold z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                >
                  ›
                </button>
              </>
            )}

            {/* Image */}
            <div onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h3>
                <p className="text-gray-300">
                  {new Date(selectedImage.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Keyboard Hint */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 text-white/60 text-sm">
                Use ← → arrow keys to navigate
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionImagesGallery;

