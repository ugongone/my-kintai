export type EntryType = 'work_start' | 'work_end'

export type TimeEntry = {
  id: string
  user_id: string
  entry_type: EntryType
  entry_time: string
  work_date: string
  note?: string
  created_at: string
  updated_at: string
}

export type HourlyRate = {
  id: string
  user_id: string
  hourly_rate: number
  /** この時給の適用開始日 (YYYY-MM-DD) */
  effective_from: string
  created_at: string
  updated_at: string
}
