import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Send, Users, Loader2, CheckCircle2, Clock, Calendar, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'paused' | 'cancelled';
  frequency_days: number;
  next_delivery_date: string | null;
  total_savings: number | null;
  created_at: string;
  stripe_subscription_id?: string | null;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  items: { id: string; product_id: string; product_size: string | null; quantity: number; unit_price: number; product?: { name: string } }[];
}

interface ScheduledEmail {
  id: string;
  subject: string;
  message: string;
  recipient_emails: string[];
  scheduled_at: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  error_message: string | null;
}

interface SubscriptionEmailingProps {
  subscriptions: Subscription[];
}

const EMAIL_TEMPLATES = [
  { id: 'custom', name: 'Email personnalisé', description: 'Rédigez votre propre message' },
  { id: 'promo', name: 'Offre promotionnelle', description: 'Annoncez une promotion spéciale' },
  { id: 'new_product', name: 'Nouveau produit', description: 'Présentez un nouveau produit' },
  { id: 'reminder', name: 'Rappel de réapprovisionnement', description: 'Rappelez aux clients de vérifier leur stock' },
  { id: 'survey', name: 'Sondage satisfaction', description: 'Demandez un retour d\'expérience' },
];

const SubscriptionEmailing: React.FC<SubscriptionEmailingProps> = ({ subscriptions }) => {
  const [targetStatus, setTargetStatus] = useState<string>('active');
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const queryClient = useQueryClient();

  const filteredSubscriptions = subscriptions.filter(sub => 
    targetStatus === 'all' || sub.status === targetStatus
  );

  const uniqueEmails = [...new Set(filteredSubscriptions.map(sub => sub.profile?.email).filter(Boolean))] as string[];

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmails(new Set(uniqueEmails));
    } else {
      setSelectedEmails(new Set());
    }
  };

  const handleEmailToggle = (email: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedEmails(newSelected);
    setSelectAll(newSelected.size === uniqueEmails.length);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // Pre-fill subject and message based on template
    switch (templateId) {
      case 'promo':
        setSubject('🎁 Offre exclusive pour nos abonnés');
        setMessage('Bonjour {prenom},\n\nEn tant qu\'abonné fidèle, nous avons le plaisir de vous offrir une remise exceptionnelle de 20% sur votre prochaine commande.\n\nUtilisez le code FIDELITE20 lors de votre prochain achat.\n\nÀ très vite,\nL\'équipe SerenCare');
        break;
      case 'new_product':
        setSubject('✨ Découvrez notre nouveau produit');
        setMessage('Bonjour {prenom},\n\nNous avons le plaisir de vous présenter notre nouveau produit !\n\n[Description du produit]\n\nEn tant qu\'abonné, bénéficiez d\'un accès prioritaire.\n\nCordialement,\nL\'équipe SerenCare');
        break;
      case 'reminder':
        setSubject('📦 Pensez à vérifier votre stock');
        setMessage('Bonjour {prenom},\n\nVotre prochaine livraison approche ! Avez-vous vérifié que les quantités de votre abonnement correspondent à vos besoins ?\n\nVous pouvez ajuster vos produits à tout moment depuis votre espace client.\n\nBien cordialement,\nL\'équipe SerenCare');
        break;
      case 'survey':
        setSubject('💬 Votre avis compte pour nous');
        setMessage('Bonjour {prenom},\n\nVotre satisfaction est notre priorité. Pourriez-vous prendre quelques minutes pour nous donner votre avis sur nos produits et services ?\n\n[Lien vers le sondage]\n\nMerci pour votre confiance,\nL\'équipe SerenCare');
        break;
      default:
        setSubject('');
        setMessage('');
    }
  };

  // Fetch scheduled emails
  const { data: scheduledEmails, isLoading: loadingScheduled } = useQuery({
    queryKey: ['scheduled-emails'],
    queryFn: async (): Promise<ScheduledEmail[]> => {
      const { data, error } = await supabase
        .from('scheduled_emails')
        .select('*')
        .order('scheduled_at', { ascending: true });
      if (error) throw error;
      return (data || []) as ScheduledEmail[];
    },
  });

  const cancelScheduledEmail = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_emails')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-emails'] });
      toast.success('Email programmé annulé');
    },
  });

  const scheduleEmail = async () => {
    if (selectedEmails.size === 0) {
      toast.error('Veuillez sélectionner au moins un destinataire');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error('Veuillez remplir le sujet et le message');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('Veuillez sélectionner une date et une heure');
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
    if (scheduledAt <= new Date()) {
      toast.error('La date doit être dans le futur');
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase
        .from('scheduled_emails')
        .insert({
          subject,
          message,
          recipient_emails: Array.from(selectedEmails),
          recipient_filter: { status: targetStatus },
          scheduled_at: scheduledAt.toISOString(),
        });

      if (error) throw error;

      toast.success('Email programmé avec succès');
      queryClient.invalidateQueries({ queryKey: ['scheduled-emails'] });
      
      // Reset form
      setSelectedEmails(new Set());
      setSelectAll(false);
      setSubject('');
      setMessage('');
      setSelectedTemplate('custom');
      setScheduleMode(false);
      setScheduledDate('');
      setScheduledTime('09:00');
    } catch (error) {
      console.error('Error scheduling email:', error);
      toast.error('Erreur lors de la programmation');
    } finally {
      setSending(false);
    }
  };

  const sendEmails = async () => {
    if (selectedEmails.size === 0) {
      toast.error('Veuillez sélectionner au moins un destinataire');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error('Veuillez remplir le sujet et le message');
      return;
    }

    setSending(true);

    try {
      const emailsToSend = Array.from(selectedEmails);
      let successCount = 0;
      let errorCount = 0;

      for (const email of emailsToSend) {
        const subscription = filteredSubscriptions.find(s => s.profile?.email === email);
        const firstName = subscription?.profile?.first_name || 'Client';
        
        // Replace placeholders
        const personalizedMessage = message
          .replace(/{prenom}/g, firstName)
          .replace(/{nom}/g, subscription?.profile?.last_name || '');

        const { error } = await supabase.functions.invoke('send-email', {
          body: {
            to: email,
            template: null,
            subject: subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); padding: 24px; text-align: center;">
                  <img src="https://obkfkygjisxvgrmclhnb.supabase.co/storage/v1/object/public/email-assets/serencare-logo-email.png" alt="SerenCare" style="height: 40px;" />
                </div>
                <div style="padding: 32px 24px; background: #ffffff;">
                  ${personalizedMessage.split('\n').map(p => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #333;">${p}</p>`).join('')}
                </div>
                <div style="background: #f8f9fa; padding: 24px; text-align: center; font-size: 12px; color: #666;">
                  <p>SerenCare - Votre partenaire bien-être</p>
                </div>
              </div>
            `,
            text: personalizedMessage,
          },
        });

        if (error) {
          console.error(`Error sending to ${email}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} email(s) envoyé(s) avec succès`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} email(s) en échec`);
      }

      // Reset form
      setSelectedEmails(new Set());
      setSelectAll(false);
      setSubject('');
      setMessage('');
      setSelectedTemplate('custom');
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Erreur lors de l\'envoi des emails');
    } finally {
      setSending(false);
    }
  };

  const pendingEmails = scheduledEmails?.filter(e => e.status === 'pending') || [];
  const sentEmails = scheduledEmails?.filter(e => e.status === 'sent') || [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recipients Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Destinataires
            </CardTitle>
            <CardDescription>Sélectionnez les abonnés à contacter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Filtrer par statut</Label>
              <Select value={targetStatus} onValueChange={setTargetStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les abonnés</SelectItem>
                  <SelectItem value="active">Actifs uniquement</SelectItem>
                  <SelectItem value="paused">En pause uniquement</SelectItem>
                  <SelectItem value="cancelled">Annulés uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <span className="font-medium">Tout sélectionner</span>
              </div>
              <Badge variant="secondary">{uniqueEmails.length} emails</Badge>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {uniqueEmails.map(email => {
                const sub = filteredSubscriptions.find(s => s.profile?.email === email);
                return (
                  <div key={email} className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg">
                    <Checkbox 
                      checked={selectedEmails.has(email)}
                      onCheckedChange={() => handleEmailToggle(email)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {sub?.profile?.first_name} {sub?.profile?.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{email}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedEmails.size > 0 && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{selectedEmails.size} destinataire(s) sélectionné(s)</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Composer l'email
            </CardTitle>
            <CardDescription>Rédigez votre message ou utilisez un modèle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Modèle</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Sujet de l'email..."
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Votre message..."
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Variables disponibles: {'{prenom}'}, {'{nom}'}
              </p>
            </div>

            {/* Schedule Toggle */}
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Checkbox 
                id="schedule-mode"
                checked={scheduleMode}
                onCheckedChange={(checked) => setScheduleMode(checked === true)}
              />
              <Label htmlFor="schedule-mode" className="flex items-center gap-2 cursor-pointer">
                <Clock className="h-4 w-4" />
                Programmer l'envoi
              </Label>
            </div>

            {scheduleMode && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="schedule-date">Date</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="schedule-time">Heure</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            {scheduleMode ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="w-full gap-2" 
                    disabled={selectedEmails.size === 0 || !subject || !message || !scheduledDate || sending}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Programmation...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4" />
                        Programmer pour {selectedEmails.size} destinataire(s)
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la programmation</AlertDialogTitle>
                    <AlertDialogDescription>
                      L'email sera envoyé à {selectedEmails.size} destinataire(s) le{' '}
                      {scheduledDate && format(new Date(`${scheduledDate}T${scheduledTime}`), "d MMMM yyyy 'à' HH:mm", { locale: fr })}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={scheduleEmail}>
                      Confirmer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="w-full gap-2" 
                    disabled={selectedEmails.size === 0 || !subject || !message || sending}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Envoyer à {selectedEmails.size} destinataire(s)
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer l'envoi</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vous êtes sur le point d'envoyer un email à {selectedEmails.size} destinataire(s).
                      Cette action ne peut pas être annulée.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={sendEmails}>
                      Confirmer l'envoi
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Emails Section */}
      {pendingEmails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Emails programmés ({pendingEmails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Destinataires</TableHead>
                  <TableHead>Date programmée</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingEmails.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell className="font-medium">{email.subject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{email.recipient_emails.length} destinataires</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(email.scheduled_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => cancelScheduledEmail.mutate(email.id)}
                        title="Annuler"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Sent Emails History */}
      {sentEmails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Emails envoyés récemment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Destinataires</TableHead>
                  <TableHead>Envoyé le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentEmails.slice(0, 5).map((email) => (
                  <TableRow key={email.id}>
                    <TableCell className="font-medium">{email.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{email.recipient_emails.length} destinataires</Badge>
                    </TableCell>
                    <TableCell>
                      {email.sent_at && format(new Date(email.sent_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionEmailing;
