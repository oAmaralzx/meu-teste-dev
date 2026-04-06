import { Search } from 'lucide-react';
import { Input } from './ui/input';

function TaskSearchInput({ value, onChange }) {
  return (
    <div className="search-bar">
      <Search size={16} aria-hidden="true" />
      <Input
        placeholder="Buscar tarefa por nome..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Buscar tarefa por nome"
      />
    </div>
  );
}

export default TaskSearchInput;
