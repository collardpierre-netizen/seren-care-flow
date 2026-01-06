import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const OrderConfirmed = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !orderId) {
        setError('Paramètres de commande manquants');
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId, orderId }
        });

        if (fnError) throw fnError;

        if (data.success) {
          setOrderNumber(data.orderNumber);
        } else {
          setError(data.message || 'Le paiement n\'a pas été complété');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Erreur lors de la vérification du paiement');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, orderId]);

  if (isVerifying) {
    return (
      <>
        <Helmet>
          <title>Vérification en cours... | SerenCare</title>
        </Helmet>
        <Layout>
          <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Vérification de votre paiement...</p>
          </div>
        </Layout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Erreur de paiement | SerenCare</title>
        </Helmet>
        <Layout>
          <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2 text-center">
              Une erreur est survenue
            </h1>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline">
                <Link to="/checkout">Réessayer</Link>
              </Button>
              <Button asChild>
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Commande confirmée | SerenCare</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-secondary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2 text-center">
            Merci pour votre commande !
          </h1>
          <p className="text-muted-foreground mb-2 text-center">
            Votre paiement a été confirmé
          </p>
          <p className="text-lg font-mono font-bold text-primary mb-6">{orderNumber}</p>
          <div className="bg-card border border-border rounded-xl p-6 max-w-md text-center mb-8">
            <p className="text-sm text-muted-foreground mb-4">
              Un email de confirmation vous a été envoyé avec les détails de votre commande.
            </p>
            <p className="text-sm text-muted-foreground">
              Vous serez notifié par email dès que votre commande sera expédiée.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline">
              <Link to="/boutique">Continuer mes achats</Link>
            </Button>
            <Button asChild>
              <Link to="/compte">Voir mes commandes</Link>
            </Button>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default OrderConfirmed;
