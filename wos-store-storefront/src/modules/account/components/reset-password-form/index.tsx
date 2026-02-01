"use client"

import { useState, useActionState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import ErrorMessage from "@modules/checkout/components/error-message"
import { resetPassword } from "@lib/data/customer"

type ResetPasswordState = {
  success?: boolean
  error?: string
}

export type { ResetPasswordState }

const ResetPasswordForm = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [success, setSuccess] = useState(false)

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [state, formAction] = useActionState<ResetPasswordState>(
    resetPassword,
    {}
  )


  useEffect(() => {
    if (state.success) {
        setSuccess(true)
    }
  }, [state])

  if (!token || !email) {
    return (
      <div className="max-w-sm w-full flex flex-col items-center">
        <h1 className="text-large-semi uppercase mb-6">Lien invalide</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <button
          onClick={() => router.push("/account")}
          className="underline text-ui-fg-base"
        >
          Retour à la connexion
        </button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-sm w-full flex flex-col items-center">
        <h1 className="text-large-semi uppercase mb-6">Mot de passe modifié !</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
        </p>
        <button
          onClick={() => router.push("/account")}
          className="underline text-ui-fg-base"
        >
          Se connecter
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-sm w-full flex flex-col items-center">
      <h1 className="text-large-semi uppercase mb-6">Nouveau mot de passe</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Choisissez un nouveau mot de passe pour votre compte.
      </p>
      <form
        action={(formData) => {
            formData.append("token", token)
            formData.append("email", email)
            formAction(formData)
        }}
       >
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Nouveau mot de passe"
            name="new_password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            data-testid="new-password-input"
          />
          <Input
            label="Confirmer le mot de passe"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            data-testid="confirm-password-input"
          />
        </div>
        <ErrorMessage error={state.error} />
        <SubmitButton className="w-full mt-6">
          Réinitialiser le mot de passe
        </SubmitButton>
      </form>
      <button
        onClick={() => router.push("/account")}
        className="text-center text-ui-fg-base text-small-regular mt-6 underline"
      >
        Retour à la connexion
      </button>
    </div>
  )
}

export default ResetPasswordForm