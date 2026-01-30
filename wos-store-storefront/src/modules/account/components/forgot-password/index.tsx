"use client"

import { useState, useActionState, useEffect } from "react"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import ErrorMessage from "@modules/checkout/components/error-message"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { requestPasswordReset } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

type PasswordResetState = {
  success?: boolean
  error?: string
}

export type { PasswordResetState }

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [emailSent, setEmailSent] = useState(false)

  const [state, formAction] = useActionState<PasswordResetState>(
    requestPasswordReset as any,
    {}
  )

  // ✅ Réagir AU CHANGEMENT de state
  useEffect(() => {
    if (state.success) {
      setEmailSent(true)
    }
  }, [state])

  if (emailSent) {
    return (
      <div className="max-w-sm w-full flex flex-col items-center">
        <h1 className="text-large-semi uppercase mb-6">Email envoyé !</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          Si un compte existe avec cette adresse, vous recevrez un email avec les
          instructions pour réinitialiser votre mot de passe.
        </p>
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline text-ui-fg-base"
        >
          Retour à la connexion
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-sm w-full flex flex-col items-center">
      <h1 className="text-large-semi uppercase mb-6">Mot de passe oublié</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Entrez votre adresse email et nous vous enverrons un lien pour
        réinitialiser votre mot de passe.
      </p>

      {/* ✅ PAS de async / await ici */}
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            required
            data-testid="forgot-password-email-input"
          />
        </div>

        <ErrorMessage error={state.error} />

        <SubmitButton className="w-full mt-6">
          Envoyer le lien
        </SubmitButton>
      </form>

      <button
        onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
        className="text-center text-ui-fg-base text-small-regular mt-6 underline"
      >
        Retour à la connexion
      </button>
    </div>
  )
}

export default ForgotPassword
