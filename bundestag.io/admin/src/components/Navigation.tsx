'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const items = [
  // the detail page /procedure/[id] belongs to ToDo
  { href: '/procedures', label: 'ToDo', match: ['/procedures', '/procedure/'] },
  { href: '/list/past', label: 'Vergangen', match: ['/list/past'] },
  { href: '/list/upcoming', label: 'Kommende', match: ['/list/upcoming'] },
];

export const Navigation = () => {
  const pathname = usePathname() ?? '';

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      {/* on small screens the navigation moves to a second row */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 px-4 sm:flex-nowrap sm:px-6">
        <Link href="/procedures" className="flex h-14 shrink-0 items-center gap-2">
          <Image src="/democracy-mark.svg" alt="" width={28} height={28} />
          <span className="text-[17px] font-semibold">
            bundestag.io <span className="font-normal text-muted-foreground">Admin</span>
          </span>
        </Link>
        <nav
          aria-label="Hauptnavigation"
          className="order-last -mx-4 flex h-11 w-[calc(100%+2rem)] items-stretch gap-1 overflow-x-auto border-t px-1 sm:order-none sm:mx-0 sm:h-14 sm:w-auto sm:min-w-0 sm:flex-1 sm:border-t-0 sm:px-0"
        >
          {items.map(({ href, label, match }) => {
            const active = match.some((prefix) => pathname.startsWith(prefix));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center border-b-2 px-3 text-sm whitespace-nowrap transition-colors',
                  active
                    ? 'border-ci-blue font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <Button variant="ghost" size="sm" className="ml-auto sm:ml-0" onClick={() => signOut()}>
          <LogOut />
          <span className="hidden sm:inline">Abmelden</span>
        </Button>
      </div>
    </header>
  );
};
