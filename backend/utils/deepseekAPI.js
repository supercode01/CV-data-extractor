const axios = require('axios');

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

/**
 * Call DeepSeek API to extract structured data from resume text
 * @param {string} resumeText - Extracted text from resume
 * @returns {Promise<object>} - Structured resume data
 */
const extractResumeData = async (resumeText) => {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key is not configured');
    }

    const prompt = `Please extract and structure the following resume information into a JSON format. Return ONLY a valid JSON object with the following structure:

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
      "endDate": "End date (or 'Present' if current)",
      "description": "Job description/responsibilities",
      "isCurrent": false
    }
  ],
  "education": [
    {
      "institution": "School/University name",
      "degree": "Degree type (Bachelor's, Master's, etc.)",
      "fieldOfStudy": "Field of study/major",
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

Resume text to analyze:
${resumeText}

Important instructions:
- If any field is not found in the resume, use null or empty array []
- For dates, use the format as mentioned in the resume or "Present" for current positions
- Extract all skills, technologies, and programming languages mentioned
- For experience and education, extract all entries found
- Be thorough in extracting information but don't make up information that's not present
- Return ONLY the JSON object, no additional text or explanations`;

    const response = await axios.post(DEEPSEEK_API_URL, {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are an expert resume parser. Extract structured data from resume text and return it as a valid JSON object."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from DeepSeek API');
    }

    const content = response.data.choices[0].message.content.trim();
    
    // Try to parse the JSON response
    let parsedData;
    try {
      // Remove any markdown formatting if present
      const jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing JSON from DeepSeek response:', parseError);
      console.error('Raw response:', content);
      throw new Error('Failed to parse structured data from AI response');
    }

    // Validate and clean the parsed data
    const cleanedData = validateAndCleanParsedData(parsedData);
    
    return {
      success: true,
      data: cleanedData,
      confidence: calculateConfidence(cleanedData),
      rawResponse: content
    };

  } catch (error) {
    console.error('DeepSeek API Error:', error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    
    throw new Error(`Failed to extract resume data: ${error.message}`);
  }
};

/**
 * Validate and clean parsed data from AI
 * @param {object} data - Raw parsed data
 * @returns {object} - Cleaned and validated data
 */
const validateAndCleanParsedData = (data) => {
  const cleaned = {
    fullName: null,
    email: null,
    phone: null,
    address: null,
    skills: [],
    linkedinLink: null,
    githubLink: null,
    experience: [],
    education: [],
    projects: [],
    summary: null,
    languages: [],
    certifications: []
  };

  // Clean and validate each field
  if (data.fullName && typeof data.fullName === 'string') {
    cleaned.fullName = data.fullName.trim();
  }

  if (data.email && typeof data.email === 'string') {
    cleaned.email = data.email.trim().toLowerCase();
  }

  if (data.phone && typeof data.phone === 'string') {
    cleaned.phone = data.phone.trim();
  }

  if (data.address && typeof data.address === 'string') {
    cleaned.address = data.address.trim();
  }

  if (data.skills && Array.isArray(data.skills)) {
    cleaned.skills = data.skills
      .filter(skill => typeof skill === 'string' && skill.trim())
      .map(skill => skill.trim());
  }

  if (data.linkedinLink && typeof data.linkedinLink === 'string') {
    cleaned.linkedinLink = data.linkedinLink.trim();
  }

  if (data.githubLink && typeof data.githubLink === 'string') {
    cleaned.githubLink = data.githubLink.trim();
  }

  if (data.experience && Array.isArray(data.experience)) {
    cleaned.experience = data.experience
      .filter(exp => exp && typeof exp === 'object')
      .map(exp => ({
        company: exp.company ? exp.company.trim() : '',
        position: exp.position ? exp.position.trim() : '',
        startDate: exp.startDate ? exp.startDate.trim() : '',
        endDate: exp.endDate ? exp.endDate.trim() : '',
        description: exp.description ? exp.description.trim() : '',
        isCurrent: Boolean(exp.isCurrent) || exp.endDate?.toLowerCase().includes('present')
      }));
  }

  if (data.education && Array.isArray(data.education)) {
    cleaned.education = data.education
      .filter(edu => edu && typeof edu === 'object')
      .map(edu => ({
        institution: edu.institution ? edu.institution.trim() : '',
        degree: edu.degree ? edu.degree.trim() : '',
        fieldOfStudy: edu.fieldOfStudy ? edu.fieldOfStudy.trim() : '',
        startDate: edu.startDate ? edu.startDate.trim() : '',
        endDate: edu.endDate ? edu.endDate.trim() : '',
        gpa: edu.gpa ? edu.gpa.trim() : '',
        description: edu.description ? edu.description.trim() : ''
      }));
  }

  if (data.projects && Array.isArray(data.projects)) {
    cleaned.projects = data.projects
      .filter(proj => proj && typeof proj === 'object')
      .map(proj => ({
        name: proj.name ? proj.name.trim() : '',
        description: proj.description ? proj.description.trim() : '',
        technologies: Array.isArray(proj.technologies) ? 
          proj.technologies.filter(tech => typeof tech === 'string' && tech.trim())
            .map(tech => tech.trim()) : [],
        startDate: proj.startDate ? proj.startDate.trim() : '',
        endDate: proj.endDate ? proj.endDate.trim() : '',
        link: proj.link ? proj.link.trim() : ''
      }));
  }

  if (data.summary && typeof data.summary === 'string') {
    cleaned.summary = data.summary.trim();
  }

  if (data.languages && Array.isArray(data.languages)) {
    cleaned.languages = data.languages
      .filter(lang => typeof lang === 'string' && lang.trim())
      .map(lang => lang.trim());
  }

  if (data.certifications && Array.isArray(data.certifications)) {
    cleaned.certifications = data.certifications
      .filter(cert => typeof cert === 'string' && cert.trim())
      .map(cert => cert.trim());
  }

  return cleaned;
};

/**
 * Calculate confidence score based on extracted data
 * @param {object} data - Parsed resume data
 * @returns {number} - Confidence score (0-100)
 */
const calculateConfidence = (data) => {
  let score = 0;
  let totalFields = 0;

  // Check each field and add to score
  const fields = [
    'fullName', 'email', 'phone', 'skills', 'experience', 'education'
  ];

  fields.forEach(field => {
    totalFields++;
    if (data[field]) {
      if (Array.isArray(data[field])) {
        if (data[field].length > 0) score += 100 / totalFields;
      } else if (data[field].trim()) {
        score += 100 / totalFields;
      }
    }
  });

  return Math.round(score);
};

/**
 * Test DeepSeek API connection
 * @returns {Promise<boolean>} - Connection status
 */
const testConnection = async () => {
  try {
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: "Hello, please respond with 'API connection successful'"
        }
      ],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return response.status === 200;
  } catch (error) {
    console.error('DeepSeek API connection test failed:', error.message);
    return false;
  }
};

module.exports = {
  extractResumeData,
  testConnection
};
