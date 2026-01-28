import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import './ImageModal.css';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  imageAlt: string;
  onClose: () => void;
}

export function ImageModal({ isOpen, imageUrl, imageAlt, onClose }: ImageModalProps) {
  // Handle keyboard event (ESC key)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Add event listener
      window.addEventListener('keydown', handleKeyDown);
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // Handle click outside modal (on the overlay)
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="image-modal-overlay" onClick={handleOverlayClick}>
      <div className="image-modal-container">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="image-modal-close"
          aria-label="Close modal"
          title="Close (ESC)"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Image Container */}
        <div className="image-modal-content">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="image-modal-image"
          />
        </div>
      </div>
    </div>
  );
}
