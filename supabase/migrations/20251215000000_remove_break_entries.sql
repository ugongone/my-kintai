-- 休憩概念を廃止し、複数セッション対応にする
-- break_start → work_end, break_end → work_start に変換

-- 1. break_startをwork_endに変換
UPDATE time_entries
SET entry_type = 'work_end'
WHERE entry_type = 'break_start';

-- 2. break_endをwork_startに変換
UPDATE time_entries
SET entry_type = 'work_start'
WHERE entry_type = 'break_end';

-- 3. CHECK制約を更新
ALTER TABLE time_entries
DROP CONSTRAINT IF EXISTS time_entries_entry_type_check;

ALTER TABLE time_entries
ADD CONSTRAINT time_entries_entry_type_check
CHECK (entry_type IN ('work_start', 'work_end'));
