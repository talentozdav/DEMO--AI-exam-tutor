
import { GoogleGenAI, Type } from "@google/genai";
import { ExamType, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SUBJECT_PROMPTS: Record<string, { WAEC: string; JAMB: string }> = {
  'Mathematics': {
    WAEC: "Expert WAEC Math tutor. Focus on structured theory answers and method marks. Show intermediate steps clearly.",
    JAMB: "JAMB Math CBT coach. Focus on speed, mental math shortcuts, and rapid option elimination."
  },
  'English Language': {
    WAEC: "WAEC English Examiner. Focus on formal essay structure, grammar precision, and marker-friendly vocabulary.",
    JAMB: "JAMB English CBT specialist. Focus on distractor analysis, keyword spotting, and grammar traps."
  },
  'Biology': {
    WAEC: "WAEC Biology tutor. Emphasize precise definitions and describing diagrams in detail for theory papers.",
    JAMB: "JAMB Biology CBT coach. Focus on classification, keyword associations, and frequently tested biological facts."
  },
  'Chemistry': {
    WAEC: "WAEC Chemistry tutor. Prioritize balanced equations, step-by-step calculations with units, and qualitative analysis reasoning.",
    JAMB: "JAMB Chemistry CBT coach. Focus on quick formula recall, periodic trends, and identifying reaction products fast."
  },
  'Physics': {
    WAEC: "WAEC Physics tutor. Focus on unit consistency, formula derivation steps, and logical progression for theory marks.",
    JAMB: "JAMB Physics CBT coach. Focus on unit analysis shortcuts and proportional reasoning for quick calculation."
  },
  'Literature-in-English': {
    WAEC: "WAEC Literature examiner. Focus on thematic analysis and character depth with textual evidence.",
    JAMB: "JAMB Literature CBT specialist. Focus on plot recall, literary devices, and distinguishing similar terms."
  },
  'Government': {
    WAEC: "WAEC Government tutor. Focus on structured bullet-point explanations of political concepts.",
    JAMB: "JAMB Government CBT coach. Focus on constitutional history and institutional functions."
  }
};

const SYLLABUS_INTEGRITY_PROMPT = `
You are DEMO – Digital Exam Mentor, an expert secondary school tutor for Nigerian examinations (WAEC, NECO, JAMB).
You must provide syllabus-aligned, supportive, and encouraging academic guidance.

STRICT RULES:
1. NEVER copy or imitation real past questions. Generate ONLY original "exam-style" practice content.
2. NEVER reference exam years (e.g., 'JAMB 2015') or paper codes.
3. NEVER help with live ongoing exams (malpractice prevention).
4. Maintain a tone like a patient Nigerian secondary school teacher: clear, authoritative, yet encouraging.

Target Exam Context:
- WAEC/NECO: Prioritize theory structure, definitions, and step-by-step clarity for maximum marks.
- JAMB: Prioritize CBT logic, speed, eliminating wrong options, and core concepts.
`;

export const getTutorResponse = async (
  message: string, 
  examType: ExamType, 
  subject: string,
  chatHistory: { role: 'user' | 'assistant', content: string }[],
  image?: { data: string; mimeType: string }
) => {
  const model = 'gemini-3-pro-preview';
  
  const baseSubject = subject.includes('Government') ? 'Government' : subject;
  const subjectPromptObj = SUBJECT_PROMPTS[baseSubject] || SUBJECT_PROMPTS['Mathematics']; 
  const subjectLayer = examType === 'JAMB' ? subjectPromptObj.JAMB : subjectPromptObj.WAEC;

  const systemInstruction = `${SYLLABUS_INTEGRITY_PROMPT}\n\nTarget Subject: ${subject}\nExam Mode: ${examType}\nSpecial Instructions: ${subjectLayer}${image ? '\n\nAn image is provided. If it contains a diagram or handwriting, solve it using syllabus-appropriate methods.' : ''}`;

  const parts: any[] = [];
  if (image) {
    parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }
  parts.push({ text: message });

  const contents = [
    ...chatHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    { role: 'user', parts }
  ];

  try {
    const response = await ai.models.generateContent({
      model,
      contents: contents as any,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text || "I'm sorry, I couldn't generate a response. Please rephrase your question.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I encountered a technical glitch while thinking. Please check your data connection and try again.";
  }
};

export const generatePracticeQuestions = async (
  count: number,
  examType: ExamType,
  subject: string,
  type: 'OBJ' | 'THEORY' = 'OBJ'
): Promise<Question[]> => {
  const model = 'gemini-3-pro-preview';
  
  let typeSpecificPrompt = '';
  if (type === 'OBJ') {
    typeSpecificPrompt = `
      Create original ${examType}-style multiple choice questions.
      - 4 options (A–D).
      - Accurate distractor logic.
      - Brief explanation of WHY the correct answer is right.
    `;
  } else {
    typeSpecificPrompt = `
      Create original ${examType}-style theory/essay questions.
      - Provide a Marking Scheme including: [Introduction], [Body/Key Points], [Conclusion].
    `;
  }

  const prompt = `Generate ${count} original ${examType} ${type} questions for ${subject}.\n${typeSpecificPrompt}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYLLABUS_INTEGRITY_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  subjectId: { type: Type.STRING },
                  examType: { type: Type.STRING },
                  year: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ["id", "subjectId", "examType", "year", "text", "correctAnswer", "explanation", "type"]
              }
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"questions": []}');
    return (parsed.questions || []).map((q: any) => ({
      ...q,
      examType: q.examType as ExamType,
      type: q.type as 'OBJ' | 'THEORY'
    }));
  } catch (error) {
    console.error("Question Generation Error:", error);
    return [];
  }
};

export const analyzeEssay = async (
  question: string,
  answer: string,
  examType: ExamType
) => {
  const model = 'gemini-3-pro-preview';
  
  const prompt = `Analyze this student's response for a ${examType} question: "${question}".\nStudent Answer: "${answer}"`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are an official examiner. Grade strictly but fairly based on syllabus marking points.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            modelAnswer: { type: Type.STRING }
          },
          required: ["score", "feedback", "strengths", "weakAreas", "suggestions", "modelAnswer"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
};

export const getSmartStudyPlan = async (profile: any) => {
  const model = 'gemini-3-flash-preview';
  const prompt = `Create a 4-item study schedule for today based on:
  Exams: ${profile.exams.join(', ')}
  Subjects: ${Object.values(profile.selectedSubjects).flat().join(', ')}
  Weak subjects: ${profile.weakSubjects.join(', ')}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              subject: { type: Type.STRING },
              task: { type: Type.STRING }
            },
            propertyOrdering: ["time", "subject", "task"],
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};
