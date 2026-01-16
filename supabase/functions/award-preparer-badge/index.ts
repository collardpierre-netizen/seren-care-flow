import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { preparerName, orderId, action } = await req.json();

    if (!preparerName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nom du préparateur requis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Checking badges for preparer:', preparerName);

    // Fetch all badges
    const { data: allBadges } = await supabase
      .from('preparer_badges')
      .select('*');

    // Fetch already earned badges
    const { data: earnedBadges } = await supabase
      .from('preparer_earned_badges')
      .select('badge_id')
      .eq('preparer_name', preparerName);

    const earnedBadgeIds = new Set(earnedBadges?.map(eb => eb.badge_id) || []);

    // Get preparer stats
    const { data: logs } = await supabase
      .from('order_preparer_logs')
      .select('order_id, created_at, action')
      .eq('preparer_name', preparerName);

    const uniqueOrders = new Set(logs?.map(l => l.order_id) || []);
    const totalOrders = uniqueOrders.size;

    // Calculate average prep time
    const { data: completedOrders } = await supabase
      .from('orders')
      .select('id, created_at, updated_at')
      .in('id', Array.from(uniqueOrders))
      .in('status', ['shipped', 'delivered', 'closed', 'packed']);

    let avgPrepTimeMinutes = 0;
    if (completedOrders && completedOrders.length > 0) {
      const prepTimes = completedOrders.map(o => {
        const created = new Date(o.created_at);
        const updated = new Date(o.updated_at);
        return (updated.getTime() - created.getTime()) / 60000;
      }).filter(t => t > 0 && t < 1440);

      if (prepTimes.length > 0) {
        avgPrepTimeMinutes = prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length;
      }
    }

    // Check for issues
    const issueActions = logs?.filter(l => l.action === 'delivery_issue_reported') || [];
    const successRate = totalOrders > 0 
      ? ((totalOrders - issueActions.length) / totalOrders) * 100 
      : 100;

    // Calculate streak (consecutive orders without issues)
    const orderLogs = logs?.filter(l => l.action === 'preparation_completed' || l.action === 'delivery_confirmed') || [];
    let currentStreak = 0;
    const sortedOrders = [...orderLogs].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    for (const log of sortedOrders) {
      const hasIssue = issueActions.some(i => i.order_id === log.order_id);
      if (hasIssue) break;
      currentStreak++;
    }

    console.log('Stats:', { totalOrders, avgPrepTimeMinutes, successRate, currentStreak });

    // Check which badges should be awarded
    const newBadges: any[] = [];

    for (const badge of allBadges || []) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let shouldAward = false;

      switch (badge.criteria_type) {
        case 'orders_count':
          shouldAward = totalOrders >= badge.criteria_value;
          break;
        case 'speed':
          shouldAward = avgPrepTimeMinutes > 0 && avgPrepTimeMinutes <= badge.criteria_value;
          break;
        case 'success_rate':
          shouldAward = successRate >= badge.criteria_value && totalOrders >= 10;
          break;
        case 'streak':
          shouldAward = currentStreak >= badge.criteria_value;
          break;
      }

      if (shouldAward) {
        const { error: insertError } = await supabase
          .from('preparer_earned_badges')
          .insert({
            preparer_name: preparerName,
            badge_id: badge.id,
          });

        if (!insertError) {
          newBadges.push(badge);
          console.log('Awarded badge:', badge.name);
        }
      }
    }

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs?.filter(l => 
      l.created_at.startsWith(today)
    ) || [];
    const todayOrders = new Set(todayLogs.map(l => l.order_id)).size;

    await supabase
      .from('preparer_daily_stats')
      .upsert({
        preparer_name: preparerName,
        date: today,
        orders_prepared: todayOrders,
        avg_preparation_time_minutes: Math.round(avgPrepTimeMinutes),
        success_rate: successRate,
        points_earned: newBadges.reduce((sum, b) => sum + b.points, 0),
      }, {
        onConflict: 'preparer_name,date',
      });

    return new Response(
      JSON.stringify({
        success: true,
        newBadges: newBadges.map(b => ({ name: b.name, points: b.points })),
        stats: { totalOrders, avgPrepTimeMinutes, successRate, currentStreak }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
