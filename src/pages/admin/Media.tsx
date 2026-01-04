import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Upload } from 'lucide-react';

const AdminMedia: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Médias</h1>
          <p className="text-muted-foreground">Gérez vos images et fichiers</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Téléverser
        </Button>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">La bibliothèque de médias est en cours de développement</p>
            <p className="text-sm text-muted-foreground">
              Vous pourrez bientôt téléverser et gérer vos images.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMedia;
