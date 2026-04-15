import React, { useState, useRef, useEffect } from "react";
import { Download, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { products } from "@/data/mockData";
import { FiEdit2, FiPackage } from "react-icons/fi";
import { IoMdEye } from "react-icons/io";
import CardDetails from "@/components/dashboard/Card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MdDeleteOutline, MdOutlineFileUpload } from "react-icons/md";
import { toast } from "sonner";
import apiClient from "@/services/api";
import Loading from "../elements/Loading";
import { useLanguage } from "@/lang/LanguageProvider";

const ProductsAdmin: React.FC = () => {
  const { t } = useLanguage();
  const [downloadData, setDownload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [startUploading, setStartUploading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const getFerracaVersions = await products();
        setDownload(getFerracaVersions || []);
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [loading, startUploading]);

  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [formData, setformData] = useState({
    name: "",
    version: "",
    platform: "",
    platformVersion: "",
    fileData: "",
    fileName: "",
    visible: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setformData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredProducts =
    selectedPlatform === "all"
      ? downloadData
      : downloadData.filter((product) => product.platform === selectedPlatform);

  const platformStats = {
    autocad: downloadData.filter((p) => p.platform === "autocad").length,
    zwcad: downloadData.filter((p) => p.platform === "zwcad").length,
    revit: downloadData.filter((p) => p.platform === "revit").length,
    public: downloadData.filter((p) => p.isPublic).length,
    private: downloadData.filter((p) => !p.isPublic).length,
    valid: downloadData.filter((p) => p.validVersion).length,
  };

  const getPlatformBadge = (platform: string) => {
    const badges = {
      autocad: (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          AutoCAD
        </Badge>
      ),
      zwcad: (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          ZWCAD
        </Badge>
      ),
      revit: (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
          Revit
        </Badge>
      ),
    };
    return (
      badges[platform as keyof typeof badges] || (
        <Badge variant="outline">{platform}</Badge>
      )
    );
  };

  const [QuickAnalytic, setQuickAnalytic] = useState<any[]>([]);

  useEffect(() => {
    setQuickAnalytic([
      {
        title: "AutoCAD",
        icon: FiPackage,
        value: platformStats.autocad,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 0,
        isDark: false,
        isPercent: false,
        parag: t("dashboard_product_availablePlugins"),
      },
      {
        title: "ZWCAD",
        icon: FiPackage,
        value: platformStats.zwcad,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 0,
        isDark: false,
        isPercent: false,
        parag: t("dashboard_product_availablePlugins"),
      },
      {
        title: "Revit",
        icon: FiPackage,
        value: platformStats.revit,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 0,
        isDark: false,
        isPercent: false,
        parag: t("dashboard_product_availablePlugins"),
      },
      {
        title: t("dashboard_product_public"),
        icon: IoMdEye,
        value: platformStats.public,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 0,
        isDark: true,
        isPercent: false,
        parag: t("dashboard_product_accessibleToAll"),
      },
    ]);
  }, [loading, t, startUploading]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setformData((prev) => ({
          ...prev,
          fileData: reader.result as string,
          fileName: file.name,
        }));
      };
      reader.readAsDataURL(file); // base64 encode the file
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.version ||
      !formData.platform ||
      !formData.platformVersion ||
      !formData.fileData ||
      !formData.fileName
    ) {
      toast.warning(t("dashboard_product_missingInfo"));
      return;
    }
    setStartUploading(true);
    try {
      // Prepare FormData
      const data = new FormData();
      data.append("name", formData.name);
      data.append("version", formData.version);
      data.append("platform", formData.platform);
      data.append("platformVersion", formData.platformVersion);

      // Convert base64 to Blob for upload
      const byteString = atob(formData.fileData.split(",")[1]);
      const mimeString = formData.fileData
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      data.append("file", blob, formData.fileName);

      // Send request
      const response = await apiClient.post("/product", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 3000000,
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            // console.log(progress / 2)
            setUploadProgress(progress / 2);
          } else {
            // console.log(`Uploaded: ${progressEvent.loaded} bytes`);
          }
        },
      });

      if (response.status === 201) {
        setformData({
          name: "",
          version: "",
          platform: "",
          platformVersion: "",
          fileData: "",
          fileName: "",
          visible: "",
        });
        toast.success(t("dashboard_product_dataSentSuccess"));
      } else {
        toast.warning(response.data.message);
      }

      // Optionally reset form or navigate
    } catch (error) {
      // console.error("Erreur lors de l'envoi :", error);
      toast.error(t("dashboard_product_sendFailed"));
    } finally {
      setStartUploading(false);
    }
  };

  const handleDelete = async (id: any) => {
    try {
      setLoading(true);
      const res = await apiClient.delete(`/product/${id}`);
      if (res.status === 200) {
        toast.success(t("dashboard_product_deleteSuccess"));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error) {
      // console.error("Erreur lors de l'envoi :", error);
      toast.error(t("dashboard_product_sendFailed"));
    } finally {
      setLoading(false);
    }
  };

  const [formDataUpdate, setFormDataUpdate] = useState({
    id: "",
    name: "",
    version: "",
    platform: "",
    platformVersion: "",
    fileData: "",
    fileName: "",
    visible: false,
    oldPath: "",
  });

  const handleChangeUpdate = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormDataUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormDataUpdate((prev) => ({
      ...prev,
      visible: checked,
    }));
  };

  const handleFileChangeUpdate = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormDataUpdate((prev) => ({
          ...prev,
          fileData: reader.result as string,
          fileName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProduct = async () => {
    // e.preventDefault();
    if (
      !formDataUpdate.name ||
      !formDataUpdate.version ||
      !formDataUpdate.platform ||
      !formDataUpdate.platformVersion ||
      !formDataUpdate.fileName
    ) {
      toast.warning(t("dashboard_product_missingInfo"));
      return;
    }
    setStartUploading(true);

    try {
      // Prepare FormData
      const data = new FormData();
      data.append("name", formDataUpdate.name);
      data.append("version", formDataUpdate.version);
      data.append("platform", formDataUpdate.platform);
      data.append("platformVersion", formDataUpdate.platformVersion);
      data.append("isPublic", formDataUpdate.visible ? "true" : "false");
      data.append("oldPath", formDataUpdate.oldPath);

      // check if there's new file add
      if (formDataUpdate.fileData) {
        // Convert base64 to Blob for upload
        const byteString = atob(formDataUpdate.fileData.split(",")[1]);
        const mimeString = formDataUpdate.fileData
          .split(",")[0]
          .split(":")[1]
          .split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        data.append("file", blob, formDataUpdate.fileName);
      }

      // Send request
      const response = await apiClient.put(
        `/product/${formDataUpdate.id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 3000000,
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total) {
              const progress =
                (progressEvent.loaded / progressEvent.total) * 100;
              // console.log(progress / 2);
              setUploadProgress(progress / 2);
            } else {
              // console.log(`Uploaded: ${progressEvent.loaded} bytes`);
            }
          },
        }
      );

      if (response.status === 200) {
        setFormDataUpdate({
          id: "",
          name: "",
          version: "",
          platform: "",
          platformVersion: "",
          fileData: "",
          fileName: "",
          visible: false,
          oldPath: "",
        });
        toast.success(t("dashboard_product_dataSentSuccess"));
      } else {
        toast.warning(response.data.message);
      }
    } catch (error) {
      // console.error("Erreur lors de l'envoi :", error);
      toast.error(t("dashboard_product_sendFailed"));
    } finally {
      setStartUploading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {startUploading && (
        <div className="fixed w-full h-screen backdrop-blur-sm bg-black/70 top-0 left-0 z-50 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="border-4 w-16 h-16 rounded-full flex justify-center items-center">
              <p className="text-xl font-semibold text-white">
                {uploadProgress?.toFixed(0)}%
              </p>
            </div>
            <p className="font-medium text-sm text-white/80">
              Veuillez ne pas fermer le site
            </p>
          </div>
        </div>
      )}
      <div className="space-y-5 mb-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("dashboard_product_title")}
            </h2>
            <p className="text-sm text-black/40">
              {t("dashboard_product_description")}
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                {t("dashboard_product_uploadProduct")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:min-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {t("dashboard_product_createNewVersion")}
                </DialogTitle>
                <DialogDescription>
                  {t("dashboard_product_editVersionDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="name">{t("dashboard_product_name")}</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ferracad"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="version">
                    {t("dashboard_product_version")}
                  </Label>
                  <Input
                    id="version"
                    name="version"
                    placeholder="v5.2.1"
                    value={formData.version}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="platform">
                    {t("dashboard_product_platform")}
                  </Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) =>
                      setformData((prev) => ({ ...prev, platform: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t("dashboard_product_selectPlatform")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autocad">AutoCAD</SelectItem>
                      <SelectItem value="zwcad">ZWCAD</SelectItem>
                      <SelectItem value="revit">Revit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="platformVersion">
                    {t("dashboard_product_platformCompatibility")}
                  </Label>
                  <Input
                    id="platformVersion"
                    name="platformVersion"
                    placeholder="2020 - 2024"
                    value={formData.platformVersion}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="file-upload">
                    {t("dashboard_product_upload")}
                  </Label>
                  <div
                    onClick={handleClick}
                    className="h-20 bg-stone-100 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-stone-200 transition-colors"
                  >
                    <MdOutlineFileUpload size={22} />
                    <p className="text-xs text-stone-400 text-center">
                      {t("dashboard_product_uploadFile")}
                    </p>
                    {formData.fileName && (
                      <p className="text-xs text-stone-600 mt-1">
                        {formData.fileName}
                      </p>
                    )}
                  </div>

                  <input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">
                    {t("dashboardAdmin_users_cancel")}
                  </Button>
                </DialogClose>
                <Button type="submit" onClick={handleSubmit}>
                  {t("dashboardAdmin_users_save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {QuickAnalytic.map((analytic, index) => (
            <CardDetails key={index} analytic={analytic} />
          ))}
        </div>

        {/* Platform Filter */}
        <Card className="gap-2 border-0">
          <CardHeader>
            <CardTitle>{t("dashboard_product_filterByPlatform")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {["all", "autocad", "zwcad", "revit"].map((platform) => (
                <Button
                  key={platform}
                  variant={
                    selectedPlatform === platform ? "default" : "outline"
                  }
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedPlatform(platform)}
                >
                  {platform === "all"
                    ? t("dashboard_product_all")
                    : platform.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="border-0">
          <CardHeader>
            <CardTitle>{t("dashboard_product_productList")}</CardTitle>
            <CardDescription>
              {t("dashboard_product_managePlugins")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("dashboard_product_productName")}</TableHead>
                    <TableHead>
                      {t("dashboard_product_productVersion")}
                    </TableHead>
                    <TableHead>
                      {t("dashboard_product_productPlatform")}
                    </TableHead>
                    <TableHead>
                      {t("dashboard_product_compatibility")}
                    </TableHead>
                    <TableHead>{t("dashboard_product_visibility")}</TableHead>
                    <TableHead>{t("dashboard_product_actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground font-bold">
                          {(product.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.version}</Badge>
                      </TableCell>
                      <TableCell>
                        {getPlatformBadge(product.platform)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {product.versionPlatformCompatible}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.isPublic ? (
                            <>
                              <Eye className="h-4 w-4 text-green-500" />
                              <span className="text-sm">
                                {t("dashboard_product_public")}
                              </span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {t("dashboard_product_private")}
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <a
                            href={`${
                              import.meta.env.VITE_API_URL
                            }/product/download/${product.filePath
                              .replace(/\\/g, "/")
                              .split("/")
                              ?.pop()}`}
                            target="_blank"
                            download
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 cursor-pointer border-0 shadow-none"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </a>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 cursor-pointer border-0 shadow-none"
                                onClick={() => {
                                  setFormDataUpdate({
                                    id: product._id,
                                    name: product.name,
                                    version: product.version,
                                    platform: product.platform,
                                    platformVersion:
                                      product.versionPlatformCompatible,
                                    fileData: "",
                                    fileName: product.filePath
                                      .replace(/\\/g, "/")
                                      .split("/")
                                      ?.pop(),
                                    visible: product.isPublic,
                                    oldPath: product.filePath,
                                  });
                                }}
                              >
                                <FiEdit2 className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:min-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>
                                  {t("dashboard_product_editVersion")} FerraCAD
                                  {formDataUpdate.version}
                                </DialogTitle>
                                <DialogDescription>
                                  {t("dashboard_product_editVersionDesc2")}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4">
                                <div className="grid gap-3">
                                  <Label htmlFor="name">
                                    {t("dashboard_product_name")}
                                  </Label>
                                  <Input
                                    id="name"
                                    name="name"
                                    value={formDataUpdate.name}
                                    onChange={handleChangeUpdate}
                                    placeholder="Ferracad for autocad"
                                  />
                                </div>
                                <div className="grid gap-3">
                                  <Label htmlFor="version">
                                    {t("dashboard_product_version")}
                                  </Label>
                                  <Input
                                    id="version"
                                    name="version"
                                    value={formDataUpdate.version}
                                    onChange={handleChangeUpdate}
                                    placeholder="v5.2.1"
                                  />
                                </div>
                                <div className="grid gap-3">
                                  <Label htmlFor="platform">
                                    {t("dashboard_product_platform")}
                                  </Label>
                                  <Select
                                    name="platform"
                                    value={formDataUpdate.platform}
                                    onValueChange={(value) =>
                                      setFormDataUpdate((prev) => ({
                                        ...prev,
                                        platform: value,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue
                                        placeholder={t(
                                          "dashboard_product_selectPlatform"
                                        )}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="autocad">
                                        AutoCAD
                                      </SelectItem>
                                      <SelectItem value="zwcad">
                                        ZWCAD
                                      </SelectItem>
                                      <SelectItem value="revit">
                                        Revit
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-3">
                                  <Label htmlFor="platformVersion">
                                    {t(
                                      "dashboard_product_platformCompatibility"
                                    )}
                                  </Label>
                                  <Input
                                    id="platformVersion"
                                    name="platformVersion"
                                    onChange={handleChangeUpdate}
                                    value={formDataUpdate.platformVersion}
                                    placeholder="2020 - 2024"
                                  />
                                </div>

                                <div className="grid gap-3">
                                  <Label htmlFor="file-upload">
                                    {t("dashboard_product_upload")}
                                  </Label>
                                  <div
                                    onClick={handleClick}
                                    className="h-20 bg-stone-100 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-stone-200 transition-colors"
                                  >
                                    <MdOutlineFileUpload size={22} />
                                    <p className="text-xs text-stone-400 text-center">
                                      {t("dashboard_product_uploadFile")}
                                    </p>
                                    <p className="text-xs text-stone-400 text-center">
                                      {formDataUpdate.fileName}
                                    </p>
                                  </div>

                                  <input
                                    id="file-upload"
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChangeUpdate}
                                    className="hidden"
                                  />
                                </div>

                                <div className="flex justify-between items-center gap-3">
                                  <Label htmlFor="name-1">
                                    {t("dashboard_product_visibilityLabel")}
                                  </Label>
                                  <Switch
                                    id="published"
                                    name="visible"
                                    checked={formDataUpdate.visible}
                                    onCheckedChange={handleSwitchChange}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">
                                    {t("dashboardAdmin_users_cancel")}
                                  </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button
                                    type="submit"
                                    onClick={handleUpdateProduct}
                                  >
                                    {t("dashboardAdmin_users_save")}
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 cursor-pointer border-0 shadow-none"
                              >
                                <MdDeleteOutline className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("dashboard_product_confirmDelete")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("dashboard_product_confirmDeleteDesc")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("dashboardAdmin_users_cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product._id)}
                                >
                                  {t("dashboard_product_delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProductsAdmin;
