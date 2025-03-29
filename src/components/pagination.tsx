interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
  }
  
  export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
  
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };
  
    return (
      <div className="pagination">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="pagination-button"
        >
          &larr; Prev
        </button>
        
        {getPageNumbers().map(num => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`pagination-button ${page === num ? 'active' : ''}`}
          >
            {num}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="pagination-button"
        >
          Next &rarr;
        </button>
      </div>
    );
  }