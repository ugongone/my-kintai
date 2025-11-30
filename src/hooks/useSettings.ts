'use client'

import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { useState, useEffect } from 'react'
import type { Settings } from '@/types/database'

export function useSettings() {
  const { user } = useAuth()
  const supabase = createClient()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error)
      return
    }

    if (!data) {
      const { data: newSettings, error: insertError } = await supabase
        .from('settings')
        .insert({
          user_id: user.id,
          hourly_rate: 1500,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating settings:', insertError)
        return
      }

      setSettings(newSettings)
    } else {
      setSettings(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchSettings()
  }, [user])

  const updateHourlyRate = async (hourlyRate: number) => {
    if (!user || !settings) return

    const { error } = await supabase
      .from('settings')
      .update({ hourly_rate: hourlyRate })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating hourly rate:', error)
      throw error
    }

    await fetchSettings()
  }

  return {
    settings,
    loading,
    updateHourlyRate,
  }
}
