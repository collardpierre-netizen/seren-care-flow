import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

const editableElsewhere = [
  { label: 'Produits, prix, tailles et photos', where: 'Administration › Produits' },
  { label: 'Catégories et sous-catégories', where: 'Administration › Catégories' },
  { label: 'Guides et articles', where: 'Administration › Guides' },
  { label: 'Visuels de la page d’accueil', where: 'Administration › Hero média' },
  { label: 'Seuil de livraison gratuite, frais, minimum de commande, abonnement', where: 'Administration › Paramètres' },
];

const notEditable = [
  'Textes de la page d’accueil (titres, bénéfices, sections « Comment ça marche », « Pourquoi SerenCare a été créé »)',
  'Textes des pages Boutique, Aide au choix, À propos, Contact, Prescripteurs, FAQ',
  'Pages légales : mentions légales, CGV, CGU, politique de confidentialité, cookies',
  'Menu de navigation, pied de page, coordonnées et numéro de téléphone',
  'Textes des e-mails envoyés aux clients',
];

const AdminPages: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Pages</h1>
        <p className="text-muted-foreground">Où modifier le contenu du site</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Cette rubrique n’est pas un éditeur de pages</AlertTitle>
        <AlertDescription>
          Les textes des pages du site ne sont pas modifiables ici. Cette page indique ce qui se
          modifie depuis l’administration et ce qui doit être demandé pour être changé.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Modifiable depuis l’administration</CardTitle>
          <CardDescription>Vos changements sont visibles sur le site après enregistrement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {editableElsewhere.map((item) => (
            <div key={item.label} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="text-sm">{item.label}</span>
              <Badge variant="secondary">{item.where}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Non modifiable depuis l’administration</CardTitle>
          <CardDescription>
            Ces textes sont intégrés au site. Demandez la modification souhaitée : elle sera appliquée puis publiée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            {notEditable.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPages;
