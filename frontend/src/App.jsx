import { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ListTodo,
  Loader2,
  LogOut,
  Pencil,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  X
} from 'lucide-react';
import api, { setToken } from './api';
import Pagination from './components/Pagination';
import TaskListSkeleton from './components/TaskListSkeleton';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import TaskSearchInput from './components/TaskSearchInput';
import { filterTasksByTitle } from './utils/taskFilters';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState(''); // Estado para o input da nova tarefa
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [subtasksByTask, setSubtasksByTask] = useState({});
  const [newSubtaskTitleByTask, setNewSubtaskTitleByTask] = useState({});
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [savingSubtaskIds, setSavingSubtaskIds] = useState({});
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  const tasksListTopRef = useRef(null);

  // 1. Função de Login
  const handleLogin = async () => {
    try {
      setErrorMessage('');
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token);
      setIsLoggedIn(true);
      await loadTasks(1);
    } catch {
      setErrorMessage('Erro ao logar. Verifique se o backend está rodando.');
    }
  };

  const loadSubtasks = async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/subtasks`);
    return response.data;
  };

  // 2. Função de Listagem
  const loadTasks = async (page = currentPage, options = {}) => {
    const shouldShowPageSkeleton = options.pageTransition && tasks.length > 0;

    if (shouldShowPageSkeleton) {
      setIsPageLoading(true);
    } else {
      setIsLoadingTasks(true);
    }

    setErrorMessage('');
    try {
      const response = await api.get('/tasks', {
        params: {
          page,
          limit: pageSize
        }
      });
      const payload = response.data;
      const loadedTasks = Array.isArray(payload) ? payload : (payload.tasks ?? []);
      setTasks(loadedTasks);
      setCurrentPage(Array.isArray(payload) ? page : (payload.currentPage ?? page));
      setTotalPages(Math.max(Array.isArray(payload) ? 1 : (payload.totalPages ?? 1), 1));
      setTotalItems(Array.isArray(payload) ? loadedTasks.length : (payload.totalItems ?? loadedTasks.length));

      const subtasksEntries = await Promise.all(
        loadedTasks.map(async (task) => [task.id, await loadSubtasks(task.id)])
      );
      setSubtasksByTask(Object.fromEntries(subtasksEntries));
    } catch {
      setErrorMessage('Erro ao carregar tarefas.');
    } finally {
      setIsLoadingTasks(false);
      setIsPageLoading(false);
    }
  };

  // 3. Função para Criar Tarefa
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return; // Não deixa criar vazio
    setIsSaving(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      await api.post('/tasks', { title: newTaskTitle.trim() });
      setNewTaskTitle(''); // Limpa o campo de texto
      await loadTasks(); // Recarrega a lista para mostrar a nova tarefa
      setInfoMessage('Tarefa criada com sucesso.');
    } catch {
      setErrorMessage('Erro ao salvar tarefa.');
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Função para Editar Tarefa
  const handleUpdateTask = async (id) => {
    if (!editingTaskTitle.trim()) return;
    setIsSaving(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      await api.put(`/tasks/${id}`, { title: editingTaskTitle });
      setEditingTaskId(null);
      setEditingTaskTitle('');
      await loadTasks();
      setInfoMessage('Tarefa atualizada.');
    } catch {
      setErrorMessage('Erro ao salvar edição da tarefa.');
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Função para Deletar Tarefa
  const handleDeleteTask = async (id) => {
    setIsSaving(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      await api.delete(`/tasks/${id}`);
      if (editingTaskId === id) {
        setEditingTaskId(null);
        setEditingTaskTitle('');
      }
      await loadTasks();
      setInfoMessage('Tarefa removida.');
    } catch {
      setErrorMessage('Erro ao remover tarefa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubtask = async (taskId) => {
    const title = (newSubtaskTitleByTask[taskId] || '').trim();
    if (!title) return;

    setIsSaving(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      await api.post(`/tasks/${taskId}/subtasks`, { title });
      const subtasks = await loadSubtasks(taskId);
      setSubtasksByTask((prev) => ({ ...prev, [taskId]: subtasks }));
      setNewSubtaskTitleByTask((prev) => ({ ...prev, [taskId]: '' }));
      setInfoMessage('Subtarefa adicionada.');
    } catch {
      setErrorMessage('Erro ao salvar subtarefa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSubtaskDone = async (taskId, subtaskId, done) => {
    setSavingSubtaskIds((prev) => ({ ...prev, [subtaskId]: true }));
    setErrorMessage('');
    setInfoMessage('');
    try {
      const response = await api.put(`/subtasks/${subtaskId}`, { done });
      const updatedSubtask = response.data;
      setSubtasksByTask((prev) => ({
        ...prev,
        [taskId]: (prev[taskId] || []).map((subtask) =>
          subtask.id === updatedSubtask.id ? updatedSubtask : subtask
        )
      }));
      setInfoMessage(done ? 'Subtarefa concluída.' : 'Subtarefa reaberta.');
    } catch {
      setErrorMessage(done ? 'Erro ao concluir subtarefa.' : 'Erro ao reabrir subtarefa.');
    } finally {
      setSavingSubtaskIds((prev) => ({ ...prev, [subtaskId]: false }));
    }
  };

  const startEditingSubtask = (subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskTitle(subtask.title);
  };

  const cancelEditingSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  };

  const handleUpdateSubtask = async (taskId, subtaskId) => {
    const nextTitle = editingSubtaskTitle.trim();
    if (!nextTitle) return;

    setSavingSubtaskIds((prev) => ({ ...prev, [subtaskId]: true }));
    setErrorMessage('');
    setInfoMessage('');
    try {
      const response = await api.put(`/subtasks/${subtaskId}`, { title: nextTitle });
      const updatedSubtask = response.data;
      setSubtasksByTask((prev) => ({
        ...prev,
        [taskId]: (prev[taskId] || []).map((subtask) =>
          subtask.id === updatedSubtask.id ? updatedSubtask : subtask
        )
      }));
      cancelEditingSubtask();
      setInfoMessage('Subtarefa atualizada.');
    } catch {
      setErrorMessage('Erro ao salvar edição da subtarefa.');
    } finally {
      setSavingSubtaskIds((prev) => ({ ...prev, [subtaskId]: false }));
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
    setTasks([]);
    setSubtasksByTask({});
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
    setSavingSubtaskIds({});
    setSearchTerm('');
    setErrorMessage('');
    setInfoMessage('');
    setCurrentPage(1);
    setTotalPages(1);
    setTotalItems(0);
  };

  const filteredTasks = useMemo(() => filterTasksByTitle(tasks, searchTerm), [tasks, searchTerm]);

  const hasTasks = filteredTasks.length > 0;
  const shouldShowPagination = totalItems >= 10 && totalPages > 1;
  const scrollToTaskListTop = () => {
    tasksListTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const changePage = async (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    await loadTasks(page, { pageTransition: true });
    scrollToTaskListTop();
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
            <div ref={tasksListTopRef} />
            <TaskSearchInput value={searchTerm} onChange={setSearchTerm} />

            {errorMessage && <p className="feedback feedback--error">{errorMessage}</p>}
            {infoMessage && <p className="feedback feedback--info">{infoMessage}</p>}

            {isLoadingTasks ? (
              <div className="empty-state">
                <Loader2 size={28} className="spin" aria-hidden="true" />
                <p>Carregando tarefas...</p>
              </div>
            ) : isPageLoading ? (
              <TaskListSkeleton items={3} />
            ) : hasTasks ? (
              <ul className="task-list task-list--cards">
                {filteredTasks.map((task) => {
                  const subtasks = subtasksByTask[task.id] || [];
                  const hasSubtasks = subtasks.length > 0;
                  const areAllSubtasksDone = hasSubtasks && subtasks.every((subtask) => subtask.done);
                  return (
                    <li key={task.id} className="task-card">
                      {editingTaskId === task.id ? (
                        <div className="task-item__edit">
                          <Input
                            value={editingTaskTitle}
                            onChange={(e) => setEditingTaskTitle(e.target.value)}
                            aria-label={`Editar tarefa ${task.title}`}
                          />
                          <div className="task-item__actions">
                            <Button size="sm" onClick={() => handleUpdateTask(task.id)} disabled={isSaving}>
                              <Save size={14} aria-hidden="true" />
                              Salvar
                            </Button>
                            <Button variant="outline" size="sm" onClick={cancelEditingTask} disabled={isSaving}>
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
                            {areAllSubtasksDone && (
                              <small className="task-item__meta">Todas as subtarefas concluídas</small>
                            )}
                          </div>
                          <div className="task-item__actions">
                            <Button variant="outline" size="sm" onClick={() => startEditingTask(task)} disabled={isSaving}>
                              <Pencil size={14} aria-hidden="true" />
                              Editar
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteTask(task.id)} disabled={isSaving}>
                              <Trash2 size={14} aria-hidden="true" />
                              Deletar
                            </Button>
                          </div>
                        </>
                      )}

                      <div className="subtasks-block">
                        <p className="subtasks-title">Subtarefas</p>
                        {subtasks.length > 0 ? (
                          <ul className="subtasks-list">
                            {subtasks.map((subtask) => (
                              <li key={subtask.id} className={`subtask-item ${subtask.done ? 'is-done' : ''}`}>
                                {editingSubtaskId === subtask.id ? (
                                  <div className="subtask-item__edit">
                                    <Input
                                      value={editingSubtaskTitle}
                                      onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                      aria-label={`Editar subtarefa ${subtask.title}`}
                                    />
                                    <div className="task-item__actions">
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateSubtask(task.id, subtask.id)}
                                        disabled={savingSubtaskIds[subtask.id]}
                                      >
                                        {savingSubtaskIds[subtask.id] ? (
                                          <Loader2 size={14} className="spin" aria-hidden="true" />
                                        ) : (
                                          <Save size={14} aria-hidden="true" />
                                        )}
                                        Salvar
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelEditingSubtask}
                                        disabled={savingSubtaskIds[subtask.id]}
                                      >
                                        <X size={14} aria-hidden="true" />
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className="subtask-item__title-button"
                                      onClick={() => startEditingSubtask(subtask)}
                                      disabled={savingSubtaskIds[subtask.id]}
                                      aria-label={`Editar subtarefa ${subtask.title}`}
                                    >
                                      {subtask.done ? (
                                        <CheckCircle2 size={14} aria-hidden="true" />
                                      ) : (
                                        <Circle size={14} aria-hidden="true" />
                                      )}
                                      {subtask.title}
                                    </button>

                                    <div className="subtask-item__actions">
                                      {savingSubtaskIds[subtask.id] && (
                                        <Loader2 size={14} className="spin subtask-item__loading" aria-hidden="true" />
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => startEditingSubtask(subtask)}
                                        disabled={savingSubtaskIds[subtask.id]}
                                      >
                                        <Pencil size={14} aria-hidden="true" />
                                        Editar
                                      </Button>
                                      {!subtask.done && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleToggleSubtaskDone(task.id, subtask.id, true)}
                                          disabled={savingSubtaskIds[subtask.id]}
                                        >
                                          <CheckCircle2 size={14} aria-hidden="true" />
                                          Concluir
                                        </Button>
                                      )}
                                      {subtask.done && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleToggleSubtaskDone(task.id, subtask.id, false)}
                                          disabled={savingSubtaskIds[subtask.id]}
                                        >
                                          <RotateCcw size={14} aria-hidden="true" />
                                          Reabrir
                                        </Button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="subtasks-empty">Nenhuma subtarefa ainda.</p>
                        )}

                        <div className="input-with-action">
                          <Input
                            placeholder="Adicionar subtarefa..."
                            value={newSubtaskTitleByTask[task.id] || ''}
                            onChange={(e) =>
                              setNewSubtaskTitleByTask((prev) => ({ ...prev, [task.id]: e.target.value }))
                            }
                          />
                          <Button onClick={() => handleCreateSubtask(task.id)} disabled={isSaving}>
                            <PlusCircle size={16} aria-hidden="true" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-state">
                <ListTodo size={28} aria-hidden="true" />
                <p>{searchTerm ? 'Nenhuma tarefa corresponde à busca.' : 'Nenhuma tarefa encontrada.'}</p>
              </div>
            )}

            {shouldShowPagination && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={changePage}
                isLoading={isPageLoading}
              />
            )}

            <p className="pagination__summary">
              Mostrando {filteredTasks.length} de {totalItems} tarefas da página {currentPage}.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default App;