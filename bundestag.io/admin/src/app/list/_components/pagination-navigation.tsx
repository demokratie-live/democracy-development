import Link from 'next/link';

export const PaginationNavigation = ({ currentPage, totalPages }) => (
  <div>
    <Link href={`?page=${currentPage - 1}`} passHref>
      <button disabled={currentPage === 1}>Previous</button>
    </Link>
    <span>{`Page ${currentPage} of ${totalPages}`}</span>
    <Link href={`?page=${currentPage + 1}`} passHref>
      <button disabled={currentPage === totalPages}>Next</button>
    </Link>
  </div>
);
