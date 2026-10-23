'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './ImageViewer.module.css';

interface ImageInfo {
  src: string;
  alt: string;
}

interface ImageViewerProps {
  images: ImageInfo[];
}

export default function ImageViewer({ images }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const openLightbox = useCallback(
    (index: number, trigger: HTMLElement | null) => {
      setCurrentIndex(index);
      lastTriggerRef.current = trigger;
      setIsOpen(true);
    },
    []
  );

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (e.key === 'ArrowRight') {
        nextImage();
        return;
      }
      if (e.key === 'ArrowLeft') {
        prevImage();
        return;
      }
      if (e.key === 'Tab') {
        // Keep focus cycling inside the lightbox controls.
        const content = e.target as HTMLElement;
        const root = content.closest(`.${styles.lightboxContent}`) as HTMLElement | null;
        if (!root) return;
        const focusable = Array.from(
          root.querySelectorAll<HTMLElement>('button:not([disabled])')
        );
        if (focusable.length < 2) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [isOpen, closeLightbox, nextImage, prevImage]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus the lightbox when it opens; return focus to the trigger on close.
  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus();
    } else if (lastTriggerRef.current) {
      lastTriggerRef.current.focus();
      lastTriggerRef.current = null;
    }
  }, [isOpen]);

  return (
    <>
      {/* Thumbnail gallery */}
      <section className={styles.images}>
        <div className={styles.grid}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.src}
              alt={img.alt}
              className={styles.thumb}
              style={{ cursor: 'pointer' }}
              loading="lazy"
              tabIndex={0}
              role="button"
              aria-label={`Open enlarged view of ${img.alt}`}
              onClick={(e) => openLightbox(idx, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(idx, e.currentTarget);
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* Lightbox modal */}
      {isOpen && images.length > 0 && (
        <div
          className={styles.overlay}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              ref={closeRef}
              className={styles.close}
              onClick={closeLightbox}
              aria-label="Close image viewer"
            >
              ×
            </button>
            <button
              className={styles.prev}
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
            <img
              className={styles.lightboxImage}
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
            />
            <button
              className={styles.next}
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
            >
              ›
            </button>
            <div className={styles.counter} aria-live="polite">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
