import { describe, expect, it } from 'vitest';
import { filterTasksByTitle } from './taskFilters';

describe('filterTasksByTitle', () => {
  const tasks = [
    { id: '1', title: 'Revisar relatório mensal' },
    { id: '2', title: 'Planejar sprint' },
    { id: '3', title: 'RELATORIO de custos' }
  ];

  it('retorna todas as tarefas quando busca está vazia', () => {
    expect(filterTasksByTitle(tasks, '')).toEqual(tasks);
    expect(filterTasksByTitle(tasks, '   ')).toEqual(tasks);
  });

  it('filtra tarefas por nome ignorando maiúsculas/minúsculas', () => {
    const result = filterTasksByTitle(tasks, 'relatorio');
    expect(result).toEqual([
      { id: '3', title: 'RELATORIO de custos' }
    ]);
  });
});
