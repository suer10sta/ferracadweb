"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { faqsData, type FAQ } from "@/data/mockData";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { RiQuestionLine } from "react-icons/ri";
import CardDetails from "@/components/dashboard/Card";
import { getUser } from "@/utils/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/services/api";
import Loading from "@/components/elements/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lang/LanguageProvider";

export default function FAQPage() {
  const { t } = useLanguage();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const getfaqData = await faqsData();
        setFaqs(getfaqData);
      } catch (error) {
        // console.error("Failed to fetch faq:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [loading]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: "",
    category: "",
    isDraft: false,
    isItPrincipale: false,
    lang: "fr",
  });

  const categories = [
    "Général",
    "Installation",
    "Configuration",
    "Utilisation",
    "Licence et Abonnement",
    "Dépannage / Support",
  ];

  const handleAddFaq = async () => {
    setLoading(true);
    try {
      if (!newFaq.answer || !newFaq.category || !newFaq.question) {
        toast.warning(t("dashboard_rent_fillRequiredFields"));
        return;
      }

      const res = await apiClient.post("/faq", newFaq);

      if (res.status === 201) {
        toast.success(t('dashboardClient_orders_operationSuccess'));
        const faq: FAQ = {
          _id: (faqs.length + 1).toString(),
          ...newFaq,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
          isItPrincipale: true,
          isDraft: false,
        };

        setFaqs([...faqs, faq]);
        setNewFaq({
          question: "",
          answer: "",
          category: "General",
          isItPrincipale: false,
          isDraft: false,
          lang: "fr",
        });
        setIsAddDialogOpen(false);
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    setLoading(true);
    try {
      const res = await apiClient.delete(`/faq/${id}`);
      if (res.status === 200) {
        toast.success(t('dashboard_faq_deleted'));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (fq: any) => {
    setLoading(true);
    try {
      const res = await apiClient.put(`/faq/${fq._id}`, {
        isDraftChange: !fq.isDraft,
      });
      if (res.status === 200) {
        setFaqs((prev) =>
          prev.map((faq: any) =>
            faq._id === fq._id ? { ...faq, isDraft: !faq.isDraft } : faq
          )
        );
        toast.success(t('dashboard_faq_updated'));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      toast.warning(error.response.data.message);
      // console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Installation: "bg-blue-100 text-blue-800",
      Abonnement: "bg-green-100 text-green-800",
      Support: "bg-orange-100 text-orange-800",
      Licence: "bg-purple-100 text-purple-800",
      General: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors["General"];
  };

  const publishedFAQs = faqs.filter((faq) => !faq.isDraft).length;
  const draftFAQs = faqs.filter((faq) => faq.isDraft).length;
  const principalFAQs = faqs.filter((faq) => faq.isItPrincipale).length;

  const [QuickAnalytic, setQuickAnalytic] = useState<any[]>([]);

  useEffect(() => {
    setQuickAnalytic([
      {
        title: t('dashboard_faq_total'),
        icon: RiQuestionLine,
        value: faqs.length,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 0,
        isDark: true,
        isPercent: false,
        parag: t('dashboard_faq_totalQuestions'),
      },
      {
        title: t('dashboard_faq_published'),
        icon: IoEye,
        value: publishedFAQs,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 0,
        isDark: false,
        isPercent: false,
        parag: t('dashboard_faq_visibleToUsers'),
      },
      {
        title: t('dashboard_faq_drafts'),
        icon: IoEyeOff,
        value: draftFAQs,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 0,
        isDark: false,
        isPercent: false,
        parag: t('dashboard_faq_inProgress'),
      },
      {
        title: t('dashboard_faq_main'),
        icon: RiQuestionLine,
        value: principalFAQs,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 0,
        isDark: false,
        isPercent: false,
        parag: t('dashboard_faq_importantQuestions'),
      },
    ]);
  }, [loading, faqs, t]);

  const userIdn = getUser();
  const navigate = useNavigate();

  const [newFaqUpdate, setNewFaqUpdate] = useState({
    id: "",
    question: "",
    answer: "",
    category: "",
    isDraft: false,
    isItPrincipale: false,
    isDraftChange: null,
    lang: ""
  });

  const handleUpdateFaq = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (
      !newFaqUpdate.question ||
      !newFaqUpdate.answer ||
      !newFaqUpdate.category ||
      !newFaqUpdate.id
    ) {
      toast.warning(t('dashboard_rent_fillRequiredFields'));
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.put(`/faq/${newFaqUpdate.id}`, newFaqUpdate);

      if (res.status === 200) {
        toast.success(t('dashboard_faq_updated'));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "Anglais" },
    { code: "fl", label: "Nederlands" },
  ];

  if (userIdn.role !== "admin" && userIdn.role) {
    navigate(-1);
    return;
  }

  if (!userIdn.role) {
    return <Loading />;
  }

  return (
    <div className="space-y-5 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
          <p className="text-sm text-black/40">
            {t('dashboard_faq_manage')}
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard_faq_new')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('dashboard_faq_addNew')}</DialogTitle>
              <DialogDescription>
                {t('dashboard_faq_createNew')}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue={newFaq.lang}>
              <TabsList className="w-full">
                {languages.map((langCode) => (
                  <TabsTrigger
                    key={langCode.code}
                    value={langCode.code}
                    onClick={() =>
                      setNewFaq({ ...newFaq, lang: langCode.code })
                    }
                  >
                    {langCode.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {languages.map((langCode) => (
                <TabsContent key={langCode.code} value={langCode.code}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">{t('dashboard_faq_category')}</Label>
                      <Select
                        value={newFaq.category}
                        onValueChange={(value) =>
                          setNewFaq({ ...newFaq, category: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="question">{t('dashboard_faq_question')}</Label>
                      <Input
                        id="question"
                        value={newFaq.question}
                        onChange={(e) =>
                          setNewFaq({ ...newFaq, question: e.target.value })
                        }
                        placeholder={t('dashboard_faq_enterQuestion')}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="answer">{t('dashboard_faq_answer')}</Label>
                      <Textarea
                        id="answer"
                        value={newFaq.answer}
                        onChange={(e: { target: { value: any } }) =>
                          setNewFaq({ ...newFaq, answer: e.target.value })
                        }
                        placeholder={t('dashboard_faq_enterAnswer')}
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={!newFaq.isDraft}
                        onCheckedChange={(checked) =>
                          setNewFaq({ ...newFaq, isDraft: checked })
                        }
                      />
                      <Label htmlFor="published">{t('dashboard_faq_publishImmediately')}</Label>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <DialogFooter>
              <Button
                onClick={handleAddFaq}
                disabled={!newFaq.question || !newFaq.answer}
              >
                {t('dashboard_faq_add')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {QuickAnalytic.map((analytic, index) => (
          <CardDetails key={index} analytic={analytic} />
        ))}
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
        {faqs.map((faq) => (
          <Card
            key={faq._id}
            className={`${
              !faq.isDraft ? "" : "opacity-60"
            } gap-2 flex-col justify-between`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={
                        faq.category
                          ? getCategoryBadgeColor(faq.category)
                          : "N/A"
                      }
                    >
                      {faq.category}
                    </Badge>
                    {!faq.isDraft ? (
                      <Badge variant="secondary" className="">
                        <Eye className="h-3 w-3 mr-1" />
                        {t('dashboard_faq_publishedStatus')}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <EyeOff className="h-3 w-3 mr-1" />
                        {t('dashboard_faq_draftStatus')}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={!faq.isDraft}
                    onCheckedChange={() => togglePublished(faq)}
                    className="cursor-pointer"
                  />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setNewFaqUpdate({
                            id: faq._id,
                            question: faq.question,
                            answer: faq.answer,
                            category: faq.category || "",
                            isDraft: faq.isDraft,
                            isItPrincipale: faq.isItPrincipale,
                            isDraftChange: null,
                            lang: faq.lang
                          })
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>{t('dashboard_faq_edit')}</DialogTitle>
                        <DialogDescription>
                          {t('dashboard_faq_editQuestionAnswer')}
                        </DialogDescription>
                      </DialogHeader>
                      <Tabs defaultValue={newFaqUpdate.lang}>
                        <TabsList className="w-full">
                          {languages.map((langCode) => (
                            <TabsTrigger
                              key={langCode.code}
                              value={langCode.code}
                              onClick={() =>
                                setNewFaqUpdate({ ...newFaqUpdate, lang: langCode.code })
                              }
                            >
                              {langCode.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {languages.map((langCode) => (
                          <TabsContent
                            key={langCode.code}
                            value={langCode.code}
                          >
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-category">{t('dashboard_faq_category')}</Label>
                                <Select
                                  value={newFaqUpdate.category}
                                  onValueChange={(value) =>
                                    setNewFaqUpdate({
                                      ...newFaqUpdate,
                                      category: value,
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem
                                        key={category}
                                        value={category}
                                      >
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-question">{t('dashboard_faq_question')}</Label>
                                <Input
                                  id="edit-question"
                                  value={newFaqUpdate.question}
                                  onChange={(e) =>
                                    setNewFaqUpdate({
                                      ...newFaqUpdate,
                                      question: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-answer">{t('dashboard_faq_answer')}</Label>
                                <Textarea
                                  id="edit-answer"
                                  value={newFaqUpdate.answer}
                                  onChange={(e: { target: { value: any } }) =>
                                    setNewFaqUpdate({
                                      ...newFaqUpdate,
                                      answer: e.target.value,
                                    })
                                  }
                                  rows={4}
                                />
                              </div>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                      <DialogFooter>
                        <DialogClose>
                          <Button type="submit" onClick={handleUpdateFaq}>
                            {t('dashboard_faq_save')}
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('dashboard_faq_confirmDelete')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('dashboard_faq_irreversible')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('dashboard_faq_cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteFaq(faq._id)}
                        >
                          {t('dashboard_faq_delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                {faq.answer.slice(0, 100)} ...
              </p>
              <p className="text-xs text-muted-foreground">
                Créé le{" "}
                {faq.createdAt
                  ? new Date(faq.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
