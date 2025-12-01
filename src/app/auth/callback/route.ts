import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  if (error) {
    console.error('OAuth Error:', error, error_description)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const response = NextResponse.redirect(`${origin}/`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Exchange Error:', exchangeError)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
    }

    return response
  }

  return NextResponse.redirect(`${origin}/`)
}
