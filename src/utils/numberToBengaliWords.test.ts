import { describe, test, expect } from 'bun:test';
import { convertNumberToBengaliWords } from './numberToBengaliWords';

describe('numberToBengaliWords tests', () => {
  test('converts numbers accurately to formal Bengali currency words', () => {
    expect(convertNumberToBengaliWords(0)).toBe('শূন্য টাকা মাত্র');
    expect(convertNumberToBengaliWords(500)).toBe('পাঁচ শত টাকা মাত্র');
    expect(convertNumberToBengaliWords(4200)).toBe('চার হাজার দুই শত টাকা মাত্র');
    expect(convertNumberToBengaliWords(5000)).toBe('পাঁচ হাজার টাকা মাত্র');
    expect(convertNumberToBengaliWords(12500)).toBe('বারো হাজার পাঁচ শত টাকা মাত্র');
    expect(convertNumberToBengaliWords(25000)).toBe('পঁচিশ হাজার টাকা মাত্র');
  });
});
