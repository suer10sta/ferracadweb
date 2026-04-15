import { useEffect, useState } from 'react'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loading from '@/components/elements/Loading';
import { toast } from 'sonner';
import apiClient from '@/services/api';
import { useLanguage } from '@/lang/LanguageProvider';

const index = () => {
  const { t } = useLanguage()
  const location = useLocation();
  const { token } = useParams();
  const email = location.state?.email;
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [code, setCode] = useState("")

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if(code.length > 6) {
      toast.warning("")
    }
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/two-factors-check", { code, email, token })
      if(res.status === 200) {
        navigate("/tableau-de-board")
        toast.success(t('twofactors_successMessage'))
      } else {
        toast.warning(t('twofactors_errorMessage'))
      }
    } catch (error: any) {
      // console.log(error)
      toast.error(t('twofactors_errorMessage'));
    } finally {
      setLoading(false)
    }
  }

  const [countdown, setCountdown] = useState(10);
  const [isActive, setIsActive] = useState(true);

  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsActive(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isActive]);

  const handleResend = async () => {
    try {
      setLoading(true)
      const res = await apiClient.post("/auth/resend-two-factors-code", { token, email })
      if(res.status === 200) {
        toast.success("Le code a été renvoyé avec succès");
        setCountdown(50);
        setIsActive(true)
      } else {
        toast.warning(res.data.message)
      }
    } catch (error: any) {
      // console.log(error)
      toast.error(error?.response.data.message);
    } finally {
      setLoading(false)
    }
  };

  // if(!email) {
  //   navigate("/connexion");
  //   return;
  // }

  if(loading) {
    return <Loading />
  }

  return (
    <section>
        <h3 className="font-medium text-3xl">{t("twofactors_title")}</h3>
        <p className="font-medium text-sm text-stone-600">{t("twofactors_verify")} <span className='font-bold'>{email}</span> {t("twofactors_verifycomplete")}</p>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          <div className='flex flex-col gap-5 justify-center items-center'>
            <InputOTP 
              maxLength={6}
              value={code} 
              onChange={setCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <button className="w-full p-2 font-bold text-sm text-white bg-primary transition-all duration-200 hover:bg-red-900 rounded-lg  cursor-pointer">
              {t('twofactors_verifyButton')}
            </button>
          </div>
        </form>
        <div className='flex justify-center items-center'>
          <button
            onClick={handleResend}
            disabled={isActive}
            className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
              isActive ? "cursor-not-allowed text-stone-400" : "text-stone-900 cursor-pointer"
            }`}
          >
            {isActive ? `${t('twofactors_send')} ${countdown}s` : t('twofactors_enabledResend')}
          </button>
        </div>
    </section>
  )
}

export default index