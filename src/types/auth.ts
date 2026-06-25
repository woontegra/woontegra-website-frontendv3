export type UserRole = 'admin' | 'superadmin' | 'user'

export type AuthUser = {
  id: string
  email: string
  role: UserRole
}

export type AdminLoginResponse = {
  success: true
  token: string
  refreshToken: string
  user: AuthUser
}
