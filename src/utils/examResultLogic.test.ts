import { describe, test, expect } from 'bun:test';
import {
  calculateSubjectGrade,
  calculateOverallResult,
  INITIAL_STUDENT_EXAM_RESULTS,
  GRADING_SCALE_TIERS,
} from './examResultLogic';

describe('examResultLogic tests', () => {
  test('calculateSubjectGrade accurately assigns grades and points based on percentage', () => {
    // 80%+ -> A+ (5.0)
    const resAplus = calculateSubjectGrade(48, 50); // 96%
    expect(resAplus.letterGrade).toBe('A+');
    expect(resAplus.gradePoint).toBe(5.0);

    // 70-79% -> A (4.0)
    const resA = calculateSubjectGrade(37, 50); // 74%
    expect(resA.letterGrade).toBe('A');
    expect(resA.gradePoint).toBe(4.0);

    // 60-69% -> A- (3.5)
    const resAminus = calculateSubjectGrade(32, 50); // 64%
    expect(resAminus.letterGrade).toBe('A-');
    expect(resAminus.gradePoint).toBe(3.5);

    // 50-59% -> B (3.0)
    const resB = calculateSubjectGrade(27, 50); // 54%
    expect(resB.letterGrade).toBe('B');
    expect(resB.gradePoint).toBe(3.0);

    // 40-49% -> C (2.0)
    const resC = calculateSubjectGrade(22, 50); // 44%
    expect(resC.letterGrade).toBe('C');
    expect(resC.gradePoint).toBe(2.0);

    // Below 40% -> F (0.0)
    const resF = calculateSubjectGrade(15, 50); // 30%
    expect(resF.letterGrade).toBe('F');
    expect(resF.gradePoint).toBe(0.0);
  });

  test('calculateOverallResult computes totals, percentages, GPA and overall grade', () => {
    const subjects = [
      {
        subjectCode: 's1',
        subjectNameBn: 'বাংলা',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 48,
        highestMarksInClass: 50,
        letterGrade: 'A+',
        gradePoint: 5.0,
      },
      {
        subjectCode: 's2',
        subjectNameBn: 'গণিত',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 45,
        highestMarksInClass: 48,
        letterGrade: 'A+',
        gradePoint: 5.0,
      },
    ];

    const overall = calculateOverallResult(subjects);
    expect(overall.totalMarks).toBe(100);
    expect(overall.totalObtained).toBe(93);
    expect(overall.percentage).toBe(93.0);
    expect(overall.gpa).toBe(5.0);
    expect(overall.overallGrade).toBe('A+');
    expect(overall.status).toBe('passed');
  });

  test('calculateOverallResult handles failures properly', () => {
    const subjects = [
      {
        subjectCode: 's1',
        subjectNameBn: 'বাংলা',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 48,
        highestMarksInClass: 50,
        letterGrade: 'A+',
        gradePoint: 5.0,
      },
      {
        subjectCode: 's2',
        subjectNameBn: 'গণিত',
        totalMarks: 50,
        passMarks: 20,
        obtainedMarks: 15, // Failed below 20
        highestMarksInClass: 48,
        letterGrade: 'F',
        gradePoint: 0.0,
      },
    ];

    const overall = calculateOverallResult(subjects);
    expect(overall.gpa).toBe(0.0);
    expect(overall.overallGrade).toBe('F');
    expect(overall.status).toBe('needs_improvement');
  });

  test('INITIAL_STUDENT_EXAM_RESULTS contains comprehensive results for demo students', () => {
    expect(INITIAL_STUDENT_EXAM_RESULTS.length).toBeGreaterThanOrEqual(6);
    const adityaResult = INITIAL_STUDENT_EXAM_RESULTS.find((r) => r.studentId === 'std-1');
    expect(adityaResult).toBeDefined();
    expect(adityaResult?.className).toBe('Nursery');
    expect(adityaResult?.overallGrade).toBe('A+');
    expect(adityaResult?.subjects.length).toBe(5);
  });
});
