const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const subtaskRoutes = require('./routes/subtaskRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/subtasks', subtaskRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});