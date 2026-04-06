export function filterTasksByTitle(tasks, searchTerm) {
  const normalized = (searchTerm || '').trim().toLowerCase();

  if (!normalized) {
    return tasks;
  }

  return tasks.filter((task) => task.title.toLowerCase().includes(normalized));
}
