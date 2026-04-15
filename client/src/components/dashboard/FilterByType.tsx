import { users } from "@/data/mockData";
import React, { useEffect, useState } from "react";

const FilterByType = ({
  // enrichedUser = [],
  setCompanySelected,
  companySelected,
  typeSelected,
  setTypeSelected,
  className = ""
}: any) => {
  const types = ["Touts", "Société", "Individual"];
  const [usersData, setusersData] = useState<any[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const getUsers = await users();

        setusersData(getUsers || []);
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      }
    };

    getData();
  }, []);

  return (
    <div className={`flex flex-col gap-4 items-start ${className}`}>
      <div className="flex flex-wrap gap-3 items-center bg-gray-100 rounded-full">
        {types.map((ty, i) => (
          <button
            key={i}
            className={`p-2 px-5 text-sm font-semibold ${
              ty === typeSelected ? "bg-gray-700 text-white" : ""
            } rounded-full`}
            onClick={() => {
              setCompanySelected("")
              setTypeSelected(ty)
            }}
          >
            {ty}
          </button>
        ))}
      </div>
      {typeSelected !== "Touts" && (
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={`p-1 px-4 ${
                companySelected === ""
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-900"
              } cursor-pointer rounded-lg transition-all duration-150 hover:bg-stone-900 hover:text-white text-sm font-medium`}
              onClick={() => setCompanySelected("")}
            >
              Tout
            </button>
            {usersData
              .filter((e: any) => {
                if(e.role === "admin") {
                  if(e.company) {
                    return true;
                  } else {
                    return false;
                  }
                } else {
                  return true;
                }
              })
              .filter((e: any) => {
                if (typeSelected === "Société") return e?.nTva?.trim();
                if (typeSelected === "Individual") return !e?.nTva?.trim();
                return true; // "Touts" or any other type
              })
              .map(
                (
                  com: { company: any; name: any },
                  i: React.Key | null | undefined
                ) => (
                  <button
                    key={i}
                    className={`p-1 px-4 ${
                      companySelected === (com.company || com.name)
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-900"
                    } cursor-pointer rounded-lg transition-all duration-150 hover:bg-stone-900 hover:text-white text-sm font-medium`}
                    onClick={() => setCompanySelected(com.company || com.name)}
                  >
                    {com.company || com.name}
                  </button>
                )
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterByType;
