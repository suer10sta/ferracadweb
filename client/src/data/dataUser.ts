
import { registrations, rentals, type Rental, user, payment, licenseHistory, facturesData } from '@/data/mockData';
import { useEffect, useState } from 'react';

export const enrichedUser = ()=> {
  const [rentalData, setRentalData] = useState<Rental[]>([]);
  const [registrationData, setregistrationData] = useState<any[]>([]);
  const [userData, setuserData] = useState<any[]>([]);
  const [paymentData, setpaymentData] = useState<any[]>([]);
  const [LicenseHistoryData, setLicenseHistoryData] = useState<any[]>([]);
  const [FacturesData, setFacturesData] = useState<any[]>([])

  useEffect(()=> {
    const getData = async () => {
      try {
        const getRentls = await rentals();
        const getRegistrations = await registrations();
        const getUser = await user();
        const getPayment = await payment();
        const licenseHis = await licenseHistory();
        const getfactures = await facturesData();

        setFacturesData(getfactures || [])
        setRentalData(getRentls || []);
        setregistrationData(getRegistrations || []);
        setuserData(getUser || []);
        setpaymentData(getPayment || []);
        const filteredLicenseHis = (licenseHis || []).filter((license: { registerId: any; }) =>
          (getRegistrations || []).some(
            (reg: { _id: any; }) => reg._id === license.registerId
          )
        );
        setLicenseHistoryData(filteredLicenseHis);
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      }
    }

    getData()
  }, [])

  if(!userData){
    return null;
  }

  return {
    ...userData,
    LicenseHistoryData,
    registrationData,
    rentalData,
    paymentData,
    FacturesData
  };
};
