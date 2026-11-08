import { describe, test, expect } from 'bun:test';
import {
  calculateBmi,
  INITIAL_STUDENT_HEALTH_PROFILES,
} from './healthLogic';

describe('healthLogic tests', () => {
  test('calculateBmi accurately calculates BMI and classifies childhood growth status', () => {
    // Height: 92 cm, Weight: 13.5 kg -> BMI = 13.5 / (0.92 * 0.92) = 15.95 -> Normal
    const resNormal = calculateBmi(92.0, 13.5);
    expect(resNormal.bmi).toBe(15.9);
    expect(resNormal.statusBn).toContain('স্বাভাবিক');

    // Height: 100 cm, Weight: 11 kg -> BMI = 11.0 -> Underweight
    const resUnder = calculateBmi(100.0, 11.0);
    expect(resUnder.bmi).toBe(11.0);
    expect(resUnder.statusBn).toContain('কম ওজন');

    // Height: 100 cm, Weight: 18 kg -> BMI = 18.0 -> Overweight
    const resOver = calculateBmi(100.0, 18.0);
    expect(resOver.bmi).toBe(18.0);
    expect(resOver.statusBn).toContain('ভারী');

    // Invalid values
    const resInvalid = calculateBmi(0, 0);
    expect(resInvalid.bmi).toBe(0);
    expect(resInvalid.statusBn).toBe('তথ্য অসম্পূর্ণ');
  });

  test('INITIAL_STUDENT_HEALTH_PROFILES contains comprehensive health and allergy data', () => {
    expect(INITIAL_STUDENT_HEALTH_PROFILES.length).toBeGreaterThanOrEqual(6);

    // std-1 (Aditya Roy) must have critical Peanut & Shrimp allergy
    const aditya = INITIAL_STUDENT_HEALTH_PROFILES.find((p) => p.studentId === 'std-1');
    expect(aditya).toBeDefined();
    expect(aditya?.bloodGroup).toBe('B+');
    expect(aditya?.allergiesList.length).toBeGreaterThanOrEqual(2);
    expect(aditya?.criticalHealthAlertBn).toContain('সতর্কতা');

    // Check vaccinations
    expect(aditya?.vaccinations.length).toBeGreaterThanOrEqual(5);
    expect(aditya?.growthHistory.length).toBeGreaterThanOrEqual(2);
  });
});
