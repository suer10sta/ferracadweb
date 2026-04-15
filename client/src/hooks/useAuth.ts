import { useEffect, useState } from 'react';
import axios from 'axios';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/validate`, {
          withCredentials: true
        });
        setIsAuthenticated(res.data.valid);
      } catch (err) {
        // console.log(err)
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return isAuthenticated;
};

export default useAuth;