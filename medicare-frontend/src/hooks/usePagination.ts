import { useState } from 'react';

interface UsePaginationReturn {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  totalPages: number;
  setTotalPages: (total: number) => void;
  resetPage: () => void;
}

const usePagination = (initialLimit = 20): UsePaginationReturn => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(0);

  const nextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const resetPage = () => setPage(1);

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    totalPages,
    setTotalPages,
    resetPage,
  };
};

export default usePagination;
