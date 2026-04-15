import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// const stripePromise = loadStripe('pk_live_51SI4slB4LVww0Nzzw3pisaDaBzz9MLK2KFznXGHxgRDa4FwHlOcrab7EOQR7P9M6d51S1avoqesUJvJuaoDYCS9D00DWdWPnA5');
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string)
createRoot(document.getElementById('root')!).render(
  <Elements stripe={stripePromise}>
    <App />
  </Elements>,
)