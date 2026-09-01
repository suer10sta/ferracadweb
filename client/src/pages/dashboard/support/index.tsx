import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Mail, Trash2, Send, MessageSquare, History, CheckCircle2, XCircle } from "lucide-react";
import { getUser } from "@/utils/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/services/api";
import Loading from "@/components/elements/Loading";
import { useLanguage } from "@/lang/LanguageProvider";
import CardDetails from "@/components/dashboard/Card";

interface Reply {
  adminId: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  replies: Reply[];
  isActiveAcc: boolean;
  ip: string;
  ticketNum?: number;
  createdAt: string;
}

export default function SupportPage() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedTickets, setExpandedTickets] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTickets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const fetchTickets = async () => {
    try {
      const res = await apiClient.get("/contact");
      setTickets(res.data.contacts);
    } catch (error) {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const res = await apiClient.post(`/contact/reply/${selectedTicket._id}`, {
        message: replyMessage,
      });

      if (res.status === 200) {
        toast.success(t('dashboard_invoice_sendSuccess'));
        setReplyMessage("");
        setSelectedTicket(res.data.data);
        // Refresh ticket list
        setTickets(prev => prev.map(t => t._id === res.data.data._id ? res.data.data : t));
      }
    } catch (error) {
      toast.error(t('dashboard_invoice_sendError'));
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      const res = await apiClient.patch(`/contact/close/${selectedTicket._id}`);
      if (res.status === 200) {
        toast.success(t('support_close_success') || 'Ticket fermé avec succès');
        setSelectedTicket(res.data.data);
        setTickets(prev => prev.map(t => t._id === res.data.data._id ? res.data.data : t));
      }
    } catch (error) {
      toast.error("Failed to close ticket");
    }
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      const res = await apiClient.delete(`/contact/${id}`);
      if (res.status === 200) {
        toast.success(t('dashboardAdmin_users_deletionSuccess'));
        setTickets(prev => prev.filter(t => t._id !== id));
      }
    } catch (error) {
      toast.error(t('dashboardAdmin_users_deletionError'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none">{t('support_status_pending') || 'En attente'}</Badge>;
      case 'replied':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">{t('support_status_replied') || 'Répondu'}</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none">{t('support_status_closed') || 'Fermé'}</Badge>;
      default:
        return null;
    }
  };

  const userIdn = getUser();
  const navigate = useNavigate();

  if (userIdn.role !== "admin" && userIdn.role) {
    navigate(-1);
    return null;
  }

  if (loading) return <Loading />;

  const stats = [
    {
      title: t('dashboardAdmin_supportTickets'),
      icon: MessageSquare,
      value: tickets.length,
      isDark: true,
      parag: "Total des messages reçus",
      onClick: () => setFilterStatus("all"),
      iconBg: filterStatus === "all" ? "bg-red-600" : "bg-slate-800",
    },
    {
      title: t('support_status_pending') || "En attente",
      icon: Mail,
      value: tickets.filter(t => t.status === 'pending').length,
      isDark: false,
      parag: "Tickets nécessitant une réponse",
      onClick: () => setFilterStatus("pending"),
      iconBg: filterStatus === "pending" ? "bg-red-600" : "bg-slate-800",
    },
    {
      title: t('support_status_replied') || "Répondu",
      icon: Send,
      value: tickets.filter(t => t.status === 'replied').length,
      isDark: false,
      parag: "Tickets déjà traités",
      onClick: () => setFilterStatus("replied"),
      iconBg: filterStatus === "replied" ? "bg-red-600" : "bg-slate-800",
    },
    {
      title: t('support_status_closed') || "Fermé",
      icon: CheckCircle2,
      value: tickets.filter(t => t.status === 'closed').length,
      isDark: false,
      parag: "Tickets archivés",
      onClick: () => setFilterStatus("closed"),
      iconBg: filterStatus === "closed" ? "bg-red-600" : "bg-slate-800",
    },
  ];

  const filteredTickets = filterStatus === "all" 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('support_title') || "Gestion du Support"}</h2>
          <p className="text-sm text-black/40">
            {t('support_description') || "Consultez les messages reçus et répondez directement aux utilisateurs."}
          </p>
        </div>
        {filterStatus !== "all" && (
          <Button variant="outline" size="sm" onClick={() => setFilterStatus("all")} className="text-xs">
            {t('dashboardAdmin_all')} ({tickets.length})
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((analytic, index) => (
          <CardDetails key={index} analytic={analytic} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTickets.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-black/5 rounded-xl border-2 border-dashed border-black/10 text-black/40">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>{t('support_no_tickets') || "Aucun ticket trouvé."}</p>
          </div>
        ) : (
          filteredTickets.map((ticket, index) => (
            <Card key={ticket._id} className={`flex flex-col h-full hover:shadow-md transition-shadow ${ticket.status === 'closed' ? 'opacity-70 grayscale-[0.5]' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(ticket.status)}
                      <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
                        #{ticket.ticketNum || (tickets.length - index)}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-1 mt-2">{ticket.subject}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('support_delete_confirm') || "Supprimer le ticket"}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('support_delete_description') || "Cette action est irréversible. Le message et tout son historique seront définitivement supprimés."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('dashboardAdmin_users_confirmCancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTicket(ticket._id)} className="bg-red-600 hover:bg-red-700">
                            {t('dashboardAdmin_users_confirmDelete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <div className="text-sm text-black/60 mb-4 space-y-1">
                  <p><span className="font-medium text-black/80">{t('support_from') || "De :"}</span> {ticket.name}</p>
                  <p className="text-xs">{ticket.email}</p>
                </div>
                
                <p className={`text-sm text-black/80 mb-4 italic flex-grow ${expandedTickets[ticket._id] ? "whitespace-pre-wrap" : "line-clamp-3"}`}>
                  "{ticket.message}"
                </p>

                {ticket.message && (ticket.message.length > 120 || ticket.message.includes('\n')) && (
                  <button
                    onClick={() => toggleExpand(ticket._id)}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold mb-3 self-start cursor-pointer hover:underline"
                  >
                    {expandedTickets[ticket._id] ? "Voir moins" : "Voir plus"}
                  </button>
                )}

                <div className="pt-4 border-t flex justify-between items-center">
                  <p className="text-[10px] text-black/40">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                  <Button 
                    size="sm" 
                    variant={ticket.status === 'pending' ? "default" : "outline"}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {ticket.status === 'pending' ? (t('support_reply_btn') || "Répondre") : (t('support_view_btn') || "Voir")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start mr-8">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-red-600 font-mono text-sm mr-1">#{selectedTicket?.ticketNum}</span>
                  {selectedTicket?.subject}
                </DialogTitle>
                <DialogDescription>
                  Ticket de {selectedTicket?.name} ({selectedTicket?.email})
                </DialogDescription>
              </div>
              {selectedTicket?.status !== 'closed' && (
                <Button variant="outline" size="sm" onClick={handleCloseTicket} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('support_close_btn') || "Fermer le ticket"}
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 my-4">
            <div className="bg-black/5 p-4 rounded-lg">
              <p className="text-xs font-bold uppercase tracking-wider text-black/40 mb-2">{t('support_message') || "Message :"}</p>
              <p className="text-sm text-black/80 whitespace-pre-wrap">{selectedTicket?.message}</p>
            </div>

            {selectedTicket?.replies && selectedTicket.replies.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  {t('support_history') || "Historique des réponses"}
                </h4>
                <div className="space-y-3">
                  {selectedTicket.replies.map((reply, idx) => (
                    <div key={idx} className="bg-red-50/50 border-l-4 border-red-200 p-3 rounded-r-lg">
                      <p className="text-sm text-black/80 mb-2">{reply.message}</p>
                      <p className="text-[10px] text-black/40 italic">
                        {t('support_replied_by') || "Répondu par"} {reply.adminId?.name || "Admin"} {t('support_date') || "le"} {new Date(reply.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTicket?.status !== 'closed' ? (
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-bold uppercase tracking-wider text-black/40">
                  {t('support_reply_btn') || "Répondre"}
                </p>
                <Textarea 
                  placeholder={t('support_reply_placeholder') || "Saisissez votre réponse ici..."}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-medium">Ce ticket est fermé. Vous ne pouvez plus y répondre depuis l'interface.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              {t('dashboardAdmin_users_cancel')}
            </Button>
            {selectedTicket?.status !== 'closed' && (
              <Button 
                onClick={handleSendReply} 
                disabled={sendingReply || !replyMessage.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {sendingReply ? "Envoi..." : (t('support_send_reply') || "Envoyer la réponse")}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}