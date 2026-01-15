import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';

const UnsubscribeStockAlert: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [productName, setProductName] = useState('');

  useEffect(() => {
    const unsubscribe = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Lien invalide. Aucun token fourni.');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('unsubscribe-stock-alert', {
          body: { token }
        });

        if (error) throw error;

        if (data.success) {
          setStatus('success');
          setProductName(data.productName || '');
          setMessage('Vous ne recevrez plus de notification pour ce produit.');
        } else {
          throw new Error(data.error || 'Erreur inconnue');
        }
      } catch (error: any) {
        console.error('Unsubscribe error:', error);
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue lors de la désinscription.');
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                <h1 className="text-xl font-semibold mb-2">Désinscription en cours...</h1>
                <p className="text-muted-foreground">Veuillez patienter</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-xl font-semibold mb-2">Désinscription réussie</h1>
                {productName && (
                  <p className="text-muted-foreground mb-4">
                    Vous ne recevrez plus d'alertes pour <strong>{productName}</strong>.
                  </p>
                )}
                <p className="text-muted-foreground mb-6">{message}</p>
                <Link to="/boutique">
                  <Button>Retour à la boutique</Button>
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-xl font-semibold mb-2">Erreur</h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <Link to="/boutique">
                  <Button variant="outline">Retour à la boutique</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UnsubscribeStockAlert;
