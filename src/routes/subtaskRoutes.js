const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middlewares/authMiddleware');

router.put('/:id', authenticate, taskController.updateSubtask);

module.exports = router;
