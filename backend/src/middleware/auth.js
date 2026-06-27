import { createUserSupabaseClient } from '../config/supabase.js'

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    return res.status(401).json({ success: false, message: 'Please sign in to access inventory records.' })
  }

  const supabase = createUserSupabaseClient(token)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    return res.status(401).json({
      success: false,
      message: 'Your session expired. Please sign out and sign in again.',
      detail: error?.message,
    })
  }

  req.supabase = supabase
  req.user = data.user
  next()
}
