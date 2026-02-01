"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "@modules/account/components/forgot-password"
import { clearAuthToken } from "@lib/data/auth-actions"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password"
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState("sign-in")
  const searchParams = useSearchParams()
  const sessionExpired = searchParams.get("expired") === "true"

  // Supprimer le cookie JWT si la session a expiré
  useEffect(() => {
    if (sessionExpired) {
      clearAuthToken().catch(console.error)
    }
  }, [sessionExpired])

  return (
    <div className="w-full flex flex-col items-start px-8 py-8">
      {sessionExpired && (
        <div className="w-full max-w-sm mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            Votre session a expiré. Veuillez vous reconnecter.
          </p>
        </div>
      )}
      {currentView === "sign-in" ? (
        <Login setCurrentView={setCurrentView} />
      ) : currentView === "register" ? (
        <Register setCurrentView={setCurrentView} />
      ) : (
        <ForgotPassword setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

export default LoginTemplate
