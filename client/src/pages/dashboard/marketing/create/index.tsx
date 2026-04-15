import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Send, Save, Eye, Users, Mail, Target, Clock, Sparkles, Type } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// import EditorJS from '@editorjs/editorjs';
// import Header from '@editorjs/header';
// import List from '@editorjs/list';
// import ImageTool from '@editorjs/image';
// import Embed from '@editorjs/embed';
import { getUser } from "@/utils/auth";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/elements/Loading";

const userSegments = [
  {
    id: "all",
    name: "Tous les utilisateurs",
    count: 1247,
    description: "Tous les utilisateurs de la plateforme",
    icon: Users,
    color: "bg-blue-100 text-blue-800"
  },
  {
    id: "active",
    name: "Utilisateurs actifs",
    count: 892,
    description: "Utilisateurs avec abonnement actif",
    icon: Target,
    color: "bg-green-100 text-green-800"
  },
  {
    id: "inactive",
    name: "Utilisateurs inactifs",
    count: 245,
    description: "Utilisateurs sans abonnement actif",
    icon: Clock,
    color: "bg-orange-100 text-orange-800"
  },
  {
    id: "trial",
    name: "Utilisateurs sans compte",
    count: 110,
    description: "Les utilisateurs qui ont saisi leur adresse e-mail dans la newsletter sans créer de compte",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-800"
  }
];

export default function CreateCampaignPage() {
  const [step, setStep] = useState(1);
  const [campaign, setCampaign] = useState({
    title: "",
    subject: "",
    content: "",
    template: "",
    targetSegment: "",
    scheduledSend: false,
    scheduledDate: "",
    scheduledTime: "",
    preheader: "",
    ctaText: "En savoir plus",
    ctaUrl: "https://ferracad.com"
  });

  const [selectedSegment, setSelectedSegment] = useState<string>("");

  const handleSegmentSelect = (segmentId: string) => {
    setSelectedSegment(segmentId);
    setCampaign({ ...campaign, targetSegment: segmentId });
  };

  const getStepProgress = () => {
    return (step / 3) * 100;
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1:
        return campaign.title && campaign.subject;
      // case 2:
      //   return campaign.template;
      case 2:
        return campaign.targetSegment;
      case 3:
        return campaign.content;
      default:
        return false;
    }
  };

  const getSelectedSegment = () => {
    return userSegments.find(segment => segment.id === selectedSegment);
  };

  const handleSendCampaign = () => {
    alert("Campagne envoyée avec succès!");
  };

  const handleSaveDraft = () => {
    alert("Brouillon sauvegardé!");
  };

  // const editor = new EditorJS({
  //   holder: 'editorjs',
  // 
  //   tools: {
  //     header: {
  //       class: Header as any,
  //       inlineToolbar: ['link'],
  //     },
  //     list: {
  //       class: List,
  //       inlineToolbar: true,
  //     },
  //     image: {
  //       class: ImageTool,
  //       config: {
  //         // Simple base64 upload for testing (not recommended for production)
  //         uploader: {
  //           uploadByFile(file: Blob) {
  //             return new Promise((resolve) => {
  //               const reader = new FileReader();
  //               reader.onload = () => {
  //                 resolve({
  //                   success: 1,
  //                   file: {
  //                     url: reader.result, // base64 encoded image
  //                   },
  //                 });
  //               };
  //               reader.readAsDataURL(file);
  //             });
  //           },
  //         },
  //       },
  //     },
  //     embed: Embed,
  //   },
  // 
  //   placeholder: 'Écrivez votre contenu ici...',
  // });
  
  const userIdn = getUser();
  const navigate = useNavigate();

  if(userIdn.role !== "admin" && userIdn.role){
    navigate(-1);
    return;
  }

  if(!userIdn.role) {
    return <Loading />
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto mb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Créer une campagne</h1>
            <p className="text-sm text-black/40">
              Concevez et envoyez votre campagne d'email marketing
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
          <Button onClick={handleSendCampaign} disabled={step < 3 || !canProceedToNextStep()}>
            <Send className="h-4 w-4 mr-2" />
            Envoyer
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium">Étape {step} sur 3</div>
            <div className="text-sm text-muted-foreground">{Math.round(getStepProgress())}% complété</div>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
          <div className="flex justify-between mt-4 text-xs text-muted-foreground">
            <span className={step >= 1 ? "text-stone-900 font-medium" : ""}>Informations</span>
            {/*<span className={step >= 2 ? "text-stone-900 font-medium" : ""}>Design</span>*/}
            <span className={step >= 2 ? "text-stone-900 font-medium" : ""}>Audience</span>
            <span className={step >= 3 ? "text-stone-900 font-medium" : ""}>Contenu</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Campaign Information */}
          {step === 1 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-stone-800" />
                  <CardTitle>Informations de la campagne</CardTitle>
                </div>
                <CardDescription>
                  Définissez les informations de base de votre campagne
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de la campagne *</Label>
                  <Input
                    id="title"
                    value={campaign.title}
                    onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
                    placeholder="Ex: Promotion de fin d'année 2024"
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Objet de l'email *</Label>
                  <Input
                    id="subject"
                    value={campaign.subject}
                    onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                    placeholder="Ex: 🎄 -30% sur tous les plans Ferracad !"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="campaigne">Type de campagne *</Label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Type de campagne" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bienvenu">Bienvenu</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="annonce">Annonce</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                
                {/*<div className="space-y-2">
                  <Label htmlFor="preheader">Texte de prévisualisation</Label>
                  <Input
                    id="preheader"
                    value={campaign.preheader}
                    onChange={(e) => setCampaign({ ...campaign, preheader: e.target.value })}
                    placeholder="Texte affiché dans la prévisualisation de l'email"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ce texte apparaît après l'objet dans la boîte de réception
                  </p>
                </div>*/}

                <div className="flex items-center space-x-2 p-4 bg-accent/50 rounded-lg">
                  <Switch
                    id="scheduled"
                    checked={campaign.scheduledSend}
                    onCheckedChange={(checked) => setCampaign({ ...campaign, scheduledSend: checked })}
                  />
                  <Label htmlFor="scheduled" className="font-medium">Programmer l'envoi</Label>
                </div>

                {campaign.scheduledSend && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={campaign.scheduledDate}
                        onChange={(e) => setCampaign({ ...campaign, scheduledDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Heure</Label>
                      <Input
                        id="time"
                        type="time"
                        value={campaign.scheduledTime}
                        onChange={(e) => setCampaign({ ...campaign, scheduledTime: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Template Selection 
          {step === 2 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-stone-800" />
                  <CardTitle>Choisir un design</CardTitle>
                </div>
                <CardDescription>
                  Sélectionnez le template qui correspond à votre campagne
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {emailTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-lg ${
                        selectedTemplate === template.id
                          ? "border-stone-800 shadow-lg ring-2 ring-stone-800/20"
                          : "border-border hover:border-stone-800/50"
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="aspect-video rounded-t-lg overflow-hidden">
                        <img
                          src={template.preview}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          {selectedTemplate === template.id && (
                            <Badge className="bg-stone-800 text-stone-100">
                              Sélectionné
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}*/}

          {/* Step 3: Audience Selection */}
          {step === 2 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-stone-800" />
                  <CardTitle>Sélectionner l'audience</CardTitle>
                </div>
                <CardDescription>
                  Choisissez le segment d'utilisateurs à cibler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {userSegments.map((segment) => {
                    const Icon = segment.icon;
                    return (
                      <div
                        key={segment.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                          selectedSegment === segment.id
                            ? "border-stone-800 shadow-md ring-2 ring-stone-800/20"
                            : "border-border hover:border-stone-800/50"
                        }`}
                        onClick={() => handleSegmentSelect(segment.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-lg bg-accent">
                              <Icon className="h-5 w-5 text-stone-800" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{segment.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {segment.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{segment.count.toLocaleString()}</div>
                            <Badge className={segment.color}>
                              {selectedSegment === segment.id ? "Sélectionné" : "Utilisateurs"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Content Creation */}
          {step === 3 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Type className="h-5 w-5 text-stone-800" />
                  <CardTitle>Contenu de l'email</CardTitle>
                </div>
                <CardDescription>
                  Rédigez le contenu de votre campagne
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="content">Message principal *</Label>
                  <div id="editorjs" className="bg-white border rounded-md p-4 min-h-[300px]" />
                  {/*<Textarea
                    id="content"
                    value={campaign.content}
                    onChange={(e) => setCampaign({ ...campaign, content: e.target.value })}
                    placeholder="Rédigez votre message ici..."
                    rows={8}
                    className="resize-none"
                  />*/}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta-text">Texte du bouton d'action</Label>
                    <Input
                      id="cta-text"
                      value={campaign.ctaText}
                      onChange={(e) => setCampaign({ ...campaign, ctaText: e.target.value })}
                      placeholder="En savoir plus"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta-url">Lien du bouton</Label>
                    <Input
                      id="cta-url"
                      value={campaign.ctaUrl}
                      onChange={(e) => setCampaign({ ...campaign, ctaUrl: e.target.value })}
                      placeholder="https://ferracad.com"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <div className="space-y-0">
                    <p className="font-medium text-sm text-blue-900">Aperçu disponible</p>
                    <p className="text-xs text-blue-700">
                      Vous pourrez prévisualiser votre email avant l'envoi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Summary */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Résumé de la campagne</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Titre:</span>
                  <span className="font-medium">{campaign.title || "Non défini"}</span>
                </div>
                {/*<div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Template:</span>
                  <span className="font-medium">
                    {campaign.template ? 
                      emailTemplates.find(t => t.id === campaign.template)?.name : 
                      "Non sélectionné"
                    }
                  </span>
                </div>*/}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Audience:</span>
                  <span className="font-medium">
                    {getSelectedSegment()?.name || "Non sélectionnée"}
                  </span>
                </div>
                {getSelectedSegment() && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Destinataires:</span>
                    <span className="font-bold text-stone-800">
                      {getSelectedSegment()?.count.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => setStep(Math.max(1, step - 1))}
                  variant="outline"
                  disabled={step === 1}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Étape précédente
                </Button>
                <Button
                  onClick={() => setStep(Math.min(3, step + 1))}
                  disabled={step === 3 || !canProceedToNextStep()}
                  className="w-full"
                >
                  {
                    step === 3 ? "Envoyer": "Étape suivante"
                  }
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips 
          <Card className="border-0 shadow-lg bg-gradient-to-br from-stone-800/5 to-stone-800/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-stone-800" />
                Conseils
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {step === 1 && (
                  <>
                    <p>• Utilisez des emojis dans l'objet pour attirer l'attention</p>
                    <p>• Gardez l'objet sous 50 caractères</p>
                    <p>• Le texte de prévisualisation complète l'objet</p>
                  </>
                )}
                {step === 2 && (
                  <>
                    <p>• Choisissez un design cohérent avec votre marque</p>
                    <p>• Les templates modernes ont de meilleurs taux d'ouverture</p>
                    <p>• Pensez à la lisibilité sur mobile</p>
                  </>
                )}
                {step === 3 && (
                  <>
                    <p>• Segmentez votre audience pour plus d'efficacité</p>
                    <p>• Les utilisateurs inactifs nécessitent des messages différents</p>
                    <p>• Testez différents segments pour optimiser</p>
                  </>
                )}
                {step === 4 && (
                  <>
                    <p>• Gardez votre message concis et clair</p>
                    <p>• Utilisez un appel à l'action fort</p>
                    <p>• Personnalisez selon votre audience</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>*/}
        </div>
      </div>
    </div>
  );
}