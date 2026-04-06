function TaskListSkeleton({ items = 3 }) {
  return (
    <ul className="task-list task-list--cards" aria-label="Carregando tarefas">
      {Array.from({ length: items }, (_, index) => (
        <li key={index} className="task-card task-card--skeleton" aria-hidden="true">
          <div className="skeleton skeleton--line skeleton--title" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </li>
      ))}
    </ul>
  );
}

export default TaskListSkeleton;
