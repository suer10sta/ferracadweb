import React, { useEffect, useState } from 'react';
import { Search, Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaUsers } from 'react-icons/fa';
import { IoEye } from 'react-icons/io5';
import { IoIosMail } from 'react-icons/io';
import { MdShowChart } from 'react-icons/md';
import CardDetails from '@/components/dashboard/Card';
import { mockNewsletters, mockCampaigns, mockUsers, mockRegistrations } from '@/data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { getUser } from '@/utils/auth';
import Loading from '@/components/elements/Loading';

const Marketing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('subscribers');

  const [mockNewslettersData, setDataLetters] = useState<any []>([])

  const [QuickAnalytic, setQuickAnalytic] = useState([
    {
      title: "Abonnés",
      icon: FaUsers,
      value: mockNewslettersData.length,
      isGrowth: true,
      isCurrency: false,
      valueGrowth: 0,
      isDark: true,
      isPercent: false,
      parag: "+5 cette semaine"
    },
    {
      title: "Campagnes",
      icon: IoIosMail,
      value: mockCampaigns.length,
      isGrowth: true,
      isCurrency: false,
      valueGrowth: 0,
      isDark: false,
      isPercent: false,
      parag: "1 en brouillon"
    },
    {
      title: "Taux d'ouverture",
      icon: IoEye,
      value: "24.5%",
      isGrowth: true,
      isCurrency: false,
      valueGrowth: 2.1,
      isDark: false,
      isPercent: true,
      parag: ""
    },
    {
      title: "Prospects",
      icon: MdShowChart,
      value: mockNewslettersData.filter(s => !s.hasAccount).length,
      isGrowth: true,
      isCurrency: false,
      valueGrowth: 0,
      isDark: false,
      isPercent: false,
      parag: "Sans compte client"
    },
  ])

  useEffect(() => {
    setDataLetters(() =>
      mockNewsletters.map((letter: any) => {
        const hasAccount = mockUsers.some((user) => user.email === letter.email);
        const licenseExpiring = mockRegistrations.some((license) => {
          const user = mockUsers.find((user) => user.email === letter.email);
          return (
            license.userId === user?._id &&
            new Date(license.expirationDate) < new Date()
          );
        });

        return {
          ...letter,
          hasAccount,
          licenseExpiring
        };
      })
    );
  }, []);

  useEffect(() => {
    setQuickAnalytic((prev) => {
      return prev.map((item) => {
        if (item.title === "Prospects") {
          return {
            ...item,
            value: mockNewslettersData.filter((s) => !s.hasAccount).length
          };
        }
  
        if (item.title === "Abonnés") {
          return {
            ...item,
            value: mockNewslettersData.length
          };
        }
  
        return item;
      });
    });
  }, [mockNewslettersData]);
  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubscriberBadge = (subscriber: typeof mockNewslettersData[0]) => {
    if (!subscriber.hasAccount) {
      return <Badge variant="outline">Prospect</Badge>;
    }
    if (subscriber.licenseExpiring) {
      return <Badge className="bg-yellow-100 text-yellow-800">Expire bientôt</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Client actif</Badge>;
  };
  
  const userIdn = getUser();
  const navigate = useNavigate();
  
  if(userIdn.role !== "admin" && userIdn.role){
    navigate(-1);
    return;
  }
  
  if(!userIdn.role) {
    return <Loading />;
  }
  
  if(mockNewslettersData.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-5 mb-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Marketing (En cours de développement)</h2>
          <p className="text-sm text-black/40">
            Gestion des newsletters et campagnes marketing
          </p>
        </div>
        <Link to="/tableau-de-board/marketing/create" className='cursor-pointer'>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {
          QuickAnalytic.map((analytic, index)=> (
            <CardDetails 
              key={index} 
              analytic={analytic} 
            />
          ))
        }
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger className='text-xs' value="subscribers">Abonnés</TabsTrigger>
          <TabsTrigger className='text-xs' value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger className='text-xs' value="segments">Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers">
          <Card className='border-0'>
            <CardHeader>
              <CardTitle>Liste des abonnés</CardTitle>
              <CardDescription>
                Gestion des inscriptions à la newsletter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockNewslettersData.map((subscriber) => (
                      <TableRow key={subscriber._id}>
                        <TableCell className="font-medium">
                          {subscriber.email}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={subscriber.status === 'active' ? 'default' : 'destructive'}
                            className={subscriber.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {subscriber.status === 'active' ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getSubscriberBadge(subscriber)}
                        </TableCell>
                        <TableCell>
                          {formatDate(subscriber.createdDate)}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Send className="mr-1 h-3 w-3" />
                            Envoyer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card className='border-0'>
            <CardHeader>
              <CardTitle>Campagnes marketing</CardTitle>
              <CardDescription>
                Historique et gestion des campagnes email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCampaigns.map((campaign) => (
                  <Card key={campaign._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{campaign.subject}</h3>
                            <Badge variant="outline">{campaign.type}</Badge>
                            <Badge 
                              variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                              className={campaign.status === 'sent' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {campaign.status === 'sent' ? 'Envoyé' : 'Brouillon'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {campaign.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Destinataires: {campaign.totalSenders}</span>
                            <span>Créé le: {formatDate(campaign?.createdDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                          {campaign.status === 'draft' && (
                            <Button size="sm">
                              <Send className="mr-1 h-3 w-3" />
                              Envoyer
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments">
          <Card className='border-0'>
            <CardHeader>
              <CardTitle>Segments d'audience</CardTitle>
              <CardDescription>
                Groupes personnalisés pour cibler vos campagnes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Clients actifs</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {mockNewslettersData.filter(s => s.hasAccount && !s.licenseExpiring).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Utilisateurs avec licence valide
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Licences expirantes</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {mockNewslettersData.filter(s => s.licenseExpiring).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Renouvellement nécessaire
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Prospects</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {mockNewslettersData.filter(s => !s.hasAccount).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Abonnés sans compte
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketing