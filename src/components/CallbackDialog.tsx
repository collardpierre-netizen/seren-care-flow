import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import CallbackFormCompact from "./CallbackFormCompact";

interface CallbackDialogProps {
  trigger?: React.ReactNode;
}

export function CallbackDialog({ trigger }: CallbackDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="gap-2">
            <Phone className="w-4 h-4" />
            Demander un rappel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Être rappelé(e) par un conseiller
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <p className="text-muted-foreground text-sm mb-4">
            Laissez-nous vos coordonnées, un expert vous rappellera dans les 2 heures.
          </p>
          <CallbackFormCompact />
        </div>
      </DialogContent>
    </Dialog>
  );
}
