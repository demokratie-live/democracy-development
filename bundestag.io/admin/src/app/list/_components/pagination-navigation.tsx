import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const PaginationNavigation = ({ currentPage, totalPages }) => (
  <div className="flex items-center gap-3">
    {currentPage > 1 ? (
      <Button asChild variant="outline" size="sm">
        <Link href={`?page=${currentPage - 1}`}>Previous</Link>
      </Button>
    ) : (
      <Button variant="outline" size="sm" disabled>
        Previous
      </Button>
    )}
    <span className="text-sm text-muted-foreground">{`Page ${currentPage} of ${totalPages}`}</span>
    {currentPage < totalPages ? (
      <Button asChild variant="outline" size="sm">
        <Link href={`?page=${currentPage + 1}`}>Next</Link>
      </Button>
    ) : (
      <Button variant="outline" size="sm" disabled>
        Next
      </Button>
    )}
  </div>
);
