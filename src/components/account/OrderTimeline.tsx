import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { statusConfig, OrderStatus, normalFlow, getStatusIndex, isExceptionStatus } from '@/lib/orderStatus';
import { CheckCircle2 } from 'lucide-react';

interface OrderEvent {
  id: string;
  status: string;
  message_public: string | null;
  created_at: string;
  is_visible_to_customer?: boolean;
}

interface OrderTimelineProps {
  events: OrderEvent[];
  currentStatus: OrderStatus;
  className?: string;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ events, currentStatus, className }) => {
  const currentIndex = getStatusIndex(currentStatus);
  const isException = isExceptionStatus(currentStatus);
  
  // Filtrer les événements visibles
  const visibleEvents = events.filter(e => e.is_visible_to_customer !== false);

  // Si exception, afficher la timeline d'événements
  if (isException) {
    return (
      <div className={cn("space-y-4", className)}>
        {visibleEvents.map((event, index) => {
          const config = statusConfig[event.status as OrderStatus] || statusConfig.order_received;
          const Icon = config.icon;
          const isLast = index === visibleEvents.length - 1;
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2",
                  isLast ? cn(config.bgColor, config.borderColor) : "bg-muted border-muted",
                  isLast && "ring-4 ring-primary/20"
                )}>
                  <Icon className={cn("h-5 w-5", isLast ? config.color : "text-muted-foreground")} />
                </div>
                {index < visibleEvents.length - 1 && (
                  <div className="w-0.5 flex-1 min-h-8 bg-muted" />
                )}
              </div>
              <div className={cn("pb-4 flex-1", isLast && "pb-0")}>
                <p className={cn("font-medium", isLast ? "text-foreground" : "text-muted-foreground")}>
                  {config.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                </p>
                {event.message_public && (
                  <p className="text-sm mt-1 text-muted-foreground">{event.message_public}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Timeline normale type Uber Eats
  return (
    <div className={cn("space-y-0", className)}>
      {normalFlow.slice(0, -1).map((status, index) => { // Exclure 'closed' pour l'affichage
        const config = statusConfig[status];
        const Icon = config.icon;
        const isCompleted = currentIndex > index;
        const isCurrent = currentIndex === index;
        const isPending = currentIndex < index;
        
        // Trouver l'événement correspondant
        const event = visibleEvents.find(e => e.status === status);
        
        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
            <div className="flex gap-4">
              {/* Icône et ligne */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted && "bg-primary border-primary",
                  isCurrent && cn(config.bgColor, config.borderColor, "ring-4 ring-primary/20"),
                  isPending && "bg-muted border-muted"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <Icon className={cn(
                      "h-5 w-5",
                      isCurrent ? config.color : "text-muted-foreground"
                    )} />
                  )}
                  {/* Pulse animation pour le statut actuel */}
                  {isCurrent && (
                    <motion.div
                      className={cn("absolute inset-0 rounded-full", config.bgColor)}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                {/* Ligne de connexion */}
                {index < normalFlow.length - 2 && (
                  <div className={cn(
                    "w-0.5 h-12 transition-all duration-300",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
              
              {/* Contenu */}
              <div className="pb-6 flex-1">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-medium transition-colors",
                    isCompleted && "text-foreground",
                    isCurrent && "text-foreground",
                    isPending && "text-muted-foreground"
                  )}>
                    {config.label}
                  </p>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      En cours
                    </span>
                  )}
                </div>
                {(isCompleted || isCurrent) && event && (
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.created_at), "d MMM 'à' HH:mm", { locale: fr })}
                  </p>
                )}
                {isCurrent && event?.message_public && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.message_public}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
