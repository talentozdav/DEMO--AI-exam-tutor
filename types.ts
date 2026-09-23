
export type ExamType = 'WAEC' | 'NECO' | 'JAMB';

export interface Subject {
  id: string;
  name: string;
  exam: ExamType;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  title: string;
  content: string;
}

export interface ScoreEntry {
  examType: ExamType;
  subject: string;
  score: number;
  total: number;
  timestamp: number;
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  activeDates: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  exams: ExamType[];
  selectedSubjects: Record<ExamType, string[]>;
  examDates: Record<ExamType, string>;
  weakSubjects: string[];
  isSubscribed?: boolean;
  trialStartedAt?: number;
  isPremium?: boolean;
  scores?: ScoreEntry[];
  studyStreak?: StudyStreak;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  activeReferralCount?: number;
  referrals?: string[];
  referralRewardsClaimed?: boolean;
  createdAt?: number;
  subscription?: {
    plan: string;
    expiresAt: string;
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Question {
  id: string;
  subjectId: string;
  examType: ExamType;
  year: number;
  text: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  type: 'OBJ' | 'THEORY';
}

export interface StudyPlanItem {
  id: string;
  time: string;
  task: string;
  subject: string;
  completed: boolean;
}
