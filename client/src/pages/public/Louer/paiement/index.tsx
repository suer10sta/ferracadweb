import {
  CheckoutOne,
} from "@/components";
import { useState } from "react";

const Paiement = () => {
  
  const [formData, setFormData] = useState({
    name: "",
    prenom: "",
    email: "",
    pwd: "",
    reppwd: "",
    pays: "FR",
    companyname: "",
    tva: "",
    idFac: "",
    number: "",
    codepostal: "",
    ville: "",
    adresse: "",
    saveAdresse: false,

    licence: 1,
    numberDays: 30,
    startDate: "",
    informationComputer: [],
    paymentAuto: true,

    platform: "",
    payment: ""
  });
  const [Step, setStep] = useState(0);

  return (
    <section className="w-10/12 min-2xl:w-8/12 mx-auto container">
      <div className="flex items-start gap-5 my-5">
        <div className="w-full flex flex-col gap-5">
          <CheckoutOne 
            Step={Step}
            setStep={setStep}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      </div>
    </section>
  );
};

export default Paiement;
