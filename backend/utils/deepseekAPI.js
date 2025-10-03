const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Gemini API key is not configured");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// choose your model: gemini-2.5-flash (faster) or gemini-2.5-pro (better quality)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

/**
 * Extract structured resume data
 * @param {string} resumeText
 */
const extractResumeData = async (resumeText) => {
  try {
    const prompt = `Please extract and structure the following resume information into a JSON format. 
Return ONLY a valid JSON object with this structure:

{
  "fullName": "Full name of the person",
  "email": "Email address",
  "phone": "Phone number",
  "address": "Full address",
  "skills": ["skill1", "skill2", "skill3"],
  "linkedinLink": "LinkedIn profile URL",
  "githubLink": "GitHub profile URL",
  "experience": [
    {
      "company": "Company name",
      "position": "Job title/position",
      "startDate": "Start date",
      "endDate": "End date (or 'Present')",
      "description": "Job description/responsibilities",
      "isCurrent": false
    }
  ],
  "education": [
    {
      "institution": "School/University name",
      "degree": "Degree",
      "fieldOfStudy": "Field of study",
      "startDate": "Start date",
      "endDate": "End date",
      "gpa": "GPA if mentioned",
      "description": "Additional details"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "technologies": ["tech1", "tech2"],
      "startDate": "Start date",
      "endDate": "End date",
      "link": "Project link if available"
    }
  ],
  "summary": "Professional summary/objective",
  "languages": ["Language1", "Language2"],
  "certifications": ["Certification1", "Certification2"]
}

Resume text:
${resumeText}

Important:
- If any field is missing, use null or []
- Return ONLY the JSON object, no explanation.`;

    // Call Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    let content = response.text().trim();

    // Remove possible code block formatting
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parse JSON
    // extractResumeData function ke andar, JSON.parse line ke bajaye
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      console.error("Raw content from Gemini:", content); // Debugging ke liye
      throw new Error(`Failed to parse Gemini's JSON response: ${parseError.message}`);
    }
    // ... rest of the code

    // return directly
    return {
      success: true,
      data: parsedData,
      rawResponse: content
    };
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`Failed to extract resume data: ${error.message}`);
  }
};

/**
 * Test Gemini connection
 */
const testConnection = async () => {
  try {
    const result = await model.generateContent("Say: API connection successful");
    const text = result.response.text();
    return text.includes("API connection successful");
  } catch (err) {
    console.error("Gemini API test failed:", err.message);
    return false;
  }
};

module.exports = {
  extractResumeData,
  testConnection,
};
