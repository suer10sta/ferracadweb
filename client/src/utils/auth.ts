import { useEffect, useState } from 'react';
import axios from 'axios';

export const getUser = () => {
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/validate`, {
          withCredentials: true
        });
        setUser(res.data.user);
      } catch (err) {
        setUser(false);
      }
    };

    checkAuth();
  }, []);

  return user;
};

