export type EntryType = 'work_start' | 'work_end' | 'break_start' | 'break_end'

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

export type Settings = {
  id: string
  user_id: string
  hourly_rate: number
  created_at: string
  updated_at: string
}
