import { useState } from 'react';
import { CheckCircle2, ListTodo, LogOut, Pencil, PlusCircle, RefreshCw, Save, Trash2, X } from 'lucide-react';
import api, { setToken } from './api';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState(''); // Estado para o input da nova tarefa
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  // 1. Função de Login
  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token);
      setIsLoggedIn(true);
      loadTasks();
    } catch {
      alert("Erro ao logar! Verifique se o Backend está rodando.");
    }
  };

  // 2. Função de Listagem
  const loadTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch {
      console.error("Erro ao carregar tarefas");
    }
  };

  // 3. Função para Criar Tarefa
  const handleCreateTask = async () => {
    if (!newTaskTitle) return; // Não deixa criar vazio
    try {
      await api.post('/tasks', { title: newTaskTitle });
      setNewTaskTitle(''); // Limpa o campo de texto
      loadTasks(); // Recarrega a lista para mostrar a nova tarefa
    } catch {
      alert("Erro ao criar tarefa");
    }
  };

  // 4. Função para Editar Tarefa
  const handleUpdateTask = async (id) => {
    if (!editingTaskTitle.trim()) return;
    try {
      await api.put(`/tasks/${id}`, { title: editingTaskTitle });
      setEditingTaskId(null);
      setEditingTaskTitle('');
      loadTasks();
    } catch {
      alert('Erro ao editar tarefa');
    }
  };

  // 5. Função para Deletar Tarefa
  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      if (editingTaskId === id) {
        setEditingTaskId(null);
        setEditingTaskTitle('');
      }
      loadTasks();
    } catch {
      alert('Erro ao deletar tarefa');
    }
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // TELA DE LOGIN
  if (!isLoggedIn) {
    return (
      <main className="app-shell app-shell--centered">
        <Card className="auth-card">
          <CardHeader>
            <CardTitle>Login Multi-tenant</CardTitle>
            <CardDescription>Entre para acessar suas tarefas por empresa.</CardDescription>
          </CardHeader>
          <CardContent className="auth-form">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              placeholder="seu@email.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="form-label" htmlFor="password">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button onClick={handleLogin} size="lg">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const hasTasks = tasks.length > 0;

  // TELA DO DASHBOARD (PÓS-LOGIN)
  return (
    <main className="app-shell">
      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">Painel</p>
          <h1>Dashboard da Empresa</h1>
          <p className="subtitle">Gerencie tarefas com rapidez e foco.</p>
        </div>

        <Button variant="danger" onClick={handleLogout}>
          <LogOut size={16} aria-hidden="true" />
          Sair do Sistema
        </Button>
      </section>

      <section className="dashboard-grid">
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Tarefa</CardTitle>
            <CardDescription>Adicione uma tarefa para sua equipe.</CardDescription>
          </CardHeader>
          <CardContent className="task-create">
            <label className="form-label" htmlFor="new-task">
              O que precisa ser feito?
            </label>
            <div className="input-with-action">
              <Input
                id="new-task"
                placeholder="Ex.: Revisar relatório mensal"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <Button onClick={handleCreateTask}>
                <PlusCircle size={16} aria-hidden="true" />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="tasks-header">
            <div>
              <CardTitle>Suas Tarefas</CardTitle>
              <CardDescription>Acompanhe itens ativos por empresa.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadTasks}>
              <RefreshCw size={14} aria-hidden="true" />
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            {hasTasks ? (
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id} className="task-item">
                    {editingTaskId === task.id ? (
                      <div className="task-item__edit">
                        <Input
                          value={editingTaskTitle}
                          onChange={(e) => setEditingTaskTitle(e.target.value)}
                          aria-label={`Editar tarefa ${task.title}`}
                        />
                        <div className="task-item__actions">
                          <Button size="sm" onClick={() => handleUpdateTask(task.id)}>
                            <Save size={14} aria-hidden="true" />
                            Salvar
                          </Button>
                          <Button variant="outline" size="sm" onClick={cancelEditingTask}>
                            <X size={14} aria-hidden="true" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="task-item__title">
                          <CheckCircle2 size={16} aria-hidden="true" />
                          <strong>{task.title}</strong>
                        </div>
                        <div className="task-item__actions">
                          <Button variant="outline" size="sm" onClick={() => startEditingTask(task)}>
                            <Pencil size={14} aria-hidden="true" />
                            Editar
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 size={14} aria-hidden="true" />
                            Deletar
                          </Button>
                        </div>
                      </>
                    )}
                    <small>ID da Empresa: {task.tenantId}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <ListTodo size={28} aria-hidden="true" />
                <p>Nenhuma tarefa encontrada.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default App;