import { GoogleGenAI } from "@google/genai";
import { Course, Student, Grade } from "../types";

let ai: GoogleGenAI | null = null;

try {
  // Safe check for process.env to prevent ReferenceError in browser environments
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (e) {
  console.warn("Gemini API Client could not be initialized:", e);
}

export const analyzeStudentProgress = async (student: Student, course: Course, currentPoints: number, currentGrade: string): Promise<string> => {
  if (!ai) return "AI service is not configured (Missing API Key).";

  const studentResultsReadable = student.results.map(r => {
    const unit = course.units.find(u => u.id === r.unitId);
    return `${unit?.name} (${unit?.type}, ${unit?.glh} GLH): ${r.grade}`;
  }).join('\n');

  const prompt = `
    You are an expert academic advisor for Pearson BTEC students.
    
    Context:
    Course: ${course.name} (${course.qualification})
    Student: ${student.name}
    Current Total Points: ${currentPoints}
    Current Projected Grade: ${currentGrade}
    
    Student's Unit Results:
    ${studentResultsReadable}
    
    Task:
    1. Analyze the student's current performance.
    2. Suggest what grades they need in remaining units to achieve a Distinction profile (if possible) or improve their current standing.
    3. If they have 'U' grades in Mandatory units, warn them.
    4. Keep the tone encouraging but factual.
    5. Keep the response under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't analyze the grades at this moment.";
  }
};