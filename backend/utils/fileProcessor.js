const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF file');
  }
};

/**
 * Extract text from DOCX file
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX file');
  }
};

/**
 * Extract text from resume file based on file type
 * @param {string} filePath - Path to the resume file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromResume = async (filePath, mimeType) => {
  try {
    let extractedText = '';
    
    switch (mimeType) {
      case 'application/pdf':
        extractedText = await extractTextFromPDF(filePath);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        extractedText = await extractTextFromDOCX(filePath);
        break;
      default:
        throw new Error('Unsupported file type');
    }
    
    // Clean up the extracted text
    extractedText = cleanExtractedText(extractedText);
    
    return extractedText;
  } catch (error) {
    console.error('Error in extractTextFromResume:', error);
    throw error;
  }
};

/**
 * Clean and normalize extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
const cleanExtractedText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n') // Replace remaining carriage returns
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
};

/**
 * Validate extracted text
 * @param {string} text - Extracted text to validate
 * @returns {object} - Validation result
 */
const validateExtractedText = (text) => {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  if (!text || text.length === 0) {
    result.isValid = false;
    result.errors.push('No text could be extracted from the file');
    return result;
  }
  
  if (text.length < 50) {
    result.warnings.push('Extracted text seems very short. The resume might not be processed correctly.');
  }
  
  if (text.length > 50000) {
    result.warnings.push('Extracted text is very long. This might affect processing speed.');
  }
  
  // Check for common resume keywords
  const resumeKeywords = [
    'experience', 'education', 'skills', 'objective', 'summary',
    'work', 'job', 'employment', 'degree', 'university', 'college'
  ];
  
  const textLower = text.toLowerCase();
  const foundKeywords = resumeKeywords.filter(keyword => textLower.includes(keyword));
  
  if (foundKeywords.length < 3) {
    result.warnings.push('The document might not be a resume based on content analysis.');
  }
  
  return result;
};

/**
 * Get file information
 * @param {string} filePath - Path to the file
 * @returns {object} - File information
 */
const getFileInfo = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      exists: true
    };
  } catch (error) {
    return {
      size: 0,
      created: null,
      modified: null,
      exists: false
    };
  }
};

module.exports = {
  extractTextFromResume,
  extractTextFromPDF,
  extractTextFromDOCX,
  cleanExtractedText,
  validateExtractedText,
  getFileInfo
};
