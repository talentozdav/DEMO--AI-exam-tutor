
import { ExamType, Question, StudyPlanItem } from './types';

export const EXAM_METADATA: Record<ExamType, { fullName: string; color: string }> = {
  WAEC: { fullName: 'West African Examinations Council', color: 'blue' },
  NECO: { fullName: 'National Examinations Council', color: 'indigo' },
  JAMB: { fullName: 'Joint Admissions and Matriculation Board', color: 'emerald' },
};

export const SUBJECTS_LIST = [
  'Mathematics',
  'English Language',
  'Biology',
  'Chemistry',
  'Physics',
  'Economics',
  'Government',
  'Literature-in-English',
  'Commerce',
  'Agricultural Science'
];

export const MOCK_STUDY_PLAN: StudyPlanItem[] = [
  { id: '1', time: '09:00 AM', task: 'Review Trigonometry Identities', subject: 'Mathematics', completed: false },
  { id: '2', time: '11:00 AM', task: 'Biology Past Questions (2022)', subject: 'Biology', completed: true },
  { id: '3', time: '02:00 PM', task: 'Essay Writing Practice: Formal Letter', subject: 'English Language', completed: false },
  { id: '4', time: '04:00 PM', task: 'Chemistry: Organic Compounds', subject: 'Chemistry', completed: false },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    subjectId: 'Maths',
    examType: 'JAMB',
    year: 2023,
    text: 'If log 2 = 0.3010 and log 3 = 0.4771, evaluate log 4.5.',
    options: ['0.6532', '0.6631', '0.6021', '0.5532'],
    correctAnswer: '0.6532',
    explanation: 'log 4.5 = log (9/2) = log 9 - log 2 = log 3^2 - log 2 = 2log 3 - log 2 = 2(0.4771) - 0.3010 = 0.9542 - 0.3010 = 0.6532.',
    type: 'OBJ'
  },
  {
    id: 'q2',
    subjectId: 'Physics',
    examType: 'WAEC',
    year: 2021,
    text: 'Explain why a clinical thermometer has a constriction in its stem.',
    correctAnswer: 'To prevent the backflow of mercury into the bulb when the thermometer is removed from the patient\'s body, allowing the temperature to be read.',
    explanation: 'The constriction (or kink) creates a break in the mercury column when it contracts, holding the reading at the highest point reached.',
    type: 'THEORY'
  }
];
