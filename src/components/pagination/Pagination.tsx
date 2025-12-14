import { Button } from '@/components/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-white dark:bg-gray-800 border dark:text-white text-black  border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Anterior
      </Button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Show first page, last page, current page, and pages around current
          const showPage = 
            page === 1 || 
            page === totalPages || 
            (page >= currentPage - 1 && page <= currentPage + 1);
          
          const showEllipsis = 
            (page === 2 && currentPage > 3) || 
            (page === totalPages - 1 && currentPage < totalPages - 2);

          if (showEllipsis) {
            return <span key={page} className="px-2 text-gray-400">...</span>;
          }

          if (!showPage) return null;

          return (
            <Button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                currentPage === page
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg dark:text-white text-black '
                  : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white text-black' 
              }`}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:text-white text-black rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Próxima
      </Button>
    </div>
  );
}
