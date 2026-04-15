import React from 'react';
import PaymentsAdmin from '@/components/admin/Payment';
import PaymentsClient from '@/components/client/Payment';
import { getUser } from '@/utils/auth';

const Payments: React.FC = () => {
  const userIdn = getUser();

  return (
    <>
      {
        userIdn.role === 'admin'? (
          <PaymentsAdmin />
        ): (
          <PaymentsClient userIdn={userIdn} />
        )
      }
    </>
  );
};

export default Payments;