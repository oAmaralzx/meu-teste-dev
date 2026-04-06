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
    const tasks = await prisma.task.findMany({
      where: { tenantId: req.user.tenantId } // O FILTRO MULTI-TENANT AQUI!
    });
    res.json(tasks);
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
  }
};

module.exports = taskController;