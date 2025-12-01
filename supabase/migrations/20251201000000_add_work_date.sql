-- work_date カラムを追加
-- 勤務の論理的な開始日を記録するためのカラム
-- 0-4時台のエントリーは前日の勤務、5時以降は当日の勤務として扱う
ALTER TABLE public.time_entries
ADD COLUMN work_date DATE;

-- 既存データのwork_dateを計算して埋める
UPDATE public.time_entries
SET work_date = CASE
  WHEN EXTRACT(HOUR FROM entry_time) < 5
    THEN (entry_time - INTERVAL '1 day')::DATE
  ELSE entry_time::DATE
END;

-- NOT NULL制約を追加
ALTER TABLE public.time_entries
ALTER COLUMN work_date SET NOT NULL;

-- インデックス追加（パフォーマンス向上）
CREATE INDEX idx_time_entries_work_date
ON public.time_entries(work_date);
