'use client'

import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { useState, useEffect } from 'react'
import type { HourlyRate } from '@/types/database'

/** 初期時給の適用開始日（記録開始以前を意味する） */
const INITIAL_EFFECTIVE_FROM = '2000-01-01'

export function useHourlyRates() {
  const { user } = useAuth()
  const supabase = createClient()
  const [rates, setRates] = useState<HourlyRate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRates = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('hourly_rates')
      .select('*')
      .eq('user_id', user.id)
      .order('effective_from', { ascending: false })

    if (error) {
      console.error('Error fetching hourly rates:', error)
      return
    }

    if (!data || data.length === 0) {
      const { data: newRate, error: insertError } = await supabase
        .from('hourly_rates')
        .insert({
          user_id: user.id,
          hourly_rate: 1500,
          effective_from: INITIAL_EFFECTIVE_FROM,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating hourly rate:', insertError)
        return
      }

      setRates([newRate])
    } else {
      setRates(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchRates()
  }, [user])

  /** 時給を追加する。同じ適用開始日が既にあれば上書きする */
  const saveRate = async (hourlyRate: number, effectiveFrom: string) => {
    if (!user) return

    const { error } = await supabase
      .from('hourly_rates')
      .upsert(
        {
          user_id: user.id,
          hourly_rate: hourlyRate,
          effective_from: effectiveFrom,
        },
        { onConflict: 'user_id,effective_from' }
      )

    if (error) {
      console.error('Error saving hourly rate:', error)
      throw error
    }

    await fetchRates()
  }

  const deleteRate = async (id: string) => {
    const { error } = await supabase.from('hourly_rates').delete().eq('id', id)

    if (error) {
      console.error('Error deleting hourly rate:', error)
      throw error
    }

    await fetchRates()
  }

  return {
    rates,
    loading,
    saveRate,
    deleteRate,
  }
}
