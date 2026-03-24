import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, Search, FolderOpen, Package, Download, FileUp, FileSpreadsheet, ChevronRight } from "lucide-react";
import MediaUpload from "@/components/admin/MediaUpload";
import * as XLSX from "xlsx";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  parent_id: string | null;
}

const initialFormData: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  sort_order: 0,
  is_active: true,
  parent_id: null,
};

const AdminCategories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const importInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data: cats, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;

      const { data: products } = await supabase
        .from("products")
        .select("category_id")
        .eq("is_active", true);

      const counts: Record<string, number> = {};
      products?.forEach((p) => {
        if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      });

      return cats?.map((cat) => ({
        ...cat,
        product_count: counts[cat.id] || 0,
      }));
    },
  });

  // Build hierarchical list: parents first, then children indented
  const getHierarchicalCategories = () => {
    if (!categories) return [];
    const parents = categories.filter((c) => !c.parent_id);
    const children = categories.filter((c) => c.parent_id);
    const result: (typeof categories[0] & { depth: number })[] = [];
    for (const parent of parents) {
      result.push({ ...parent, depth: 0 });
      for (const child of children.filter((c) => c.parent_id === parent.id)) {
        result.push({ ...child, depth: 1 });
      }
    }
    // Orphans (parent_id set but parent not found)
    const usedIds = new Set(result.map((r) => r.id));
    for (const c of categories) {
      if (!usedIds.has(c.id)) result.push({ ...c, depth: 1 });
    }
    return result;
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId || !categories) return null;
    return categories.find((c) => c.id === parentId)?.name || null;
  };

  const createCategory = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const { error } = await supabase.from("categories").insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image_url: data.image_url || null,
        sort_order: data.sort_order,
        is_active: data.is_active,
        parent_id: data.parent_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Catégorie créée");
      setIsDialogOpen(false);
      setFormData(initialFormData);
    },
    onError: (err: any) => toast.error(err.message || "Erreur lors de la création"),
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const { error } = await supabase
        .from("categories")
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          image_url: data.image_url || null,
          sort_order: data.sort_order,
          is_active: data.is_active,
          parent_id: data.parent_id,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Catégorie mise à jour");
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData(initialFormData);
    },
    onError: (err: any) => toast.error(err.message || "Erreur lors de la mise à jour"),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Catégorie supprimée");
    },
    onError: (err: any) => toast.error(err.message || "Erreur lors de la suppression"),
  });

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
      sort_order: category.sort_order || 0,
      is_active: category.is_active ?? true,
      parent_id: category.parent_id || null,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCategory.mutate({ id: editingId, data: formData });
    } else {
      createCategory.mutate(formData);
    }
  };

  // ── Export ──
  const handleExport = () => {
    if (!categories || categories.length === 0) {
      toast.error("Aucune catégorie à exporter");
      return;
    }
    const wb = XLSX.utils.book_new();
    const headers = ["Nom", "Slug", "Description", "Image URL", "Ordre", "Active", "Catégorie parente (slug)"];
    const rows = categories.map((c) => [
      c.name,
      c.slug,
      c.description || "",
      c.image_url || "",
      c.sort_order ?? 0,
      c.is_active ? "oui" : "non",
      categories.find((p) => p.id === c.parent_id)?.slug || "",
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 16) }));
    XLSX.utils.book_append_sheet(wb, ws, "Catégories");

    // Instructions sheet
    const instructions = [
      ["Champ", "Description"],
      ["Nom", "Nom de la catégorie (obligatoire)"],
      ["Slug", "Identifiant URL unique (obligatoire, auto-généré si vide)"],
      ["Description", "Description optionnelle"],
      ["Image URL", "URL de l'image (optionnel)"],
      ["Ordre", "Ordre d'affichage (nombre, défaut 0)"],
      ["Active", "'oui' ou 'non' (défaut oui)"],
      ["Catégorie parente (slug)", "Slug de la catégorie parente pour créer une sous-catégorie"],
      ["", ""],
      ["HIÉRARCHIE", "Pour créer une sous-catégorie, renseignez le slug de la catégorie parente."],
      ["", "Les catégories parentes doivent exister avant d'importer les enfants."],
      ["", "Un import crée d'abord les catégories sans parent, puis les sous-catégories."],
    ];
    const wsInst = XLSX.utils.aoa_to_sheet(instructions);
    wsInst["!cols"] = [{ wch: 30 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInst, "Instructions");

    XLSX.writeFile(wb, `categories-serencare-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success(`${categories.length} catégories exportées`);
  };

  // ── Template ──
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const headers = ["Nom", "Slug", "Description", "Image URL", "Ordre", "Active", "Catégorie parente (slug)"];
    const example1 = ["Protections anatomiques", "protections-anatomiques", "Protections pour incontinence légère", "", "1", "oui", ""];
    const example2 = ["Jour", "jour", "Protections de jour", "", "1", "oui", "protections-anatomiques"];
    const ws = XLSX.utils.aoa_to_sheet([headers, example1, example2]);
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 16) }));
    XLSX.utils.book_append_sheet(wb, ws, "Catégories");

    const instructions = [
      ["Champ", "Description"],
      ["Nom", "Nom de la catégorie (obligatoire)"],
      ["Slug", "Identifiant URL unique (auto-généré à partir du nom si vide)"],
      ["Description", "Description optionnelle"],
      ["Image URL", "URL de l'image (optionnel)"],
      ["Ordre", "Ordre d'affichage (nombre, défaut 0)"],
      ["Active", "'oui' ou 'non' (défaut oui)"],
      ["Catégorie parente (slug)", "Slug de la catégorie parente pour créer une sous-catégorie"],
      ["", ""],
      ["HIÉRARCHIE", "Pour créer une sous-catégorie, renseignez le slug de la catégorie parente."],
      ["", "Les catégories parentes sont importées en premier automatiquement."],
    ];
    const wsInst = XLSX.utils.aoa_to_sheet(instructions);
    wsInst["!cols"] = [{ wch: 30 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInst, "Instructions");

    XLSX.writeFile(wb, "template-import-categories-serencare.xlsx");
    toast.success("Template Excel téléchargé");
  };

  // ── Import ──
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames.includes("Catégories") ? "Catégories" : workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsed: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const rows = parsed.filter((r) => r.some((c) => c != null && String(c).trim() !== ""));

      if (rows.length < 2) {
        toast.error("Fichier vide ou sans données");
        return;
      }

      const headers = rows[0].map((h) => String(h).trim().toLowerCase());
      const idx = (col: string) => headers.findIndex((h) => h.includes(col));
      const iName = idx("nom");
      const iSlug = idx("slug");
      const iDesc = idx("description");
      const iImage = idx("image");
      const iOrder = idx("ordre");
      const iActive = idx("active");
      const iParent = idx("parent");

      if (iName === -1) {
        toast.error("Colonne 'Nom' introuvable");
        return;
      }

      // Fetch existing categories for parent resolution
      const { data: existingCats } = await supabase.from("categories").select("id, slug");
      const slugToId: Record<string, string> = {};
      existingCats?.forEach((c) => { slugToId[c.slug] = c.id; });

      // Split rows: parents first (no parent slug), then children
      const dataRows = rows.slice(1);
      const parentRows = dataRows.filter((r) => !r[iParent] || String(r[iParent]).trim() === "");
      const childRows = dataRows.filter((r) => r[iParent] && String(r[iParent]).trim() !== "");

      let imported = 0;

      // Import parents
      for (const row of parentRows) {
        const name = String(row[iName] || "").trim();
        if (!name) continue;
        const slug = iSlug !== -1 && row[iSlug] ? String(row[iSlug]).trim() : generateSlug(name);
        const activeVal = iActive !== -1 ? String(row[iActive] || "").trim().toLowerCase() : "oui";

        const { data: inserted, error } = await supabase.from("categories").upsert({
          name,
          slug,
          description: iDesc !== -1 ? String(row[iDesc] || "").trim() || null : null,
          image_url: iImage !== -1 ? String(row[iImage] || "").trim() || null : null,
          sort_order: iOrder !== -1 ? parseInt(String(row[iOrder])) || 0 : 0,
          is_active: activeVal !== "non" && activeVal !== "false" && activeVal !== "0",
          parent_id: null,
        }, { onConflict: "slug" }).select("id, slug").single();

        if (!error && inserted) {
          slugToId[inserted.slug] = inserted.id;
          imported++;
        }
      }

      // Import children
      for (const row of childRows) {
        const name = String(row[iName] || "").trim();
        if (!name) continue;
        const slug = iSlug !== -1 && row[iSlug] ? String(row[iSlug]).trim() : generateSlug(name);
        const parentSlug = String(row[iParent]).trim();
        const parentId = slugToId[parentSlug] || null;
        const activeVal = iActive !== -1 ? String(row[iActive] || "").trim().toLowerCase() : "oui";

        if (!parentId) {
          toast.error(`Parent "${parentSlug}" introuvable pour "${name}"`);
          continue;
        }

        const { error } = await supabase.from("categories").upsert({
          name,
          slug,
          description: iDesc !== -1 ? String(row[iDesc] || "").trim() || null : null,
          image_url: iImage !== -1 ? String(row[iImage] || "").trim() || null : null,
          sort_order: iOrder !== -1 ? parseInt(String(row[iOrder])) || 0 : 0,
          is_active: activeVal !== "non" && activeVal !== "false" && activeVal !== "0",
          parent_id: parentId,
        }, { onConflict: "slug" });

        if (!error) imported++;
      }

      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(`${imported} catégorie(s) importée(s)`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'import");
    }
    e.target.value = "";
  };

  const hierarchical = getHierarchicalCategories();
  const filtered = hierarchical.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const parentCategories = categories?.filter((c) => !c.parent_id && c.id !== editingId) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Catégories</h1>
          <p className="text-muted-foreground">Gérez les catégories et sous-catégories de produits</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Template
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={() => importInputRef.current?.click()} className="gap-2">
            <FileUp className="h-4 w-4" />
            Importer
          </Button>
          <input ref={importInputRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) { setEditingId(null); setFormData(initialFormData); }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle catégorie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Catégorie parente</Label>
                  <Select
                    value={formData.parent_id || "none"}
                    onValueChange={(v) => setFormData((p) => ({ ...p, parent_id: v === "none" ? null : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune (catégorie racine)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune (catégorie racine)</SelectItem>
                      {parentCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((p) => ({ ...p, name, slug: editingId ? p.slug : generateSlug(name) }));
                    }}
                    placeholder="Protections anatomiques"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="protections-anatomiques"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Description de la catégorie..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image</Label>
                  <MediaUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData((p) => ({ ...p, image_url: url }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ordre d'affichage</Label>
                    <Input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-end gap-3 pb-1">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_active: checked }))}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending} className="flex-1">
                    {(createCategory.isPending || updateCategory.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingId ? "Mettre à jour" : "Créer"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Annuler</Button>
                  </DialogClose>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune catégorie trouvée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Produits</TableHead>
                  <TableHead className="text-center">Ordre</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3" style={{ paddingLeft: category.depth * 24 }}>
                        {category.depth > 0 && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name} className="h-10 w-10 rounded object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                            <FolderOpen className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{category.product_count}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{category.sort_order}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const hasChildren = categories?.some((c) => c.parent_id === category.id);
                            if (hasChildren) {
                              toast.error("Impossible de supprimer : cette catégorie a des sous-catégories");
                              return;
                            }
                            if (category.product_count > 0) {
                              toast.error(`Impossible de supprimer : ${category.product_count} produit(s) associé(s)`);
                              return;
                            }
                            if (confirm("Supprimer cette catégorie ?")) deleteCategory.mutate(category.id);
                          }}
                          disabled={deleteCategory.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
    </div>
  );
};

export default AdminCategories;
