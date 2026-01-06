import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MediaUpload from '@/components/admin/MediaUpload';

interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category: string;
  read_time: string | null;
  is_published: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

const categories = [
  { value: 'general', label: 'Général' },
  { value: 'guide-pratique', label: 'Guide pratique' },
  { value: 'guide-taille', label: 'Guide taille' },
  { value: 'sante', label: 'Santé' },
  { value: 'bien-etre', label: 'Bien-être' },
];

const AdminGuides = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    image_url: '',
    category: 'general',
    read_time: '',
    is_published: false,
    seo_title: '',
    seo_description: '',
  });

  const { data: guides = [], isLoading } = useQuery({
    queryKey: ['admin-guides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Guide[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('guides').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guides'] });
      toast.success('Guide créé avec succès');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from('guides').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guides'] });
      toast.success('Guide mis à jour');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('guides').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guides'] });
      toast.success('Guide supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleOpenCreate = () => {
    setEditingGuide(null);
    setFormData({
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      image_url: '',
      category: 'general',
      read_time: '',
      is_published: false,
      seo_title: '',
      seo_description: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (guide: Guide) => {
    setEditingGuide(guide);
    setFormData({
      slug: guide.slug,
      title: guide.title,
      excerpt: guide.excerpt || '',
      content: guide.content || '',
      image_url: guide.image_url || '',
      category: guide.category,
      read_time: guide.read_time || '',
      is_published: guide.is_published || false,
      seo_title: guide.seo_title || '',
      seo_description: guide.seo_description || '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGuide(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuide) {
      updateMutation.mutate({ id: editingGuide.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (guide: Guide) => {
    if (confirm(`Supprimer le guide "${guide.title}" ?`)) {
      deleteMutation.mutate(guide.id);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      seo_title: prev.seo_title || title,
    }));
  };

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Guides & Articles</h1>
          <p className="text-muted-foreground">Gérez les articles de la rubrique Guides</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau guide
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="outline">{guides.length} guides</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : filteredGuides.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Aucun guide trouvé</p>
              <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
                Créer votre premier guide
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuides.map((guide) => (
                  <TableRow key={guide.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-1">{guide.title}</p>
                        <p className="text-xs text-muted-foreground">/guides/{guide.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categories.find(c => c.value === guide.category)?.label || guide.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={guide.is_published ? 'default' : 'secondary'}>
                        {guide.is_published ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(guide.updated_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/guides/${guide.slug}`, '_blank')}
                          title="Aperçu"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(guide)}
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(guide)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGuide ? 'Modifier le guide' : 'Nouveau guide'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Comment choisir le bon produit ?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="comment-choisir-le-bon-produit"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="read_time">Temps de lecture</Label>
                  <Input
                    id="read_time"
                    value={formData.read_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, read_time: e.target.value }))}
                    placeholder="5 min"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Extrait</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Résumé court affiché sur la page des guides..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu (HTML ou Markdown)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Le contenu complet de l'article..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <MediaUpload
                value={formData.image_url}
                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                bucket="guides"
                label="Image de couverture"
              />

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-4">SEO</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo_title">Titre SEO</Label>
                    <Input
                      id="seo_title"
                      value={formData.seo_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                      placeholder="Titre pour les moteurs de recherche"
                    />
                    <p className="text-xs text-muted-foreground">{formData.seo_title.length}/60 caractères</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo_description">Description SEO</Label>
                    <Textarea
                      id="seo_description"
                      value={formData.seo_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                      placeholder="Description pour les moteurs de recherche"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">{formData.seo_description.length}/160 caractères</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                />
                <Label htmlFor="is_published">Publier le guide</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingGuide ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGuides;