import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TaskSearchInput from './TaskSearchInput';

describe('TaskSearchInput', () => {
  it('renderiza o campo de busca e dispara onChange ao digitar', () => {
    const handleChange = vi.fn();
    render(<TaskSearchInput value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox', { name: /buscar tarefa por nome/i });
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Relatório' } });

    expect(handleChange).toHaveBeenCalledWith('Relatório');
  });
});
