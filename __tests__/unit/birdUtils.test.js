import { getRarityWeight, formatBirdName } from '../../utils/birdUtils';

describe('birdUtils', () => {
  describe('getRarityWeight', () => {
    test('returns 3 for rare', () => {
      expect(getRarityWeight('rare')).toBe(3);
      expect(getRarityWeight('RARE')).toBe(3);
    });

    test('returns 2 for uncommon', () => {
      expect(getRarityWeight('uncommon')).toBe(2);
    });

    test('returns 1 for common', () => {
      expect(getRarityWeight('common')).toBe(1);
    });

    test('returns 0 for unknown or null', () => {
      expect(getRarityWeight('mythical')).toBe(0);
      expect(getRarityWeight(null)).toBe(0);
    });
  });

  describe('formatBirdName', () => {
    test('capitalizes bird names correctly', () => {
      expect(formatBirdName('AMERICAN ROBIN')).toBe('American Robin');
      expect(formatBirdName('blue jay')).toBe('Blue Jay');
    });

    test('handles whitespace', () => {
      expect(formatBirdName('  sparrow  ')).toBe('Sparrow');
    });

    test('returns Unknown Bird for empty input', () => {
      expect(formatBirdName('')).toBe('Unknown Bird');
      expect(formatBirdName(null)).toBe('Unknown Bird');
    });
  });
});
