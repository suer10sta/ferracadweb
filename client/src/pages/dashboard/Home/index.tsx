import { getUser } from '@/utils/auth';
import DashboardAdmin from '@/components/admin/Dashboard';
import DashboardClient from '@/components/client/Dashboard';

const index = () => {
  const userIdn = getUser();

  return (
    <>
      {
        userIdn.role === "admin" ? (
          <DashboardAdmin />
        ) : (
          <DashboardClient />
        )
      }
    </>
  )
}

export default index