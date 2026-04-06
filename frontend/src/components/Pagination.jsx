import { Button } from './ui/button';

function Pagination({ currentPage, totalPages, onPageChange, isLoading = false }) {
  if (!totalPages || totalPages <= 1) return null;

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <nav className="pagination" aria-label="Paginação das tarefas">
      <Button
        variant="outline"
        size="sm"
        className="pagination__button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
      >
        Anterior
      </Button>

      <p className="pagination__indicator" aria-live="polite">
        {isLoading && <span className="pagination__loading-dot" aria-hidden="true" />}
        Página {currentPage} de {totalPages}
      </p>

      <Button
        variant="outline"
        size="sm"
        className="pagination__button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
      >
        Próximo
      </Button>
    </nav>
  );
}

export default Pagination;
