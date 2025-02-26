// /media/konstantin/DATOS/VSCODE/chatree/app/src/middleware.ts
import { NextRequest } from 'next/server'
import { updateSession } from '@/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Next-Url')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: Object.fromEntries(response.headers)
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}