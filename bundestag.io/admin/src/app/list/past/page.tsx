import { unstable_noStore as noStore } from 'next/cache';
import { fetchProcedures } from '../_utils/fetchProcedures';
import PageTemplate from '../_components/PageTemplate';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
  noStore();
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const { procedures, count } = await fetchProcedures(
    `${process.env.PROCEDURES_SERVER_URL}/procedures/list/past`,
    currentPage,
  );

  return <PageTemplate title="Past procedures" procedures={procedures} count={count} currentPage={currentPage} />;
}
