import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Star, CheckCircle2, XCircle, Trash2, Loader2, Eye, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: string;
  product_id: string;
  author_name: string;
  author_email: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  approved_at: string | null;
  products?: { name: string; slug: string } | null;
}

const AdminReviews = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [viewingReview, setViewingReview] = useState<Review | null>(null);
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*, products(name, slug)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const approveReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('product_reviews')
        .update({ 
          is_approved: true, 
          approved_at: new Date().toISOString(),
          approved_by: user?.id 
        })
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Avis approuvé');
    },
    onError: () => {
      toast.error('Erreur lors de l\'approbation');
    },
  });

  const unapproveReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('product_reviews')
        .update({ 
          is_approved: false, 
          approved_at: null,
          approved_by: null 
        })
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Avis désapprouvé');
    },
    onError: () => {
      toast.error('Erreur lors de la désapprobation');
    },
  });

  const rejectReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Avis supprimé');
      setViewingReview(null);
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.author_name.toLowerCase().includes(search.toLowerCase()) ||
      review.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
      review.content?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'pending') return matchesSearch && !review.is_approved;
    if (filter === 'approved') return matchesSearch && review.is_approved;
    return matchesSearch;
  });

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Avis clients</h1>
          <p className="text-muted-foreground">
            Gérez et validez les avis produits
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingCount} en attente</Badge>
            )}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                En attente
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('approved')}
              >
                Approuvés
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tous
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun avis trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Avis</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {review.products?.name || 'Produit inconnu'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{review.author_name}</p>
                        {review.author_email && (
                          <p className="text-xs text-muted-foreground">{review.author_email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{review.rating}/5</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {review.title && <p className="font-medium truncate">{review.title}</p>}
                      {review.content && (
                        <p className="text-sm text-muted-foreground truncate">{review.content}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {review.is_approved ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Approuvé
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800">
                          En attente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingReview(review)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!review.is_approved ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => approveReview.mutate(review.id)}
                            disabled={approveReview.isPending}
                            className="text-green-600 hover:text-green-700"
                            title="Approuver"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => unapproveReview.mutate(review.id)}
                            disabled={unapproveReview.isPending}
                            className="text-amber-600 hover:text-amber-700"
                            title="Désapprouver"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => rejectReview.mutate(review.id)}
                          disabled={rejectReview.isPending}
                          className="text-destructive hover:text-destructive"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Review Dialog */}
      <Dialog open={!!viewingReview} onOpenChange={() => setViewingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détail de l'avis</DialogTitle>
          </DialogHeader>
          {viewingReview && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Produit</p>
                <p className="font-medium">{viewingReview.products?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Auteur</p>
                  <p className="font-medium">{viewingReview.author_name}</p>
                  {viewingReview.author_email && (
                    <p className="text-sm text-muted-foreground">{viewingReview.author_email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Note</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= viewingReview.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {viewingReview.title && (
                <div>
                  <p className="text-sm text-muted-foreground">Titre</p>
                  <p className="font-medium">{viewingReview.title}</p>
                </div>
              )}
              {viewingReview.content && (
                <div>
                  <p className="text-sm text-muted-foreground">Contenu</p>
                  <Textarea value={viewingReview.content} readOnly rows={4} />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                {!viewingReview.is_approved ? (
                  <Button
                    onClick={() => {
                      approveReview.mutate(viewingReview.id);
                      setViewingReview(null);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      unapproveReview.mutate(viewingReview.id);
                      setViewingReview(null);
                    }}
                    className="flex-1"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Désapprouver
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => rejectReview.mutate(viewingReview.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
