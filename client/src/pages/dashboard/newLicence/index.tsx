import NewLicenceAdmin from '@/components/admin/NewLicence';
import NewLicence from '@/components/client/NewLicence'
import Loading from '@/components/elements/Loading';
import { user } from '@/data/mockData';
import { useEffect, useState } from 'react';

const index = () => {
  const [userIdn, setUserIdn] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    const getData = async () => {
      try {
        const UserData = await user();
        setUserIdn(UserData);
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    }

    getData()
  }, [])

  if(loading) {
    return <Loading />
  }

  return (
    <>
      {
        userIdn.role === "admin" ? (
          <NewLicenceAdmin />
        ) : (
          <NewLicence />
        )
      }
    </>
  );
}

export default index;