import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Plus,
  Image,
  Video,
  Upload,
  Link,
  Loader2,
} from "lucide-react";
import {
  useAllHeroMedia,
  useUpdateHeroMedia,
  useDeleteHeroMedia,
  useCreateHeroMedia,
  useReorderHeroMedia,
  type HeroMedia,
} from "@/hooks/useHeroMedia";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminHeroMedia: React.FC = () => {
  const { data: mediaItems, isLoading } = useAllHeroMedia();
  const updateMedia = useUpdateHeroMedia();
  const deleteMedia = useDeleteHeroMedia();
  const createMedia = useCreateHeroMedia();
  const reorderMedia = useReorderHeroMedia();

  const [editingItem, setEditingItem] = useState<HeroMedia | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [newItem, setNewItem] = useState({
    type: "image" as "image" | "video",
    file_url: "",
    alt_text: "",
    display_duration: 6000,
    transition_effect: "fade" as "fade" | "zoom" | "slide",
    is_active: true,
  });

  const handleFileUpload = async (file: File, isEdit = false) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const isVideo = file.type.startsWith("video/");
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      
      if (isEdit && editingItem) {
        setEditingItem({
          ...editingItem,
          file_url: publicUrl,
          type: isVideo ? "video" : "image",
        });
      } else {
        setNewItem({
          ...newItem,
          file_url: publicUrl,
          type: isVideo ? "video" : "image",
        });
      }

      toast.success("Fichier uploadé avec succès");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Erreur lors de l'upload: " + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, isEdit);
    }
  };

  const handleMoveUp = (index: number) => {
    if (!mediaItems || index === 0) return;
    const newOrder = [...mediaItems];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];
    reorderMedia.mutate(
      newOrder.map((m) => m.id),
      {
        onSuccess: () => toast.success("Ordre modifié"),
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  const handleMoveDown = (index: number) => {
    if (!mediaItems || index === mediaItems.length - 1) return;
    const newOrder = [...mediaItems];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];
    reorderMedia.mutate(
      newOrder.map((m) => m.id),
      {
        onSuccess: () => toast.success("Ordre modifié"),
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  const handleUpdate = (id: string, updates: Partial<HeroMedia>) => {
    updateMedia.mutate(
      { id, updates },
      {
        onSuccess: () => {
          toast.success("Média mis à jour");
          setEditingItem(null);
        },
        onError: () => toast.error("Erreur lors de la mise à jour"),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce média ?")) return;
    deleteMedia.mutate(id, {
      onSuccess: () => toast.success("Média supprimé"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  const handleCreate = () => {
    const sortOrder = mediaItems ? mediaItems.length : 0;
    createMedia.mutate(
      { ...newItem, sort_order: sortOrder },
      {
        onSuccess: () => {
          toast.success("Média ajouté");
          setIsAddDialogOpen(false);
          setNewItem({
            type: "image",
            file_url: "",
            alt_text: "",
            display_duration: 6000,
            transition_effect: "fade",
            is_active: true,
          });
        },
        onError: () => toast.error("Erreur lors de l'ajout"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Médias Hero</h1>
          <p className="text-muted-foreground">
            Gérez les images et vidéos affichées sur la page d'accueil
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un média
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un média</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    URL
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Fichier (image ou vidéo)</Label>
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Upload en cours...</p>
                        </div>
                      ) : newItem.file_url ? (
                        <div className="space-y-2">
                          {newItem.type === "image" ? (
                            <img src={newItem.file_url} alt="" className="max-h-32 mx-auto rounded" />
                          ) : (
                            <video src={newItem.file_url} className="max-h-32 mx-auto rounded" muted />
                          )}
                          <p className="text-xs text-muted-foreground">Cliquez pour changer</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Cliquez pour sélectionner une image ou vidéo
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG, WEBP, MP4, MOV
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => onFileChange(e, false)}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="url" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newItem.type}
                      onValueChange={(v: "image" | "video") =>
                        setNewItem({ ...newItem, type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Vidéo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>URL du fichier</Label>
                    <Input
                      value={newItem.file_url}
                      onChange={(e) =>
                        setNewItem({ ...newItem, file_url: e.target.value })
                      }
                      placeholder="/hero-image.jpg ou URL complète"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label>Texte alternatif</Label>
                <Input
                  value={newItem.alt_text}
                  onChange={(e) =>
                    setNewItem({ ...newItem, alt_text: e.target.value })
                  }
                  placeholder="Description de l'image"
                />
              </div>
              {newItem.type === "image" && (
                <div className="space-y-2">
                  <Label>Durée d'affichage (ms)</Label>
                  <Input
                    type="number"
                    value={newItem.display_duration}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        display_duration: parseInt(e.target.value) || 6000,
                      })
                    }
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Effet de transition</Label>
                <Select
                  value={newItem.transition_effect}
                  onValueChange={(v: "fade" | "zoom" | "slide") =>
                    setNewItem({ ...newItem, transition_effect: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Fondu</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="slide">Glissement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleCreate} 
                className="w-full"
                disabled={!newItem.file_url || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Médias actuels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ordre</TableHead>
                <TableHead className="w-16">Type</TableHead>
                <TableHead>Aperçu</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Transition</TableHead>
                <TableHead>Actif</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mediaItems?.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === (mediaItems?.length || 0) - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.type === "video" ? (
                      <Video className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Image className="h-5 w-5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    {item.type === "image" ? (
                      <img
                        src={item.file_url}
                        alt={item.alt_text || ""}
                        className="w-20 h-12 object-cover rounded"
                      />
                    ) : (
                      <video
                        src={item.file_url}
                        className="w-20 h-12 object-cover rounded"
                        muted
                      />
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                    {item.file_url}
                  </TableCell>
                  <TableCell>
                    {item.type === "image"
                      ? `${(item.display_duration || 6000) / 1000}s`
                      : "Auto"}
                  </TableCell>
                  <TableCell className="capitalize">
                    {item.transition_effect === "fade"
                      ? "Fondu"
                      : item.transition_effect === "zoom"
                      ? "Zoom"
                      : "Glissement"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={(checked) =>
                        handleUpdate(item.id, { is_active: checked })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingItem(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Modifier le média</DialogTitle>
                          </DialogHeader>
                          {editingItem && (
                            <div className="space-y-4">
                              <Tabs defaultValue="upload" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="upload" className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Upload
                                  </TabsTrigger>
                                  <TabsTrigger value="url" className="flex items-center gap-2">
                                    <Link className="h-4 w-4" />
                                    URL
                                  </TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload" className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label>Fichier actuel</Label>
                                    <div 
                                      className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                      onClick={() => editFileInputRef.current?.click()}
                                    >
                                      {isUploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                          <p className="text-sm text-muted-foreground">Upload en cours...</p>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {editingItem.type === "image" ? (
                                            <img src={editingItem.file_url} alt="" className="max-h-24 mx-auto rounded" />
                                          ) : (
                                            <video src={editingItem.file_url} className="max-h-24 mx-auto rounded" muted />
                                          )}
                                          <p className="text-xs text-muted-foreground">Cliquez pour remplacer</p>
                                        </div>
                                      )}
                                    </div>
                                    <input
                                      ref={editFileInputRef}
                                      type="file"
                                      accept="image/*,video/*"
                                      className="hidden"
                                      onChange={(e) => onFileChange(e, true)}
                                    />
                                  </div>
                                </TabsContent>
                                <TabsContent value="url" className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label>URL du fichier</Label>
                                    <Input
                                      value={editingItem.file_url}
                                      onChange={(e) =>
                                        setEditingItem({
                                          ...editingItem,
                                          file_url: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </TabsContent>
                              </Tabs>

                              <div className="space-y-2">
                                <Label>Texte alternatif</Label>
                                <Input
                                  value={editingItem.alt_text || ""}
                                  onChange={(e) =>
                                    setEditingItem({
                                      ...editingItem,
                                      alt_text: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              {editingItem.type === "image" && (
                                <div className="space-y-2">
                                  <Label>Durée d'affichage (ms)</Label>
                                  <Input
                                    type="number"
                                    value={editingItem.display_duration || 6000}
                                    onChange={(e) =>
                                      setEditingItem({
                                        ...editingItem,
                                        display_duration:
                                          parseInt(e.target.value) || 6000,
                                      })
                                    }
                                  />
                                </div>
                              )}
                              <div className="space-y-2">
                                <Label>Effet de transition</Label>
                                <Select
                                  value={editingItem.transition_effect}
                                  onValueChange={(
                                    v: "fade" | "zoom" | "slide"
                                  ) =>
                                    setEditingItem({
                                      ...editingItem,
                                      transition_effect: v,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="fade">Fondu</SelectItem>
                                    <SelectItem value="zoom">Zoom</SelectItem>
                                    <SelectItem value="slide">
                                      Glissement
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                onClick={() =>
                                  handleUpdate(editingItem.id, {
                                    file_url: editingItem.file_url,
                                    alt_text: editingItem.alt_text,
                                    display_duration:
                                      editingItem.display_duration,
                                    transition_effect:
                                      editingItem.transition_effect,
                                    type: editingItem.type,
                                  })
                                }
                                className="w-full"
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Upload en cours...
                                  </>
                                ) : (
                                  "Sauvegarder"
                                )}
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHeroMedia;
