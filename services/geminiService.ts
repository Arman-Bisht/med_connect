
import { GoogleGenAI } from "@google/genai";
import type { Patient } from '../types';

// This is a placeholder for the API key.
// In a real production environment, this should be handled securely.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  // In a real app, you might want to show a message to the user or disable AI features.
  console.error("API_KEY environment variable not set. AI features will be disabled.");
}

// Initialize the AI client only if the API key is available.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const summarizePatientRecord = async (patient: Patient): Promise<string> => {
  if (!ai) {
    return "Error: AI Service is not configured. Please ensure the API key is set.";
  }

  const model = 'gemini-2.5-flash';
  
  const prompt = `
    You are a helpful medical assistant. Your task is to summarize a patient's record for a consultation with a specialist.
    The summary should be concise, professional, and highlight the most critical information for the specialist.
    Structure the summary into the following sections:
    - Patient Profile: A brief one-liner.
    - Key Medical History: Bullet points of relevant history.
    - Current Medications: List of current medications.
    - Physician's Notes / Reason for Consultation: A clear summary of the primary doctor's observations and the reason for the referral.

    Here is the patient data:
    - Name: ${patient.name}
    - Age: ${patient.age}
    - Gender: ${patient.gender}
    - Blood Type: ${patient.bloodType}
    - Medical History: ${patient.medicalHistory.join(', ')}
    - Current Medications: ${patient.currentMedications.join(', ')}
    - Doctor's Notes: ${patient.doctorNotes}

    Please generate the summary now.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating patient summary:", error);
    // Provide a more user-friendly error message
    return `Error: Could not generate summary. The AI service may be unavailable or experiencing issues. Details: ${error instanceof Error ? error.message : String(error)}`;
  }
};
