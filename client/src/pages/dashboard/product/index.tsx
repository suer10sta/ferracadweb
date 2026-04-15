import React from 'react';
import ProductsAdmin from '@/components/admin/Product';
import ProductsClient from '@/components/client/Product';
import { getUser } from '@/utils/auth';

const Products: React.FC = () => {
  const userIdn = getUser();

  return (
    <>
      {
        userIdn.role === 'admin' ? (
          <ProductsAdmin />
        ) : (
          <ProductsClient />
        )
      }
    </>
  );
};

export default Products;