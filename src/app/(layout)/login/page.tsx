import { LoginForm } from '@src/shared/components/login-form'
import { PublicRoute } from '@src/shared/components/route-guard'

export default function LoginPage() {
  return (
    <PublicRoute>
      <LoginForm />
    </PublicRoute>
  )
}
