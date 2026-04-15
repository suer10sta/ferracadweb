import apiClient from '@/services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  postal: string;
  city: string;
  country: string;
  role: 'admin' | 'client';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  _id: string;
  userId: string;
  rentalId: string;
  company: string;
  computerName: string;
  computerCode: string;
  authCode: string;
  expirationDate: string;
  username: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseHistory {
  _id: string;
  registerId: string;
  startAt: string | Date;
  expirationDate: string | Date;
}

export interface Rental {
  _id: string;
  userId: string;
  payId: string;
  nTva: string;
  duration: number;
  startDate: string;
  message: string;
  status: 'pending' | 'active' | 'expire' | 'inactive';
  deductionAuto: boolean;
  nextBillingDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  type: 'fix' | 'percent';
  code: string;
  validateFrom: string;
  validateTo: string;
  value: number;
  maxUse: number;
  totalUse: number;
  createdAt: string;
  updatedAt: string;
}


export interface Payment {
  _id: string;
  operatorId: string;
  userId: string;
  rentalId: string;
  couponId?: string;
  type: 'stripe' | 'paypal';
  status: 'success' | 'unsuccess';
  totalPricePay: number;
  currency: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  version: string;
  filePath: string;
  isPublic: boolean;
  validVersion: boolean;
  platform: 'autocad' | 'zwcad' | 'revit';
  versionPlatformCompatible: string;
}

export interface Download {
  _id: string;
  ip: string;
  userId: string;
  version: string;
  createdAt: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  isItPrincipale: boolean;
  isDraft: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Newsletter {
  _id: string;
  email: string;
  status: 'active' | 'inactive';
  unsubscribeDate?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface Campaign {
  _id: string;
  type: string;
  subject: string;
  content: string;
  totalSenders: number;
  status: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface Settings {
  _id: string;
  mainColor: string;
  secondColor: string;
  socialMedia: Record<string, string>;
  seoTitle: string;
  seoDescription: string;
  seoTags: string[];
  licenseThresholdForDiscount: number;
  siteStatus: 'active' | 'maintenance';
}

export interface ActivityLog {
  _id: string;
  userId: string;
  userType: 'admin' | 'client';
  action: string;
  actionId: string;
  createdAt: string;
}

export interface LoginLog {
  _id: string;
  userId: string;
  ip: string;
  createdAt: string;
}

export interface PaiementConfiguration {
  _id: string;
  userId: string;
  type: 'cart' | 'paypal';
  email?: string;
  numberCart?: string;
  dateExp?: string;
  cvc?: string;
  nameCart?: string;
  createdAt: Date;
  updatedAt: Date;
}


// Mock Data
export const mockUsers: User[] = [
  {
    _id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@architecturemoderne.fr',
    password: '****',
    phone: '+33 1 23 45 67 89',
    address: '123 Rue de la Paix',
    postal: '75001',
    city: 'Paris',
    country: 'France',
    role: 'client',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2023-06-15T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    _id: '2',
    name: 'Marie Laurent',
    email: 'marie.laurent@bimsolutions.com',
    password: '****',
    phone: '+33 2 34 56 78 90',
    address: '456 Avenue des Champs',
    postal: '69000',
    city: 'Lyon',
    country: 'France',
    role: 'client',
    status: 'active',
    lastLogin: '2024-01-14T14:20:00Z',
    createdAt: '2023-08-22T09:15:00Z',
    updatedAt: '2024-01-14T14:20:00Z'
  },
  {
    _id: '3',
    name: 'Admin User',
    email: 'admin@ferracad.com',
    password: '****',
    phone: '+33 1 00 00 00 00',
    address: '789 Tech Street',
    postal: '75008',
    city: 'Paris',
    country: 'France',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15T16:45:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T16:45:00Z'
  }
];
export const users = async ()=> {
  try {
    const res = await apiClient.get("/user");
    return res.data.users;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const dataAdmin = async ()=> {
  try {
    const res = await apiClient.get("/user/admin");
    return res.data.admin;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const user = async ()=> {
  try {
    const res = await apiClient.get("/user/get");
    return res.data.user;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const mockRegistrations: Registration[] = [
  {
    _id: 'reg1',
    userId: '1',
    company: 'Architecture Moderne SARL',
    rentalId: 'rent1',
    computerName: 'WORKSTATION-01',
    computerCode: 'NNLFW23SKWYKQYKXA3RDWF98C9',
    authCode: 'AUTH-123-456-789',
    expirationDate: '2025-12-15T23:59:59Z',
    createdAt: '2023-06-15T08:00:00Z',
    updatedAt: '2023-06-15T08:00:00Z',
    username: 'user12',
    status: 'Active'
  },
  {
    _id: 'reg5',
    userId: '1',
    company: 'Architecture Moderne SARL',
    rentalId: 'rent1',
    computerName: 'WORKSTATION-02',
    computerCode: 'NL348LPN2YPWF45KB5QFNVNDPV',
    authCode: 'AUTH-123-456-789',
    expirationDate: '2025-11-15T23:59:59Z',
    createdAt: '2023-06-15T08:00:00Z',
    updatedAt: '2023-06-15T08:00:00Z',
    username: 'user10',
    status: 'Active'
  },
  {
    _id: 'reg2',
    userId: '2',
    company: 'BIM Solutions',
    rentalId: 'rent2',
    computerName: 'BIM-STATION-02',
    computerCode: 'M2LF2PT3P4CAEGVTT98BJM8HY2',
    authCode: 'AUTH-987-654-321',
    expirationDate: '2025-10-20T23:59:59Z',
    createdAt: '2023-08-22T09:15:00Z',
    updatedAt: '2023-08-22T09:15:00Z',
    username: 'user02',
    status: 'Active'
  },
  {
    _id: 'reg3',
    userId: '2',
    company: 'BIM Solutions',
    rentalId: 'rent3',
    computerName: 'BIM-STATION-03',
    computerCode: 'UC53U6WB8C3B7TEQWK3C24LHKC',
    authCode: 'AUTH-987-654-321',
    expirationDate: '2025-09-20T23:59:59Z',
    createdAt: '2023-08-22T09:15:00Z',
    updatedAt: '2023-08-22T09:15:00Z',
    username: 'user01',
    status: 'expired'
  },
  {
    _id: 'reg7',
    userId: '3',
    company: 'Stabel',
    rentalId: 'rent2',
    computerName: 'Stabel-STATION-02',
    computerCode: 'JBYJJYKUYKICAEGVTT98BJM8HY2',
    authCode: 'AUTH-987-654-321',
    expirationDate: '2025-07-15T23:59:59Z',
    createdAt: '2023-08-22T09:15:00Z',
    updatedAt: '2023-08-22T09:15:00Z',
    username: 'user02',
    status: 'Active'
  },
];
export const registrations = async ()=> {
  try {
    const res = await apiClient.get("/registration");
    return res.data.registrationsData;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const licenseHistory = async ()=> {
  try {
    const res = await apiClient.get("/history");
    return res.data.historiesData;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const rentals = async ()=> {
  try {
    const res = await apiClient.get("/rental");
    return res.data.rentalData;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const coupon = async ()=> {
  try {
    const res = await apiClient.get("/coupons");
    return res.data.coupons;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const couponById = async (id: any)=> {
  try {
    const res = await apiClient.get(`/coupons/${id}`);
    return res.data.coupon;
  } catch (error: any) {
    // Log technical details for debugging
    // console.error("Stripe API Error (getCoupon):", error);
    throw error;
  }
}

export const payment = async ()=> {
  try {
    const res = await apiClient.get("/payment");
    return res.data.paymentsData;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const products = async ()=> {
  try {
    const res = await apiClient.get("/product");
    return res.data.products;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const productsAvailable = async ()=> {
  try {
    const res = await apiClient.get("/product/list");
    return res.data.products;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const Download = async ()=> {
  try {
    const res = await apiClient.get("/download");
    return res.data.downloads;
  } catch (error: any) {
    // console.log(error)
    return []
  }
}

export const faqsData = async ()=> {
  try {
    const res = await apiClient.get("/faq");
    return res.data.faqs;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const mockNewsletters: Newsletter[] = [
  {
    _id: 'news1',
    email: 'jean.dupont@architecturemoderne.fr',
    status: 'active',
    createdDate: '2025-07-12T09:30:00Z',
    updatedDate: '2025-07-12T09:30:00Z'
  },
  {
    _id: 'news2',
    email: 'jane.smith@example.com',
    status: 'inactive',
    unsubscribeDate: '2025-08-10T17:45:00Z',
    createdDate: '2025-06-01T14:00:00Z',
    updatedDate: '2025-08-10T17:45:00Z'
  },
  {
    _id: 'news3',
    email: 'marie.laurent@bimsolutions.com',
    status: 'active',
    createdDate: '2025-09-01T11:15:00Z',
    updatedDate: '2025-09-01T11:15:00Z'
  },
  {
    _id: 'news4',
    email: 'maria.garcia@example.com',
    status: 'inactive',
    unsubscribeDate: '2025-09-18T08:20:00Z',
    createdDate: '2025-05-22T10:00:00Z',
    updatedDate: '2025-09-18T08:20:00Z'
  },
  {
    _id: 'news5',
    email: 'chris.wong@example.com',
    status: 'active',
    createdDate: '2025-09-21T13:40:00Z',
    updatedDate: '2025-09-21T13:40:00Z'
  }
];

export const mockCampaigns: any[] = [
  {
    _id: 'camp1',
    type: 'product-update',
    subject: 'Ferracad Plugin v5.2.1 Released!',
    content: 'We are excited to announce the release of Ferracad Plugin v5.2.1 with new features and improved performance.',
    totalSenders: 1200,
    status: 'draft',
    createdDate: '2025-09-15T10:00:00Z',
    updatedDate: '2025-09-16T12:30:00Z'
  },
  {
    _id: 'camp2',
    type: 'newsletter',
    subject: 'September Newsletter: Tips, Tricks & Updates',
    content: 'Check out our latest CAD tips and updates for your platform.',
    totalSenders: 950,
    status: 'send',
    createdDate: '2025-09-01T08:45:00Z',
    updatedDate: '2025-09-01T08:45:00Z'
  },
  {
    _id: 'camp3',
    type: 'promotion',
    subject: 'Limited-Time Offer: 25% Off All Plugins',
    content: 'Get 25% off Ferracad plugins until September 30. Don’t miss out!',
    totalSenders: 1800,
    status: 'send',
    createdDate: '2025-09-10T14:20:00Z',
    updatedDate: '2025-09-10T14:20:00Z'
  },
  {
    _id: 'camp4',
    type: 'maintenance',
    subject: 'Scheduled Maintenance on September 27',
    content: 'Our servers will be undergoing maintenance on September 27 from 1:00 AM to 4:00 AM UTC.',
    totalSenders: 600,
    status: 'send',
    createdDate: '2025-09-20T09:10:00Z',
    updatedDate: '2025-09-21T11:00:00Z'
  }
];


export const Logs = async ()=> {
  try {
    const res = await apiClient.get("/logs");
    return res.data.logs;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const settings = async ()=> {
  try {
    const res = await apiClient.get("/settings");
    return res.data.settings;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const paiementConfiguration = async ()=> {
  try {
    const res = await apiClient.get("/payconfig");
    return res.data.paymentConfigsData;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const facturesData = async ()=> {
  try {
    const res = await apiClient.get("/facture");
    return res.data;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const Contact = async ()=> {
  try {
    const res = await apiClient.get("/contact");
    return res.data.contacts;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const NotificationsData = async ()=> {
  try {
    const res = await apiClient.get("/notifications");
    return res.data.notifications;
  } catch (error) {
    // console.log(error)
    return [];
  }
}

export const tauxTva = async (id = 'null')=> {
  try {
    console.log(id)
    const res = await apiClient.get(`/payment/taux-tva/${id}`);
    return res.data;
  } catch (error) {
    // console.log(error)
    return [];
  }
}