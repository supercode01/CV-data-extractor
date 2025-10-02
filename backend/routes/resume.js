const express = require('express');
const { body, validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const { authenticateToken, checkResourceAccess } = require('../middleware/auth');
const { upload, handleUploadError, cleanupFile } = require('../middleware/upload');
const { extractTextFromResume, validateExtractedText } = require('../utils/fileProcessor');
const { extractResumeData } = require('../utils/deepseekAPI');

const router = express.Router();

/**
 * @route   POST /api/resume/upload
 * @desc    Upload and parse resume
 * @access  Private
 */
router.post('/upload', authenticateToken, upload, handleUploadError, async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded'
      });
    }

    filePath = req.file.path;
    const { originalname, mimetype, size } = req.file;

    // Create resume record with initial status
    const resume = new Resume({
      userId: req.user._id,
      fileName: req.file.filename,
      originalFileName: originalname,
      filePath: filePath,
      fileSize: size,
      fileType: mimetype,
      extractedText: '',
      parsedData: {},
      processingStatus: 'uploaded'
    });

    await resume.save();

    // Extract text from file
    try {
      resume.processingStatus = 'processing';
      await resume.save();

      const extractedText = await extractTextFromResume(filePath, mimetype);
      
      // Validate extracted text
      const textValidation = validateExtractedText(extractedText);
      if (!textValidation.isValid) {
        resume.processingStatus = 'failed';
        resume.processingError = textValidation.errors.join('; ');
        await resume.save();
        
        return res.status(400).json({
          message: 'Failed to extract text from file',
          errors: textValidation.errors,
          warnings: textValidation.warnings
        });
      }

      resume.extractedText = extractedText;
      await resume.save();

      // Send text to DeepSeek API for parsing
      try {
        const aiResult = await extractResumeData(extractedText);
        
        if (aiResult.success) {
          resume.parsedData = aiResult.data;
          resume.aiConfidence = aiResult.confidence;
          resume.processingStatus = 'completed';
        } else {
          resume.processingStatus = 'failed';
          resume.processingError = 'Failed to parse resume data with AI';
        }
        
        await resume.save();

        res.status(201).json({
          message: 'Resume uploaded and processed successfully',
          resume: {
            id: resume._id,
            fileName: resume.fileName,
            originalFileName: resume.originalFileName,
            processingStatus: resume.processingStatus,
            parsedData: resume.parsedData,
            aiConfidence: resume.aiConfidence,
            warnings: textValidation.warnings,
            createdAt: resume.createdAt
          }
        });

      } catch (aiError) {
        console.error('AI processing error:', aiError);
        resume.processingStatus = 'failed';
        resume.processingError = aiError.message;
        await resume.save();

        res.status(500).json({
          message: 'Failed to process resume with AI',
          error: aiError.message,
          resume: {
            id: resume._id,
            fileName: resume.fileName,
            processingStatus: resume.processingStatus,
            processingError: resume.processingError
          }
        });
      }

    } catch (textExtractionError) {
      console.error('Text extraction error:', textExtractionError);
      resume.processingStatus = 'failed';
      resume.processingError = textExtractionError.message;
      await resume.save();

      res.status(500).json({
        message: 'Failed to extract text from file',
        error: textExtractionError.message
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if it exists
    if (filePath) {
      cleanupFile(filePath);
    }
    
    res.status(500).json({
      message: 'Server error during file upload'
    });
  }
});

/**
 * @route   GET /api/resume/history
 * @desc    Get user's resume history
 * @access  Private
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    
    // Filter by status
    if (status && ['uploaded', 'processing', 'completed', 'failed'].includes(status)) {
      query.processingStatus = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { originalFileName: { $regex: search, $options: 'i' } },
        { 'parsedData.fullName': { $regex: search, $options: 'i' } },
        { 'parsedData.email': { $regex: search, $options: 'i' } },
        { 'parsedData.skills': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const resumes = await Resume.find(query)
      .select('fileName originalFileName processingStatus parsedData.fullName parsedData.email aiConfidence createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resume.countDocuments(query);

    res.json({
      resumes: resumes.map(resume => resume.getSummary()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResumes: total,
        hasNext: skip + resumes.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      message: 'Server error while fetching resume history'
    });
  }
});

/**
 * @route   GET /api/resume/:id
 * @desc    Get specific resume details
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found'
      });
    }

    // Check if user owns this resume or is admin
    if (resume.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.json({
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        originalFileName: resume.originalFileName,
        fileSize: resume.fileSize,
        fileType: resume.fileType,
        processingStatus: resume.processingStatus,
        processingError: resume.processingError,
        parsedData: resume.parsedData,
        aiConfidence: resume.aiConfidence,
        extractedText: resume.extractedText,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      }
    });

  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      message: 'Server error while fetching resume'
    });
  }
});

/**
 * @route   DELETE /api/resume/:id
 * @desc    Delete resume
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found'
      });
    }

    // Check if user owns this resume or is admin
    if (resume.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Delete file from filesystem
    cleanupFile(resume.filePath);

    // Delete resume from database
    await Resume.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      message: 'Server error while deleting resume'
    });
  }
});

/**
 * @route   GET /api/resume/search/:query
 * @desc    Search resumes
 * @access  Private
 */
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const resumes = await Resume.searchResumes(query, req.user._id)
      .select('fileName originalFileName processingStatus parsedData.fullName parsedData.email aiConfidence createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resume.countDocuments({
      userId: req.user._id,
      $or: [
        { originalFileName: { $regex: query, $options: 'i' } },
        { 'parsedData.fullName': { $regex: query, $options: 'i' } },
        { 'parsedData.email': { $regex: query, $options: 'i' } },
        { 'parsedData.skills': { $in: [new RegExp(query, 'i')] } }
      ]
    });

    res.json({
      resumes: resumes.map(resume => resume.getSummary()),
      query,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasNext: skip + resumes.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      message: 'Server error while searching resumes'
    });
  }
});

/**
 * @route   GET /api/resume/export/:id
 * @desc    Export resume data as JSON
 * @access  Private
 */
router.get('/export/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found'
      });
    }

    // Check if user owns this resume or is admin
    if (resume.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    const exportData = {
      metadata: {
        fileName: resume.originalFileName,
        uploadedAt: resume.createdAt,
        processedAt: resume.updatedAt,
        processingStatus: resume.processingStatus,
        aiConfidence: resume.aiConfidence
      },
      parsedData: resume.parsedData,
      rawText: req.query.includeText === 'true' ? resume.extractedText : undefined
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.originalFileName}.json"`);
    res.json(exportData);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      message: 'Server error while exporting resume data'
    });
  }
});

module.exports = router;
