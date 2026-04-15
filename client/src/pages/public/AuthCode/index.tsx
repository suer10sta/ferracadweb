import { HeroSection, FormAuthCode } from "@/components";
import { Faq } from "@/components/elements/Faq";

const index = () => {
  return (
    <>
      <HeroSection
        title="Enregistrement du logiciel"
        description="Veuillez remplir ce formulaire pour recevoir votre code d’autorisation et activer votre licence Ferracad."
      />
      <div className="flex items-center justify-between w-10/12 min-2xl:w-8/12 container mx-auto my-10 gap-12">
        <FormAuthCode />
      </div>
      <Faq dark={true} />
    </>
  );
};

export default index;
