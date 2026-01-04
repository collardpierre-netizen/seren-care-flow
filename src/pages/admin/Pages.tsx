import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

const AdminPages: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Pages</h1>
          <p className="text-muted-foreground">Gérez le contenu de votre site</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle page
        </Button>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Le gestionnaire de pages est en cours de développement</p>
            <p className="text-sm text-muted-foreground">
              Vous pourrez bientôt créer et modifier les pages de votre site.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPages;
