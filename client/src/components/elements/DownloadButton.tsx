import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { productsAvailable } from "@/data/mockData";
import {
  ArrowDownToLine,
  Download,
  User,
  Mail,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  FileDown,
  Building
} from "lucide-react";
import { useLanguage } from "@/lang/LanguageProvider";
import useAuth from "@/hooks/useAuth";
import axios from "axios";
import Loading from "./Loading";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const DownloadButton = ({ context, className }: any) => {
  const { t } = useLanguage();
  const isAuthenticated = useAuth();
  const [products, setProducts] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // États pour le formulaire d'authentification
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userCompany, setUserCompany] = useState("");
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
  }>({});
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const getProducts = await productsAvailable();
        setProducts(getProducts || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  // Sort or group products by version (latest first)
  const sortedProducts = [...products].sort((a, b) => {
    const verA = parseFloat(a.version.replace(/[^\d.]/g, "")) || 0;
    const verB = parseFloat(b.version.replace(/[^\d.]/g, "")) || 0;
    return verB - verA;
  });

  // Group by platform
  const autocadProducts = sortedProducts.filter(
    (p) => p.platform.toLowerCase() === "autocad"
  );
  const zwcadProducts = sortedProducts.filter(
    (p) => p.platform.toLowerCase() === "zwcad"
  );

  const validateForm = () => {
    const errors: { name?: string; email?: string } = {};

    if (!userName.trim()) {
      errors.name = "Le nom est requis";
    }

    if (!userEmail.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      errors.email = "Email invalide";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProductSelect = (product: any) => {
    if (isAuthenticated) {
      // Téléchargement direct si authentifié
      triggerDownload(product);
    } else {
      // Afficher le formulaire si non authentifié
      setSelectedProduct(product);
      setShowAuthForm(true);
    }
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      // Télécharger le produit
      if (selectedProduct) {
        triggerDownload(selectedProduct);
      }
      // Réinitialiser le formulaire
      resetForm();
    }
  };

  const triggerDownload = async (product: any) => {
    try {
      const fileName = product.filePath.replace(/\\/g, "/").split("/")?.pop();
      if(!fileName) {
        return;
      };

      setLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/product/unknown/download/${fileName}`,
        {
          userName: userName || "",
          userEmail: userEmail || "",
          userCompany: userCompany || '',
        },
        {
          responseType: 'blob',
          withCredentials: true,
        }
      );

      if(response.status !== 200) {
        return toast.warning(t("error_generic"))
      }
  
      // Créer le lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download.zip');
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
  
      resetForm();
  
    } catch (error: any) {
      // console.log(error)
      toast.warning(t("error_generic"))
    } finally {
      setLoading(false)
    }
  };

  const resetForm = () => {
    setShowAuthForm(false);
    setUserName("");
    setUserEmail("");
    setUserCompany("");
    setFormErrors({});
    setSelectedProduct(null);
    setOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if(loading) {
    return <Loading />
  }

  return (
    <>
      {/* Bouton principal avec design amélioré */}
      <Button
        onClick={() => setOpen(true)}
        className={`${className} group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]`}
        variant="default"
        size="lg"
      >
        <span className="relative z-10 flex items-center gap-2">
          <ArrowDownToLine size={18} className="" />
          <span className="font-semibold">{context}</span>
        </span>
      </Button>

      {/* Dialog principal */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-lg rounded-2xl border-0 p-0 overflow-hidden">
          {/* En-tête avec gradient */}
          <div className="bg-primary p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                {showAuthForm ? <User size={24} /> : <Download size={24} />}
              </div>
              <div>
                <AlertDialogTitle className="text-2xl font-bold text-white">
                  {showAuthForm ? t('ALMOST_DONE') : t('DOWNLOAD')}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-blue-100 mt-1">
                  {showAuthForm
                    ? t('LAST_STEP')
                    : t('CHOOSE_VERSION')}
                </AlertDialogDescription>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-6">
            {showAuthForm ? (
              // Formulaire d'authentification avec design amélioré
              <div className="space-y-6">
                {/* Formulaire */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <User size={16} />
                      {t('dashboardAdmin_users_name')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          formErrors.name
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                        } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      />
                      {formErrors.name && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-xs font-semibold">
                          <AlertCircle size={14} />
                          <span>{formErrors.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Mail size={16} />
                      {t('dashboardAdmin_users_email')}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          formErrors.email
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                        } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      />
                      {formErrors.email && (
                        <div className="flex items-center gap-1 mt-2 text-red-600 text-xs font-semibold">
                          <AlertCircle size={14} />
                          <span>{formErrors.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Building size={16} />
                      {t('dashboardAdmin_users_company')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={userCompany}
                        onChange={(e) => setUserCompany(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-red-300 focus:border-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-center text-sm text-stone-900 mb-1">
                    Vous avez déjà un compte ? <Link to="/connexion" className="text-blue-700">Se connecter</Link>
                  </p>
                </div>

                {/* Bénéfices */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-emerald-600 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-emerald-900 mb-1">
                          {t("WHY_INFO")}
                      </p>
                      <ul className="space-y-1 text-sm text-emerald-700">
                        <li className="flex items-center gap-2">
                          <Sparkles size={12} className="text-emerald-500" />
                          {t('ACCESS_UPDATES')}
                        </li>
                        <li className="flex items-center gap-2">
                          <Sparkles size={12} className="text-emerald-500" />
                          {t('PRIORITY_SUPPORT')}
                        </li>
                        <li className="flex items-center gap-2">
                          <Sparkles size={12} className="text-emerald-500" />
                          {t('EXCLUSIVE_CONTENT')}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1 max-md:gap-5 pt-2">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 py-3 rounded-xl border-2 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={handleFormSubmit}
                    className={`${className} group relative overflow-hidden`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <ArrowDownToLine size={18} className="" />
                      <span className="font-semibold">{context}</span>
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              // Liste des produits avec design amélioré
              <div className="space-y-6">
                {/* Liste des produits */}
                <div className="space-y-6">
                  {/* AutoCAD */}
                  {autocadProducts.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                        <h4 className="font-bold text-lg text-gray-800">
                          AutoCAD
                        </h4>
                        <span className="ml-auto text-xs font-medium px-2 py-1 bg-red-100 text-red-800 rounded-full">
                          {autocadProducts.length} {t('dashboard_product_productVersion')}
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {autocadProducts.map((p) => (
                          <button
                            key={p._id}
                            onClick={() => handleProductSelect(p)}
                            className="group cursor-pointer relative p-4 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                                    {p.name} {p.version}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-red-50 text-red-700 font-medium rounded">
                                    {p.versionPlatformCompatible}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1">
                                    <FileDown size={12} />
                                    {formatFileSize(p.size)}
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span>{p.platform?.toUpperCase()}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowDownToLine
                                  size={18}
                                  className="text-gray-400 group-hover:text-red-500 transition-colors"
                                />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ZWCAD */}
                  {zwcadProducts.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                        <h4 className="font-bold text-lg text-gray-800">
                          ZWCAD
                        </h4>
                        <span className="ml-auto text-xs font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          {zwcadProducts.length} {t('dashboard_product_productVersion')}
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {zwcadProducts.map((p) => (
                          <button
                            key={p._id}
                            onClick={() => handleProductSelect(p)}
                            className="group cursor-pointer relative p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                                    {p.name} {p.version}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 font-medium rounded">
                                    {p.versionPlatformCompatible}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1">
                                    <FileDown size={12} />
                                    {formatFileSize(p.size)}
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span>{p.platform?.toUpperCase()}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowDownToLine
                                  size={18}
                                  className="text-gray-400 group-hover:text-purple-500 transition-colors"
                                />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pied de page */}
          {!showAuthForm && (
            <AlertDialogFooter className="px-6 pb-6 pt-0">
              <AlertDialogCancel className="w-full py-3 rounded-xl border-2 hover:border-gray-300 hover:bg-gray-50 transition-all font-medium">
                {t("dashboardAdmin_users_cancel")}
              </AlertDialogCancel>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DownloadButton;
