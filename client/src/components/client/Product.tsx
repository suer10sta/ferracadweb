import { products } from "@/data/mockData";
import { useLanguage } from "@/lang/LanguageProvider";
import { formatDate } from "@/utils/formatDate";
import { useState, useEffect } from "react";
import { FaRegCalendar } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import { Link } from "react-router-dom";
import Loading from "../elements/Loading";

// Fonction pour comparer les versions semver
const compareVersions = (a: string, b: string) => {
  const parseVersion = (version: string) => {
    const cleanVersion = version.replace('v', '').split('.').map(Number);
    // S'assurer que nous avons au moins 3 parties (major.minor.patch)
    while (cleanVersion.length < 3) cleanVersion.push(0);
    return cleanVersion;
  };

  const versionA = parseVersion(a);
  const versionB = parseVersion(b);

  for (let i = 0; i < 3; i++) {
    if (versionA[i] > versionB[i]) return -1; // a vient avant b (ordre décroissant)
    if (versionA[i] < versionB[i]) return 1;  // b vient avant a
  }
  return 0;
};

const groupProductsByVersion = (products: any[]) => {
  const grouped: { [version: string]: any[] } = {};

  for (const product of products) {
    if (!grouped[product.version]) {
      grouped[product.version] = [];
    }
    grouped[product.version].push(product);
  }

  // Convertir en tableau et trier par version (la plus récente en premier)
  return Object.entries(grouped)
    .map(([version, products]) => ({
      version,
      products,
      // Trouver le produit validVersion dans ce groupe
      validVersion: products.some((p: any) => p.validVersion)
    }))
    .sort((a, b) => compareVersions(a.version, b.version));
};

const ProductsClient = () => {
  const { t } = useLanguage();
  const [downloadData, setDownload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const getFerracaVersions = await products();
        // Filtrer seulement les produits publics
        setDownload(getFerracaVersions.filter((e: { isPublic: any }) => e.isPublic));
      } catch (error) {
        // console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const productsData = groupProductsByVersion(downloadData);

  const handleDownload = (path: string) => {
    document.location.href = `${import.meta.env.VITE_API_URL}/product/download/${path}`;
  };

  // Trouver la dernière version globale (la plus récente)
  const latestGlobalVersion = productsData.length > 0 ? productsData[0].version : null;

  if(loading) {
    return <Loading />;
  }
  return (
    <div className="space-y-5 mb-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('dashboard_product_title')}</h2>
          <p className="text-sm text-black/40">
            {t('dashboard_product_description')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {productsData.slice(0, 3).map((p, i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex flex-col items-start">
                {/* Afficher "Dernière version" seulement pour la version la plus récente globale */}
                {p.version === latestGlobalVersion && (
                  <div className="bg-stone-100 px-1 rounded-full">
                    <p className="text-[8px] font-medium uppercase">
                      {t('dashboard_product_latestVersion')}
                    </p>
                  </div>
                )}
                <h3 className="font-semibold text-sm">FerraCAD {p.version}</h3>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <FaRegCalendar />
                  <p className="text-xs font-medium">
                    {formatDate(p.products[0].createdAt)}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <MdOutlineFileDownload />
                  <p className="text-xs font-medium">
                    {
                      downloadData.filter((e) => e.version === p.version)
                        .length
                    }{" "}
                    {t('telechargement')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {p.products.map((ver, i) => (
                <button
                  onClick={() => handleDownload(ver.filePath.replace(/\\/g, '/').split('/')?.pop())}
                  key={i}
                  className="w-full border border-stone-500 p-3 px-4 rounded-lg transition-all duration-200 hover:bg-stone-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <MdOutlineFileDownload />
                    <div className="text-xs font-medium text-left">
                      <p className="font-medium">
                        {ver.name.toUpperCase()} {ver.platform.toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-black/50">
                          {ver.versionPlatformCompatible}
                        </p>
                        <p className="text-xs font-bold text-black/50">
                          {(ver.size / (1024 * 1024)).toFixed(2)} mb
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <p className="text-center font-medium text-sm">
          {t('dashboardClient_orders_problemContact')}{" "}
          <Link to="/contact" className="underline">
            {t('dashboardClient_orders_contactUsNow')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ProductsClient;