import { unstable_noStore as noStore } from 'next/cache';
import { fetchProcedures } from '../_utils/fetchProcedures';
import PageTemplate from '../_components/PageTemplate';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }>; };

export default async function Page({ searchParams }: Props) {
  noStore();
  const searchParamsResolved = await searchParams;
  const currentPage = searchParamsResolved.page ? parseInt(searchParamsResolved.page.toString(), 10) : 1;
  const { procedures, count } = await fetchProcedures(
    `${process.env.PROCEDURES_SERVER_URL}/procedures/list/past`,
    currentPage,
  );

  return <PageTemplate title="Past procedures" procedures={procedures} count={count} currentPage={currentPage} />;
}
