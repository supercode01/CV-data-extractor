const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Filter by role
    if (role && ['user', 'admin'].includes(role)) {
      query.role = role;
    }

    // Filter by status (active/inactive)
    if (status && ['active', 'inactive'].includes(status)) {
      query.isActive = status === 'active';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users: users.map(user => user.getPublicProfile()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Server error while fetching users'
    });
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get specific user details (admin only)
 * @access  Private (Admin)
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get user's resume count
    const resumeCount = await Resume.countDocuments({ userId: user._id });

    res.json({
      user: user.getPublicProfile(),
      stats: {
        totalResumes: resumeCount,
        lastActive: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error while fetching user'
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user (admin only)
 * @access  Private (Admin)
 */
router.put('/users/:id', [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, role, isActive } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already exists'
        });
      }
    }

    // Update user
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user: updatedUser.getPublicProfile()
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Server error while updating user'
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (admin only)
 * @access  Private (Admin)
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot delete your own account'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Delete user's resumes first
    await Resume.deleteMany({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Server error while deleting user'
    });
  }
});

/**
 * @route   GET /api/admin/resumes
 * @desc    Get all resumes (admin only)
 * @access  Private (Admin)
 */
router.get('/resumes', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, userId } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Filter by user
    if (userId) {
      query.userId = userId;
    }

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
      .populate('userId', 'firstName lastName email')
      .select('fileName originalFileName processingStatus parsedData.fullName parsedData.email aiConfidence createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resume.countDocuments(query);

    res.json({
      resumes: resumes.map(resume => ({
        ...resume.getSummary(),
        user: {
          id: resume.userId._id,
          name: `${resume.userId.firstName} ${resume.userId.lastName}`,
          email: resume.userId.email
        }
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResumes: total,
        hasNext: skip + resumes.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      message: 'Server error while fetching resumes'
    });
  }
});

/**
 * @route   GET /api/admin/resumes/:id
 * @desc    Get specific resume details (admin only)
 * @access  Private (Admin)
 */
router.get('/resumes/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('userId', 'firstName lastName email');
    
    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found'
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
        user: {
          id: resume.userId._id,
          name: `${resume.userId.firstName} ${resume.userId.lastName}`,
          email: resume.userId.email
        },
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
 * @route   DELETE /api/admin/resumes/:id
 * @desc    Delete resume (admin only)
 * @access  Private (Admin)
 */
router.delete('/resumes/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found'
      });
    }

    // Delete file from filesystem
    const fs = require('fs');
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

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
 * @route   GET /api/admin/stats
 * @desc    Get system statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalResumes,
      completedResumes,
      processingResumes,
      failedResumes,
      recentUsers,
      recentResumes
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Resume.countDocuments(),
      Resume.countDocuments({ processingStatus: 'completed' }),
      Resume.countDocuments({ processingStatus: 'processing' }),
      Resume.countDocuments({ processingStatus: 'failed' }),
      User.countDocuments({ 
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        } 
      }),
      Resume.countDocuments({ 
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        } 
      })
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        recent: recentUsers
      },
      resumes: {
        total: totalResumes,
        completed: completedResumes,
        processing: processingResumes,
        failed: failedResumes,
        recent: recentResumes
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching statistics'
    });
  }
});

module.exports = router;
