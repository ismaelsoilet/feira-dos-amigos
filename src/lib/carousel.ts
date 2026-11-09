/**
 * Carousel navigation & mobile touch swipe utilities
 */

export function getNextPhotoIndex(current: number, total: number): number {
  if (total <= 1) return 0;
  return (current + 1) % total;
}

export function getPrevPhotoIndex(current: number, total: number): number {
  if (total <= 1) return 0;
  return (current - 1 + total) % total;
}

export function getSwipeDirection(
  touchStartX: number,
  touchEndX: number,
  minDistance = 40
): 'left' | 'right' | null {
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) < minDistance) {
    return null;
  }
  return diff > 0 ? 'left' : 'right';
}
