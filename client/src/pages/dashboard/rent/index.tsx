import React from 'react';
import RentAdmin from '@/components/admin/Rent';
import RentClient from '@/components/client/Rent';
import { getUser } from '@/utils/auth';

const Licenses: React.FC = () => {
  const userIdn: any = getUser()

  return (
    <>
      {
        userIdn.role === 'admin' ? (
          <RentAdmin />
        ) : (
          <RentClient userIdn={userIdn} />
        )
      }
    </>
  );
};

export default Licenses;