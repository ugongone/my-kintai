'use client'

import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { useState, useEffect } from 'react'
import type { TimeEntry, EntryType } from '@/types/database'

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

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        entry_type: entryType,
        entry_time: time.toISOString(),
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

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  }
}
