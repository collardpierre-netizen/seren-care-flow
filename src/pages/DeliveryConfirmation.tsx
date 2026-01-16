import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import {
  CheckCircle,
  AlertTriangle,
  Package,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Send,
  Phone,
  Mail,
  XCircle,
} from 'lucide-react';
import logo from '@/assets/logo.png';

const DeliveryConfirmation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'pending' | 'confirmed' | 'issue_reported' | 'error'>('loading');
  const [step, setStep] = useState<'choice' | 'issue_form' | 'success'>('choice');
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    // Check token status using edge function
    const checkToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('confirm-delivery', {
          body: { token, status: 'check' },
        });

        if (error || !data) {
          setStatus('error');
          return;
        }

        if (data.confirmation) {
          setOrderNumber(data.confirmation.orders?.order_number || '');
          const confStatus = data.confirmation.status;

          if (confStatus === 'confirmed') {
            setStatus('confirmed');
            setStep('success');
          } else if (confStatus === 'issue_reported') {
            setStatus('issue_reported');
            setStep('success');
          } else {
            setStatus('pending');
          }
        } else {
          setStatus('pending');
        }
      } catch {
        setStatus('error');
      }
    };

    checkToken();
  }, [token]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('confirm-delivery', {
        body: { token, status: 'confirmed' },
      });

      if (error) throw error;

      setStatus('confirmed');
      setStep('success');
      toast.success('Merci pour votre confirmation !');
    } catch (err) {
      toast.error('Erreur lors de la confirmation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportIssue = async () => {
    if (!issueType || !issueDescription) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('confirm-delivery', {
        body: {
          token,
          status: 'issue',
          issueType,
          issueDescription,
          customerEmail,
          customerPhone,
        },
      });

      if (error) throw error;

      setStatus('issue_reported');
      setStep('success');
      toast.success('Votre signalement a été enregistré');
    } catch (err) {
      toast.error('Erreur lors du signalement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <>
        <Helmet>
          <title>Lien invalide | SerenCare</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Lien invalide</CardTitle>
              <CardDescription>
                Ce lien de confirmation n'est pas valide ou a expiré.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Confirmation de livraison | SerenCare</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-8 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <img src={logo} alt="SerenCare" className="h-12 mx-auto" />
          </motion.div>

          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    {status === 'confirmed' ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-amber-600" />
                    )}
                  </div>
                  <CardTitle className="text-2xl">
                    {status === 'confirmed' ? 'Merci !' : 'Signalement enregistré'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {status === 'confirmed'
                      ? 'Votre livraison a été confirmée. Nous espérons que vous êtes satisfait de votre commande.'
                      : 'Notre équipe va traiter votre signalement et vous recontacter rapidement.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {orderNumber && (
                    <p className="text-sm text-muted-foreground">
                      Commande : <strong>{orderNumber}</strong>
                    </p>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = 'https://serencare.be'}
                    className="w-full"
                  >
                    Retourner sur SerenCare
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'choice' && status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Package className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Confirmation de livraison</CardTitle>
                  <CardDescription>
                    {orderNumber && <>Commande <strong>{orderNumber}</strong><br /></>}
                    Votre colis est-il arrivé en bon état ?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ThumbsUp className="h-5 w-5 mr-2" />
                        Tout est parfait !
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setStep('issue_form')}
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <ThumbsDown className="h-5 w-5 mr-2" />
                    Signaler un problème
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'issue_form' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Signaler un problème
                  </CardTitle>
                  <CardDescription>
                    Décrivez le problème rencontré, nous vous recontacterons rapidement.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>Type de problème *</Label>
                    <RadioGroup value={issueType} onValueChange={setIssueType}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="damaged" id="damaged" />
                        <Label htmlFor="damaged" className="cursor-pointer">Colis endommagé</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="missing" id="missing" />
                        <Label htmlFor="missing" className="cursor-pointer">Produit manquant</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="wrong" id="wrong" />
                        <Label htmlFor="wrong" className="cursor-pointer">Mauvais produit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer">Autre</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description du problème *</Label>
                    <Textarea
                      id="description"
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Décrivez le problème en détail..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email (optionnel)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Téléphone (optionnel)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+32 XXX XX XX XX"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep('choice')}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      onClick={handleReportIssue}
                      disabled={isSubmitting || !issueType || !issueDescription}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default DeliveryConfirmation;
