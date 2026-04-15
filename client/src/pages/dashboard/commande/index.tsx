import CommandeAdmin from '@/components/admin/Commande';
import CommandeClient from '@/components/client/Commande';
import Loading from '@/components/elements/Loading';
import { user } from '@/data/mockData';
import { useState, useEffect } from 'react';


const index = () => {
  const [userData, setuserData] = useState<any>({});
  const [loading, setLoading] = useState<any>(true);

  useEffect(()=> {
    const getData = async () => {
      try {
        const getUser = await user();

        setuserData(getUser || []);
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    }

    getData()
  }, [])

  if(!userData?._id) {
    return <Loading />;
  }

  if(loading) {
    return <Loading />;
  }
  return (
    <>
      {
        userData.role === 'admin' ? (
          <CommandeAdmin />
        ) : (
          <CommandeClient />
        )
      }
    </>
  );
};

export default index;