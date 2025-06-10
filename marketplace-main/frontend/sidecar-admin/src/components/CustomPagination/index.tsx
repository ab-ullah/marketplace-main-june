import React from 'react';
import Pagination from 'react-bootstrap/Pagination';

interface CustomPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageRange: number; // Number of pages to display on each side of the current page
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  pageRange,
}) => {
  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  // Calculate the range of page numbers to display
  const startPage = Math.max(1, currentPage - pageRange);
  const endPage = Math.min(totalPages, currentPage + pageRange);

  return (
    <Pagination>
      <Pagination.Prev
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      {startPage > 1 && (
        <>
          <Pagination.Item onClick={() => handlePageChange(1)}>1</Pagination.Item>
          {startPage > 2 && <Pagination.Ellipsis />}
        </>
      )}
      {Array.from({ length: endPage - startPage + 1 }).map((_, index) => (
        <Pagination.Item
          key={startPage + index}
          active={startPage + index === currentPage}
          onClick={() => handlePageChange(startPage + index)}
        >
          {startPage + index}
        </Pagination.Item>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <Pagination.Ellipsis />}
          <Pagination.Item onClick={() => handlePageChange(totalPages)}>{totalPages}</Pagination.Item>
        </>
      )}
      <Pagination.Next
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );
};

export default CustomPagination;
