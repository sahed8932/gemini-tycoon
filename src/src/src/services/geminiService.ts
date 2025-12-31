import { GoogleGenerativeAI } from "@google/generative-ai";
import { Task } from "../types";

// আপনার দেওয়া Gemini API Key
const API_KEY = "AIzaSyCPjckJ1CFGPd-KzZTwbNh9CXXGR1wHr2c";

const genAI = new GoogleGenerativeAI(API_KEY);

const FALLBACK_TASKS: Task[] = [
  {
    id: 'fb-1',
    title: 'সাধারণ জ্ঞান',
    description: 'বাংলাদেশের জাতীয় মাছ কোনটি?',
    reward: 0.50,
    energyCost: 5,
    difficulty: 'সহজ',
    type: 'Creative',
    answer: 'ইলিশ'
  }
];

export const generateTasks = async (level: number): Promise<Task[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // রিওয়ার্ড কমানো হয়েছে (0.30 - 0.80 পয়সা)
    const prompt = `Generate 3 distinct mini-tasks for user level ${level}. 
    Output strictly in valid JSON format (array of objects).
    Fields: id (string), title (Bangla), description (Bangla question), reward (number between 0.30 and 0.80), energyCost (5-10), difficulty ('সহজ'|'মাঝারি'), type ('Riddle'|'Creative'), answer (Bangla).`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const tasks = JSON.parse(text) as Task[];
    return tasks.map((t, i) => ({ ...t, id: `gen-${Date.now()}-${i}` }));
    
  } catch (error) {
    console.error("Gemini Error:", error);
    return FALLBACK_TASKS;
  }
};

export const verifyTaskAnswer = async (task: Task, userAnswer: string): Promise<boolean> => {
    if (task.answer && task.answer.toLowerCase().trim() === userAnswer.toLowerCase().trim()) return true;
    return userAnswer.length > 2; 
};
