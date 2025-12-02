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

    const firstDay = new Date(targetYear, targetMonth, 1)
    const lastDay = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_time', firstDay.toISOString())
      .lte('entry_time', lastDay.toISOString())
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

  const addMultipleEntries = async (data: {
    date: string
    startTime: string
    endTime: string
    breakStartTime?: string
    breakEndTime?: string
  }) => {
    if (!user) return

    const entriesToInsert: {
      user_id: string
      entry_type: EntryType
      entry_time: string
      work_date: string
      note?: string
    }[] = []

    const workStartTime = new Date(`${data.date}T${data.startTime}`)
    const workEndTime = new Date(`${data.date}T${data.endTime}`)

    entriesToInsert.push({
      user_id: user.id,
      entry_type: 'work_start',
      entry_time: workStartTime.toISOString(),
      work_date: calculateWorkDate(workStartTime),
    })

    entriesToInsert.push({
      user_id: user.id,
      entry_type: 'work_end',
      entry_time: workEndTime.toISOString(),
      work_date: calculateWorkDate(workEndTime),
    })

    if (data.breakStartTime && data.breakEndTime) {
      const breakStartTime = new Date(`${data.date}T${data.breakStartTime}`)
      const breakEndTime = new Date(`${data.date}T${data.breakEndTime}`)

      entriesToInsert.push({
        user_id: user.id,
        entry_type: 'break_start',
        entry_time: breakStartTime.toISOString(),
        work_date: calculateWorkDate(breakStartTime),
      })

      entriesToInsert.push({
        user_id: user.id,
        entry_type: 'break_end',
        entry_time: breakEndTime.toISOString(),
        work_date: calculateWorkDate(breakEndTime),
      })
    }

    const { error } = await supabase
      .from('time_entries')
      .insert(entriesToInsert)

    if (error) {
      console.error('Error adding multiple entries:', error)
      throw error
    }

    await fetchEntries()
  }

  return {
    entries,
    loading,
    addEntry,
    addMultipleEntries,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  }
}
