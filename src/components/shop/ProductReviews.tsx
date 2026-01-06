import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquarePlus, Loader2, CheckCircle2, User } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

interface Review {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  created_at: string;
}

function StarRating({ rating, onRate, interactive = false }: { 
  rating: number; 
  onRate?: (rating: number) => void;
  interactive?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={cn(
            "transition-transform",
            interactive && "hover:scale-110 cursor-pointer"
          )}
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              (interactive ? (hovered || rating) : rating) >= star
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    content: "",
    author_name: "",
  });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('id, author_name, rating, title, content, is_verified_purchase, created_at')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Vous devez être connecté");

      const { error } = await supabase.from('product_reviews').insert({
        product_id: productId,
        user_id: user.id,
        author_name: formData.author_name || user.email?.split('@')[0] || 'Anonyme',
        author_email: user.email,
        rating: formData.rating,
        title: formData.title || null,
        content: formData.content || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Avis soumis ! Il sera publié après validation.");
      setIsDialogOpen(false);
      setFormData({ rating: 5, title: "", content: "", author_name: "" });
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi de l'avis");
    },
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating < 1) {
      toast.error("Veuillez donner une note");
      return;
    }
    submitReview.mutate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Avis clients</CardTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={Math.round(averageRating)} />
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} / 5 ({reviews.length} avis)
              </span>
            </div>
          )}
        </div>
        
        {user && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Donner mon avis
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Votre avis sur {productName}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Votre note</Label>
                  <StarRating 
                    rating={formData.rating} 
                    onRate={(r) => setFormData({ ...formData, rating: r })}
                    interactive
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author_name">Votre nom (affiché publiquement)</Label>
                  <Input
                    id="author_name"
                    placeholder="Jean D."
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'avis (optionnel)</Label>
                  <Input
                    id="title"
                    placeholder="Résumez votre expérience..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Votre avis</Label>
                  <Textarea
                    id="content"
                    placeholder="Décrivez votre expérience avec ce produit..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitReview.isPending}>
                  {submitReview.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Soumettre mon avis
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Votre avis sera publié après validation par notre équipe.
                </p>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquarePlus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucun avis pour le moment</p>
            {user && (
              <p className="text-sm text-muted-foreground mt-1">
                Soyez le premier à donner votre avis !
              </p>
            )}
            {!user && (
              <p className="text-sm text-muted-foreground mt-1">
                Connectez-vous pour donner votre avis.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{review.author_name}</span>
                          {review.is_verified_purchase && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Achat vérifié
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.created_at), "d MMMM yyyy", { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  
                  {review.title && (
                    <h4 className="font-medium mb-1">{review.title}</h4>
                  )}
                  {review.content && (
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
