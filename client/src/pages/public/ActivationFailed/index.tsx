import Loading from '@/components/elements/Loading';
import { Button } from '@/components/ui/button';
import apiClient from '@/services/api';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const ActivationFailed = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false)
    const token = searchParams.get('token');

    const resendActivationLink = async ()=> {
        try {
            setLoading(true)
            const res = await apiClient.post("/auth/resend-activation", token)
            if(res.status === 200) {
                toast.success("Envoyer avec succès")
            } else {
                toast.warning(res.data.message)
            }
        } catch (error: any) {
            toast.error(error.response.data.message)
        } finally {
            setLoading(false)
        }
    }

    if(loading) {
      return <Loading />
    }

    if(!token) {
      document.location.href = "/"
      return;
    }
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-md p-8 max-w-md text-center">
        <div className="text-red-500 text-4xl mb-4">❌</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Échec de l’activation</h1>
        <p className="text-gray-600 mb-6">
          Le lien d’activation est invalide ou a expiré.<br />
          Veuillez vérifier votre e-mail ou demander un nouveau lien.
        </p>
        <Button
          onClick={resendActivationLink}
          className="cursor-pointer bg-primary hover:bg-red-900 text-white py-2 px-6 rounded-lg transition duration-200 text-sm font-bold"
        >
          Renvoyer le lien d’activation
        </Button>
      </div>
    </div>
  );
};

export default ActivationFailed;