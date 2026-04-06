const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const taskController = {
  // Criar tarefa (Create)
  create: async (req, res) => {
    const { title } = req.body;
    const task = await prisma.task.create({
      data: { 
        title, 
        tenantId: req.user.tenantId // Vincula automaticamente à empresa do usuário logado
      }
    });
    res.json(task);
  },

  // Listar tarefas (Read)
  list: async (req, res) => {
    const page = Number.isNaN(Number.parseInt(req.query.page, 10))
      ? 1
      : Math.max(Number.parseInt(req.query.page, 10), 1);
    const limit = Number.isNaN(Number.parseInt(req.query.limit, 10))
      ? 10
      : Math.max(Number.parseInt(req.query.limit, 10), 1);
    const skip = (page - 1) * limit;
    const where = { tenantId: req.user.tenantId }; // O FILTRO MULTI-TENANT AQUI!

    const [totalItems, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take: limit
      })
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      tasks,
      totalItems,
      totalPages,
      currentPage: page
    });
  },

  // Editar tarefa (Update)
  update: async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Título é obrigatório.' });
    }

    const updated = await prisma.task.updateMany({
      where: { id, tenantId: req.user.tenantId },
      data: { title: title.trim() }
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    res.json({ message: 'Tarefa atualizada!' });
  },

  // Deletar tarefa (Delete)
  delete: async (req, res) => {
    const { id } = req.params;
    const deleted = await prisma.task.deleteMany({ // Usamos deleteMany com filtro de tenant por segurança
      where: { id, tenantId: req.user.tenantId }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    res.json({ message: "Tarefa removida!" });
  },

  // Criar subtarefa (Create)
  createSubtask: async (req, res) => {
    const { taskId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Título da subtarefa é obrigatório.' });
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, tenantId: req.user.tenantId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const subtask = await prisma.subtask.create({
      data: {
        title: title.trim(),
        taskId: task.id,
        tenantId: req.user.tenantId
      }
    });

    res.status(201).json(subtask);
  },

  // Listar subtarefas de uma tarefa (Read)
  listSubtasks: async (req, res) => {
    const { taskId } = req.params;

    const task = await prisma.task.findFirst({
      where: { id: taskId, tenantId: req.user.tenantId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const subtasks = await prisma.subtask.findMany({
      where: { taskId, tenantId: req.user.tenantId },
      orderBy: { title: 'asc' }
    });

    res.json(subtasks);
  },

  // Marcar subtarefa como concluída
  completeSubtask: async (req, res) => {
    const { taskId, subtaskId } = req.params;

    const task = await prisma.task.findFirst({
      where: { id: taskId, tenantId: req.user.tenantId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const updated = await prisma.subtask.updateMany({
      where: {
        id: subtaskId,
        taskId,
        tenantId: req.user.tenantId
      },
      data: { done: true }
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Subtarefa não encontrada.' });
    }

    res.json({ message: 'Subtarefa concluída!' });
  },

  // Editar subtarefa (Update)
  updateSubtask: async (req, res) => {
    const { id } = req.params;
    const { title, done } = req.body;
    const data = {};

    if (title !== undefined) {
      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: 'Título da subtarefa é obrigatório.' });
      }
      data.title = String(title).trim();
    }

    if (done !== undefined) {
      if (typeof done !== 'boolean') {
        return res.status(400).json({ error: 'Campo "done" deve ser booleano.' });
      }
      data.done = done;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Envie ao menos "title" ou "done" para atualizar.' });
    }

    const existingSubtask = await prisma.subtask.findUnique({
      where: { id },
      include: {
        task: {
          select: { tenantId: true }
        }
      }
    });

    if (!existingSubtask || existingSubtask.task.tenantId !== req.user.tenantId) {
      return res.status(404).json({ error: 'Subtarefa não encontrada.' });
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id },
      data
    });

    res.json(updatedSubtask);
  }
};

module.exports = taskController;