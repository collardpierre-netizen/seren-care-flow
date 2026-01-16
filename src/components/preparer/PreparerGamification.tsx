import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Award, 
  Star, 
  Trophy, 
  Crown, 
  Gem,
  Zap,
  Timer,
  CheckCircle,
  Flame,
  Rocket,
  Lock,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PreparerGamificationProps {
  preparerName: string;
}

interface BadgeType {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  criteria_type: string;
  criteria_value: number;
  points: number;
  created_at: string;
}

interface EarnedBadge {
  id: string;
  preparer_name: string;
  badge_id: string;
  earned_at: string;
  preparer_badges?: BadgeType;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Star,
  Trophy,
  Crown,
  Gem,
  Zap,
  Timer,
  CheckCircle,
  Flame,
  Rocket,
};

const colorMap: Record<string, string> = {
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
};

export const PreparerGamification: React.FC<PreparerGamificationProps> = ({ preparerName }) => {
  // Fetch all badges
  const { data: allBadges = [], isLoading: loadingBadges } = useQuery({
    queryKey: ['preparer-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preparer_badges')
        .select('*')
        .order('criteria_value', { ascending: true });
      if (error) throw error;
      return data as BadgeType[];
    },
  });

  // Fetch earned badges for this preparer
  const { data: earnedBadges = [], isLoading: loadingEarned } = useQuery({
    queryKey: ['preparer-earned-badges', preparerName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preparer_earned_badges')
        .select('*, preparer_badges(*)')
        .eq('preparer_name', preparerName);
      if (error) throw error;
      return data as EarnedBadge[];
    },
    enabled: !!preparerName,
  });

  // Fetch preparer stats for progress
  const { data: preparerStats } = useQuery({
    queryKey: ['preparer-progress-stats', preparerName],
    queryFn: async () => {
      const { data: logs } = await supabase
        .from('order_preparer_logs')
        .select('order_id')
        .eq('preparer_name', preparerName);
      
      const uniqueOrders = new Set(logs?.map(l => l.order_id) || []).size;
      
      return { totalOrders: uniqueOrders };
    },
    enabled: !!preparerName,
  });

  // Fetch leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['preparer-leaderboard'],
    queryFn: async () => {
      const { data } = await supabase
        .from('preparer_daily_stats')
        .select('preparer_name, points_earned')
        .order('points_earned', { ascending: false });
      
      // Aggregate points by preparer
      const pointsMap = new Map<string, number>();
      data?.forEach(stat => {
        const current = pointsMap.get(stat.preparer_name) || 0;
        pointsMap.set(stat.preparer_name, current + stat.points_earned);
      });
      
      // Also count earned badges for points
      const { data: badgePoints } = await supabase
        .from('preparer_earned_badges')
        .select('preparer_name, preparer_badges(points)');
      
      badgePoints?.forEach(bp => {
        const current = pointsMap.get(bp.preparer_name) || 0;
        const points = (bp.preparer_badges as any)?.points || 0;
        pointsMap.set(bp.preparer_name, current + points);
      });
      
      return Array.from(pointsMap.entries())
        .map(([name, points]) => ({ preparer_name: name, total_points: points }))
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 10);
    },
  });

  const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badge_id));
  const totalPoints = earnedBadges.reduce((sum, eb) => {
    const badge = eb.preparer_badges;
    return sum + (badge?.points || 0);
  }, 0);

  // Find next badge to unlock (orders_count type)
  const nextOrderBadge = allBadges
    .filter(b => b.criteria_type === 'orders_count' && !earnedBadgeIds.has(b.id))
    .sort((a, b) => a.criteria_value - b.criteria_value)[0];

  const progressToNext = nextOrderBadge && preparerStats
    ? Math.min((preparerStats.totalOrders / nextOrderBadge.criteria_value) * 100, 100)
    : 0;

  if (loadingBadges || loadingEarned) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 bg-slate-700" />
        <Skeleton className="h-48 bg-slate-700" />
      </div>
    );
  }

  const currentRank = leaderboard.findIndex(l => l.preparer_name === preparerName) + 1;

  return (
    <div className="space-y-6">
      {/* Points & Rank Summary */}
      <Card className="bg-gradient-to-br from-amber-900/30 via-amber-800/20 to-slate-800 border-amber-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Points</p>
                <p className="text-3xl font-bold text-white">{totalPoints}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Classement</p>
              <p className="text-3xl font-bold text-amber-400">
                {currentRank > 0 ? `#${currentRank}` : '-'}
              </p>
            </div>
          </div>

          {/* Progress to next badge */}
          {nextOrderBadge && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Prochain badge: {nextOrderBadge.name}</span>
                <span className="text-slate-300">
                  {preparerStats?.totalOrders || 0}/{nextOrderBadge.criteria_value}
                </span>
              </div>
              <Progress value={progressToNext} className="h-2 bg-slate-700" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earned Badges */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Badges obtenus ({earnedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnedBadges.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Préparez des commandes pour gagner des badges !
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {earnedBadges.map(eb => {
                const badge = eb.preparer_badges;
                if (!badge) return null;
                const IconComponent = iconMap[badge.icon] || Award;
                return (
                  <div
                    key={eb.id}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-lg border",
                      colorMap[badge.color] || colorMap.amber
                    )}
                  >
                    <IconComponent className="h-10 w-10 mb-2" />
                    <p className="font-medium text-center text-sm">{badge.name}</p>
                    <p className="text-xs opacity-70 mt-1">+{badge.points} pts</p>
                    <p className="text-xs opacity-50 mt-1">
                      {format(new Date(eb.earned_at), 'd MMM', { locale: fr })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Badges (Locked/Unlocked) */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-slate-400" />
            Tous les badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {allBadges.map(badge => {
              const isEarned = earnedBadgeIds.has(badge.id);
              const IconComponent = iconMap[badge.icon] || Award;
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg border transition-all",
                    isEarned
                      ? colorMap[badge.color] || colorMap.amber
                      : "bg-slate-900/50 border-slate-700 opacity-50"
                  )}
                >
                  {isEarned ? (
                    <IconComponent className="h-8 w-8 mb-2" />
                  ) : (
                    <Lock className="h-8 w-8 mb-2 text-slate-600" />
                  )}
                  <p className={cn(
                    "font-medium text-center text-xs",
                    !isEarned && "text-slate-500"
                  )}>
                    {badge.name}
                  </p>
                  <p className="text-xs opacity-50 text-center mt-1">
                    {badge.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Classement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.preparer_name}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  entry.preparer_name === preparerName
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-slate-900/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    index === 0 ? "bg-amber-500 text-white" :
                    index === 1 ? "bg-slate-400 text-white" :
                    index === 2 ? "bg-amber-700 text-white" :
                    "bg-slate-700 text-slate-300"
                  )}>
                    {index + 1}
                  </span>
                  <span className={cn(
                    "font-medium",
                    entry.preparer_name === preparerName ? "text-primary" : "text-white"
                  )}>
                    {entry.preparer_name}
                  </span>
                </div>
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  {entry.total_points} pts
                </Badge>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-slate-400 text-center py-4">
                Aucun classement disponible
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
