import { auth } from "../firebase";
import { ExamType, Question } from "../types";

// Helper to get fresh Firebase Auth token
async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) {
    return { 'Content-Type': 'application/json' };
  }
  try {
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (err) {
    console.error("Failed to acquire ID token:", err);
    return { 'Content-Type': 'application/json' };
  }
}

/**
 * Ask the AI Tutor via secure server-side Cloud Function.
 */
export const getTutorResponse = async (
  message: string, 
  examType: ExamType, 
  subject: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  image?: { data: string; mimeType: string }
): Promise<string> => {
  try {
    const headers = await getAuthHeader();
    const res = await fetch('/api/askAITutor', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        examType,
        subject,
        chatHistory,
        image
      })
    });

    const data = await res.json();
    if (!res.ok) {
      if (data.error === 'TRIAL_EXPIRED') {
        window.dispatchEvent(new CustomEvent('trial-expired'));
        return "⚠️ Your 3-day free trial has expired. Please upgrade for ₦1,000/month to continue unlimited AI tutoring.";
      }
      return data.message || "I encountered a problem processing your request. Please try again.";
    }

    return data.response || "I'm sorry, I couldn't generate a response. Please rephrase your question.";
  } catch (error) {
    console.error("AI Tutor API Error:", error);
    return "I encountered a network glitch. Please check your internet connection and try again.";
  }
};

/**
 * Generate syllabus-aligned practice questions via secure server-side Cloud Function.
 */
export const generatePracticeQuestions = async (
  count: number,
  examType: ExamType,
  subject: string,
  type: 'OBJ' | 'THEORY' = 'OBJ'
): Promise<Question[]> => {
  try {
    const headers = await getAuthHeader();
    const res = await fetch('/api/generateQuestions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        count,
        examType,
        subject,
        type
      })
    });

    const data = await res.json();
    if (!res.ok) {
      if (data.error === 'TRIAL_EXPIRED') {
        window.dispatchEvent(new CustomEvent('trial-expired'));
      }
      console.warn("Server generation warning:", data.message);
      return [];
    }

    return (data.questions || []).map((q: any) => ({
      ...q,
      examType: q.examType as ExamType,
      type: q.type as 'OBJ' | 'THEORY'
    }));
  } catch (error) {
    console.error("Question generation API error:", error);
    return [];
  }
};

/**
 * Analyze student essay/theory answer via secure server-side Cloud Function.
 */
export const analyzeEssay = async (
  question: string,
  answer: string,
  examType: ExamType
) => {
  try {
    const headers = await getAuthHeader();
    const res = await fetch('/api/submitEssay', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        question,
        answer,
        examType
      })
    });

    const data = await res.json();
    if (!res.ok) {
      if (data.error === 'TRIAL_EXPIRED') {
        window.dispatchEvent(new CustomEvent('trial-expired'));
      }
      return null;
    }

    return data.feedback || null;
  } catch (error) {
    console.error("Essay analysis API error:", error);
    return null;
  }
};

/**
 * Generate smart personalized study plan via secure server-side Cloud Function.
 */
export const getSmartStudyPlan = async (profile: any) => {
  try {
    const headers = await getAuthHeader();
    const res = await fetch('/api/getSmartStudyPlan', {
      method: 'POST',
      headers,
      body: JSON.stringify({ profile })
    });

    const data = await res.json();
    return data.plan || [];
  } catch (error) {
    console.error("Study plan API error:", error);
    return [];
  }
};
