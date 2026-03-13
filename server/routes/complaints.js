const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { auth, adminOnly } = require('../middleware/auth');

// Fixed-string routes MUST come before /:id wildcard routes
router.post('/analyze', auth, complaintController.analyzeComplaint);
router.get('/popular', auth, complaintController.getPopularComplaints);
router.post('/generate-demo-complaints', auth, adminOnly, complaintController.generateDemoComplaints);

// CRUD routes
router.post('/', auth, complaintController.createComplaint);
router.get('/', auth, complaintController.getAllComplaints);

// Wildcard /:id routes LAST
router.get('/:id', auth, complaintController.getComplaintById);
router.post('/:id/vote', auth, complaintController.voteComplaint);
router.put('/:id/status', auth, adminOnly, complaintController.updateStatus);
router.patch('/:id/progress', auth, adminOnly, complaintController.updateProgress);

module.exports = router;

