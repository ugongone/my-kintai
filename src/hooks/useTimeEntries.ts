'use client'

import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { useState, useEffect } from 'react'
import type { TimeEntry, EntryType } from '@/types/database'
import { calculateWorkDate } from '@/lib/utils/workDate'

export function useTimeEntries(year?: number, month?: number) {
  const { user } = useAuth()
  const supabase = createClient()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = async () => {
    if (!user) return

    const now = new Date()
    const targetYear = year ?? now.getFullYear()
    const targetMonth = month ?? now.getMonth()

    // work_dateでフィルタ（YYYY-MM-DD形式）
    const firstDayStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`
    const lastDay = new Date(targetYear, targetMonth + 1, 0)
    const lastDayStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('work_date', firstDayStr)
      .lte('work_date', lastDayStr)
      .order('entry_time', { ascending: false })

    if (error) {
      console.error('Error fetching entries:', error)
      return
    }

    setEntries(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchEntries()
  }, [user, year, month])

  const addEntry = async (entryType: EntryType, entryTime?: Date, note?: string) => {
    if (!user) return

    const time = entryTime || new Date()
    const workDate = calculateWorkDate(time)

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        entry_type: entryType,
        entry_time: time.toISOString(),
        work_date: workDate,
        note,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding entry:', error)
      throw error
    }

    await fetchEntries()
    return data
  }

  const updateEntry = async (id: string, updates: Partial<TimeEntry>) => {
    // entry_timeが更新される場合はwork_dateも再計算
    if (updates.entry_time) {
      const newTime = new Date(updates.entry_time)
      updates.work_date = calculateWorkDate(newTime)
    }

    const { error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating entry:', error)
      throw error
    }

    await fetchEntries()
  }

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting entry:', error)
      throw error
    }

    await fetchEntries()
  }

  const addSession = async (data: {
    date: string
    startTime: string
    endTime: string
    isEndTimeNextDay?: boolean
  }) => {
    if (!user) return

    const entriesToInsert: {
      user_id: string
      entry_type: EntryType
      entry_time: string
      work_date: string
    }[] = []

    const workStartTime = new Date(`${data.date}T${data.startTime}`)
    // 翌日フラグがある場合は終了日を+1日する
    let endDate = data.date
    if (data.isEndTimeNextDay) {
      const baseDate = new Date(`${data.date}T00:00:00`)
      baseDate.setDate(baseDate.getDate() + 1)
      endDate = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}-${String(baseDate.getDate()).padStart(2, '0')}`
    }
    const workEndTime = new Date(`${endDate}T${data.endTime}`)

    entriesToInsert.push({
      user_id: user.id,
      entry_type: 'work_start',
      entry_time: workStartTime.toISOString(),
      work_date: data.date,
    })

    entriesToInsert.push({
      user_id: user.id,
      entry_type: 'work_end',
      entry_time: workEndTime.toISOString(),
      work_date: data.date,
    })

    const { error } = await supabase
      .from('time_entries')
      .insert(entriesToInsert)

    if (error) {
      console.error('Error adding session:', error)
      throw error
    }

    await fetchEntries()
  }

  const replaceSession = async (data: {
    date: string
    startTime: string
    endTime: string
    isEndTimeNextDay?: boolean
    entryIds: string[]
  }) => {
    if (!user) return

    // 既存エントリを削除
    const { error: deleteError } = await supabase
      .from('time_entries')
      .delete()
      .eq('user_id', user.id)
      .in('id', data.entryIds)

    if (deleteError) {
      console.error('Error deleting existing entries:', deleteError)
      throw deleteError
    }

    // 新しいセッションを追加
    await addSession(data)
  }

  return {
    entries,
    loading,
    addEntry,
    addSession,
    updateEntry,
    deleteEntry,
    replaceSession,
    refetch: fetchEntries,
  }
}
