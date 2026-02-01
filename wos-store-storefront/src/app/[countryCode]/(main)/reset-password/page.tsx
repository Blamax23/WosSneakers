import ResetPasswordForm from "../../../../modules/account/components/reset-password-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Réinitialisation du mot de passe",
  description: "Réinitialisez votre mot de passe",
}

export default function ResetPasswordPage() {
  return (
    <div className="flex justify-center py-12">
      <ResetPasswordForm />
    </div>
  )
}