import { describe, it, expect } from 'vitest';
import { getNextPhotoIndex, getPrevPhotoIndex, getSwipeDirection } from '../src/lib/carousel';
import { DEFAULT_HIGHLIGHT_CLASS } from '../src/components/HighlightText';

describe('Task: Carousel Navigation, Touch Swiping & Strong Search Highlight', () => {
  describe('Carousel Index Calculations', () => {
    it('should cycle to next photo and loop back to 0 at the end', () => {
      expect(getNextPhotoIndex(0, 3)).toBe(1);
      expect(getNextPhotoIndex(1, 3)).toBe(2);
      expect(getNextPhotoIndex(2, 3)).toBe(0);
      expect(getNextPhotoIndex(0, 1)).toBe(0);
      expect(getNextPhotoIndex(0, 0)).toBe(0);
    });

    it('should cycle to previous photo and loop to the last photo from 0', () => {
      expect(getPrevPhotoIndex(0, 3)).toBe(2);
      expect(getPrevPhotoIndex(2, 3)).toBe(1);
      expect(getPrevPhotoIndex(1, 3)).toBe(0);
      expect(getPrevPhotoIndex(0, 1)).toBe(0);
      expect(getPrevPhotoIndex(0, 0)).toBe(0);
    });
  });

  describe('Mobile Touch Swipe Detection', () => {
    it('should detect swipe left for next photo when drag distance exceeds threshold', () => {
      // touchStartX: 250, touchEndX: 150 -> distance 100 to the left
      expect(getSwipeDirection(250, 150, 40)).toBe('left');
    });

    it('should detect swipe right for previous photo when drag distance exceeds threshold', () => {
      // touchStartX: 100, touchEndX: 200 -> distance 100 to the right
      expect(getSwipeDirection(100, 200, 40)).toBe('right');
    });

    it('should return null if movement is below min threshold (not an intentional swipe)', () => {
      expect(getSwipeDirection(100, 120, 40)).toBeNull();
      expect(getSwipeDirection(100, 95, 40)).toBeNull();
    });
  });

  describe('Search Highlight Visual Contrast', () => {
    it('should use strong high-contrast yellow/amber highlight styling', () => {
      expect(DEFAULT_HIGHLIGHT_CLASS).toContain('bg-amber-300');
      expect(DEFAULT_HIGHLIGHT_CLASS).toContain('text-amber-950');
      expect(DEFAULT_HIGHLIGHT_CLASS).toContain('font-black');
    });
  });
});
