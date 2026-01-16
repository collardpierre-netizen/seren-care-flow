-- Table pour les badges des préparateurs
CREATE TABLE public.preparer_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'amber',
  criteria_type TEXT NOT NULL, -- 'orders_count', 'speed', 'success_rate', 'streak'
  criteria_value INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les badges gagnés par préparateur
CREATE TABLE public.preparer_earned_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  preparer_name TEXT NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.preparer_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(preparer_name, badge_id)
);

-- Table pour les statistiques quotidiennes des préparateurs
CREATE TABLE public.preparer_daily_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  preparer_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  orders_prepared INTEGER NOT NULL DEFAULT 0,
  avg_preparation_time_minutes INTEGER,
  success_rate DECIMAL(5,2),
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(preparer_name, date)
);

-- Insérer des badges par défaut
INSERT INTO public.preparer_badges (name, description, icon, color, criteria_type, criteria_value, points) VALUES
('Première commande', 'Préparer votre première commande', 'Award', 'amber', 'orders_count', 1, 10),
('Apprenti', '10 commandes préparées', 'Star', 'blue', 'orders_count', 10, 25),
('Confirmé', '50 commandes préparées', 'Trophy', 'purple', 'orders_count', 50, 50),
('Expert', '100 commandes préparées', 'Crown', 'amber', 'orders_count', 100, 100),
('Maître', '500 commandes préparées', 'Gem', 'rose', 'orders_count', 500, 250),
('Flash', 'Préparer une commande en moins de 5 minutes', 'Zap', 'yellow', 'speed', 5, 30),
('Éclair', 'Temps moyen de préparation < 10 min', 'Timer', 'orange', 'speed', 10, 50),
('Perfectionniste', '100% de réussite sur 10 commandes', 'CheckCircle', 'green', 'success_rate', 100, 75),
('Série de 5', '5 commandes consécutives sans problème', 'Flame', 'red', 'streak', 5, 40),
('Série de 10', '10 commandes consécutives sans problème', 'Rocket', 'indigo', 'streak', 10, 80);

-- RLS policies
ALTER TABLE public.preparer_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preparer_earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preparer_daily_stats ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour les badges
CREATE POLICY "Badges are viewable by everyone" 
ON public.preparer_badges FOR SELECT USING (true);

-- Lecture publique pour les badges gagnés
CREATE POLICY "Earned badges are viewable by everyone" 
ON public.preparer_earned_badges FOR SELECT USING (true);

-- Insert pour les badges gagnés (via service role)
CREATE POLICY "Service role can insert earned badges" 
ON public.preparer_earned_badges FOR INSERT WITH CHECK (true);

-- Lecture publique pour les stats
CREATE POLICY "Daily stats are viewable by everyone" 
ON public.preparer_daily_stats FOR SELECT USING (true);

-- Insert/Update pour les stats (via service role)
CREATE POLICY "Service role can manage daily stats" 
ON public.preparer_daily_stats FOR ALL USING (true);