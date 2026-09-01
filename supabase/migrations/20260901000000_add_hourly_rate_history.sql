-- 時給を適用開始日つきの履歴として持てるようにする
-- 過去の稼働分は当時の時給で計算されるようになる

-- ===============================================
-- hourly_rates テーブル
-- ===============================================
CREATE TABLE public.hourly_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hourly_rate INTEGER NOT NULL CHECK (hourly_rate >= 0),
  effective_from DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, effective_from)
);

CREATE INDEX idx_hourly_rates_user_effective
  ON public.hourly_rates(user_id, effective_from DESC);

-- ===============================================
-- Row Level Security (RLS) 設定
-- ===============================================
ALTER TABLE public.hourly_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hourly rates"
  ON public.hourly_rates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hourly rates"
  ON public.hourly_rates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hourly rates"
  ON public.hourly_rates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hourly rates"
  ON public.hourly_rates FOR DELETE
  USING (auth.uid() = user_id);

-- 更新日時の自動更新
CREATE TRIGGER update_hourly_rates_updated_at
  BEFORE UPDATE ON public.hourly_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- 既存の settings.hourly_rate を初期レートとして移行
-- 適用開始日は「記録開始以前」を意味する 2000-01-01 とする
-- ===============================================
INSERT INTO public.hourly_rates (user_id, hourly_rate, effective_from)
SELECT user_id, hourly_rate, DATE '2000-01-01'
FROM public.settings
ON CONFLICT (user_id, effective_from) DO NOTHING;

-- settings テーブルはアプリから参照されなくなる。
-- 移行結果を確認したうえで、必要なら別途 DROP TABLE public.settings; を実行する。
