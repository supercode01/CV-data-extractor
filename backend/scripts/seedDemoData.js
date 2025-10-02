const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Resume = require('../models/Resume');

const seedDemoData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-parser');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Resume.deleteMany({});
    console.log('Cleared existing data');

    // Create demo users
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
    });

    const regularUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      isActive: true,
    });

    // Hash passwords
    adminUser.password = await bcrypt.hash(adminUser.password, 12);
    regularUser.password = await bcrypt.hash(regularUser.password, 12);

    // Save users
    const savedAdmin = await adminUser.save();
    const savedUser = await regularUser.save();
    console.log('Created demo users');

    // Create demo resumes
    const demoResumes = [
      {
        userId: savedUser._id,
        fileName: 'john-doe-resume.pdf',
        originalFileName: 'John Doe Resume.pdf',
        filePath: 'uploads/demo-resume-1.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        extractedText: `JOHN DOE
Software Engineer
john.doe@email.com | (555) 123-4567 | San Francisco, CA
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development.
Specialized in React, Node.js, and cloud technologies. Passionate about building
scalable applications and leading development teams.

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java, TypeScript
Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express.js, Python, Django
Databases: MongoDB, PostgreSQL, Redis
Cloud: AWS, Docker, Kubernetes
Tools: Git, Jenkins, Jira, Figma

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of microservices architecture serving 100K+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Mentored 3 junior developers and conducted code reviews
• Technologies: React, Node.js, MongoDB, AWS

Software Engineer | StartupXYZ | 2019 - 2021
• Developed responsive web applications using React and Node.js
• Collaborated with design team to implement pixel-perfect UIs
• Optimized database queries improving application performance by 40%
• Technologies: React, Express.js, PostgreSQL, Docker

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2015 - 2019
GPA: 3.8/4.0

PROJECTS
E-Commerce Platform | 2022
• Built full-stack e-commerce application with React and Node.js
• Implemented payment integration with Stripe
• Deployed on AWS with auto-scaling capabilities
• Technologies: React, Node.js, MongoDB, AWS, Stripe

Task Management App | 2021
• Developed collaborative task management tool
• Real-time updates using WebSockets
• Mobile-responsive design with PWA capabilities
• Technologies: Vue.js, Express.js, Socket.io, MongoDB

CERTIFICATIONS
AWS Certified Solutions Architect - Associate | 2022
Google Cloud Professional Developer | 2021`,
        parsedData: {
          fullName: 'John Doe',
          email: 'john.doe@email.com',
          phone: '(555) 123-4567',
          address: 'San Francisco, CA',
          skills: ['JavaScript', 'Python', 'Java', 'TypeScript', 'React', 'Vue.js', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
          linkedinLink: 'linkedin.com/in/johndoe',
          githubLink: 'github.com/johndoe',
          experience: [
            {
              company: 'TechCorp Inc.',
              position: 'Senior Software Engineer',
              startDate: '2021',
              endDate: 'Present',
              description: 'Led development of microservices architecture serving 100K+ users. Implemented CI/CD pipelines reducing deployment time by 60%. Mentored 3 junior developers and conducted code reviews.',
              isCurrent: true
            },
            {
              company: 'StartupXYZ',
              position: 'Software Engineer',
              startDate: '2019',
              endDate: '2021',
              description: 'Developed responsive web applications using React and Node.js. Collaborated with design team to implement pixel-perfect UIs. Optimized database queries improving application performance by 40%.',
              isCurrent: false
            }
          ],
          education: [
            {
              institution: 'University of California, Berkeley',
              degree: 'Bachelor of Science in Computer Science',
              fieldOfStudy: 'Computer Science',
              startDate: '2015',
              endDate: '2019',
              gpa: '3.8/4.0',
              description: ''
            }
          ],
          projects: [
            {
              name: 'E-Commerce Platform',
              description: 'Built full-stack e-commerce application with React and Node.js. Implemented payment integration with Stripe. Deployed on AWS with auto-scaling capabilities.',
              technologies: ['React', 'Node.js', 'MongoDB', 'AWS', 'Stripe'],
              startDate: '2022',
              endDate: '2022',
              link: ''
            },
            {
              name: 'Task Management App',
              description: 'Developed collaborative task management tool. Real-time updates using WebSockets. Mobile-responsive design with PWA capabilities.',
              technologies: ['Vue.js', 'Express.js', 'Socket.io', 'MongoDB'],
              startDate: '2021',
              endDate: '2021',
              link: ''
            }
          ],
          summary: 'Experienced software engineer with 5+ years of experience in full-stack development. Specialized in React, Node.js, and cloud technologies. Passionate about building scalable applications and leading development teams.',
          languages: ['English'],
          certifications: ['AWS Certified Solutions Architect - Associate', 'Google Cloud Professional Developer']
        },
        processingStatus: 'completed',
        aiConfidence: 95,
        isActive: true
      }
    ];

    // Save demo resumes
    for (const resumeData of demoResumes) {
      const resume = new Resume(resumeData);
      await resume.save();
    }
    console.log('Created demo resumes');

    console.log('\n✅ Demo data seeded successfully!');
    console.log('\nDemo accounts created:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: user@example.com / user123');
    console.log('\nYou can now start the application and test with these accounts.');

  } catch (error) {
    console.error('Error seeding demo data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

// Run the seeder
seedDemoData();
