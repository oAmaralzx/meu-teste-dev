const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middlewares/authMiddleware');

// Todas as rotas de tarefa precisam do "authenticate"
router.post('/', authenticate, taskController.create);
router.get('/', authenticate, taskController.list);
router.put('/:id', authenticate, taskController.update);
router.delete('/:id', authenticate, taskController.delete);
router.post('/:taskId/subtasks', authenticate, taskController.createSubtask);
router.get('/:taskId/subtasks', authenticate, taskController.listSubtasks);
router.patch('/:taskId/subtasks/:subtaskId/complete', authenticate, taskController.completeSubtask);

module.exports = router;