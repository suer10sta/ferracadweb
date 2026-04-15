import { Target, ArrowDownToLine, Star } from "lucide-react";

const Experts = () => {
  const featureExperts = [
    {
      title: "+500 bureaux d'études",
      desc: "Font confiance à Ferracad pour leurs plans d’armatures",
      icon: Target,
    },
    {
      title: "+98k téléchargements",
      desc: "Utilisateurs conquis dans le monde entier",
      icon: ArrowDownToLine,
    },
    {
      title: "12 ans d’expertise",
      desc: "Dans le domaine du béton armé",
      icon: Star,
    },
  ];
  return (
    <div className="grid grid-rows-3 gap-3 mt-4">
      {featureExperts.map((exp, index) => (
        <div className="flex  justify-between gap-3 w-full" key={index}>
          <div
            className={`${
              index % 2 == 0 ? "w-[70%] flex items-center gap-2" : "w-[30%]"
            } bg-white p-4 rounded-lg`}
          >
            {index % 2 == 0 ? (
              <>
                <div className="bg-primary p-4 rounded-lg">
                  <exp.icon color="#fff" fill="#fff" size={18} />
                </div>
                <div className="flex flex-col">
                  <h5 className="text-sm text-stone-900 font-bold">
                    {exp.title}
                  </h5>
                  <p className="text-stone-600 text-[10px] font-medium">
                    {exp.desc}
                  </p>
                </div>
              </>
            ) : null}
          </div>
          <div
            className={`${
              index % 2 === 0 ? "w-[30%]" : "w-[70%] flex items-center gap-2"
            } bg-white p-5 rounded-lg`}
          >
            {index % 2 !== 0 ? (
              <>
                <div className="bg-primary p-4 rounded-lg">
                  <exp.icon color="#fff" fill="#fff" size={18} />
                </div>
                <div className="flex flex-col">
                  <h5 className="text-sm text-stone-900 font-bold">
                    {exp.title}
                  </h5>
                  <p className="text-stone-600 text-[10px] font-medium">
                    {exp.desc}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Experts;
