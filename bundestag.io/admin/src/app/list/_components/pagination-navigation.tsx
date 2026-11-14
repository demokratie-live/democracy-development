import Link from 'next/link';

import { Button } from '@/components/ui/button';

type Props = { currentPage: number; totalPages: number };

export const PaginationNavigation = ({ currentPage, totalPages }: Props) => (
  <nav aria-label="Seiten" className="flex items-center gap-3">
    {currentPage > 1 ? (
      <Button asChild variant="outline" size="sm">
        <Link href={`?page=${currentPage - 1}`}>Zurück</Link>
      </Button>
    ) : (
      <Button variant="outline" size="sm" disabled>
        Zurück
      </Button>
    )}
    <span className="text-sm text-muted-foreground tabular-nums">{`Seite ${currentPage} von ${totalPages}`}</span>
    {currentPage < totalPages ? (
      <Button asChild variant="outline" size="sm">
        <Link href={`?page=${currentPage + 1}`}>Weiter</Link>
      </Button>
    ) : (
      <Button variant="outline" size="sm" disabled>
        Weiter
      </Button>
    )}
  </nav>
);
