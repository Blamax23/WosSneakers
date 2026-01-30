"use client"

import React, { useEffect, useActionState, useRef } from "react"

import { HttpTypes } from "@medusajs/types"
import { deleteAccount } from "@lib/data/customer"

import { Disclosure, Dialog } from "@headlessui/react"
import { Badge, Button, clx } from "@medusajs/ui"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfileDelete: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  // 🔹 REF DU FORM (IMPORTANT)
  const formRef = useRef<HTMLFormElement>(null)

  const [state, formAction] = useActionState(deleteAccount, {} as any)

  useEffect(() => {
    setSuccessState(state?.success)

    if (state?.success) {
      closeModal()
      // optionnel : redirect après suppression
      window.location.href = "/"
    }
  }, [state])

  const isError = !!state?.error
  const errorMessage = state?.error

  return (
    <form ref={formRef} action={formAction} className="w-full">
      <div className="text-small-regular" data-testid="account-delete">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="uppercase text-ui-fg-base">
              Supprimer mon compte
            </span>
            <span className="italic">
              Vous pouvez supprimer votre compte à tout moment.
            </span>
          </div>

          <Button
            variant="secondary"
            className="w-[100px] min-h-[25px] py-1 bg-red-600 hover:bg-red-700 text-white"
            type="button"
            onClick={openModal}
          >
            Supprimer
          </Button>
        </div>

        {/* 🔴 Error state */}
        <Disclosure>
          <Disclosure.Panel
            static
            className={clx(
              "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
              {
                "max-h-[1000px] opacity-100": isError,
                "max-h-0 opacity-0": !isError,
              }
            )}
          >
            <Badge className="p-2 my-4" color="red">
              <span>{errorMessage}</span>
            </Badge>
          </Disclosure.Panel>
        </Disclosure>
      </div>

      {/* 🧠 MODAL HEADLESS UI */}
      <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Supprimer le compte
            </Dialog.Title>

            <Dialog.Description className="mt-2 text-sm text-gray-600">
              Cette action est{" "}
              <span className="font-semibold text-red-600">
                irréversible
              </span>
              . Êtes-vous sûr de vouloir supprimer votre compte ?
            </Dialog.Description>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                type="button"
                onClick={closeModal}
              >
                Annuler
              </Button>

              {/* 🔥 LE BOUTON IMPORTANT */}
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white"
                type="button"
                onClick={() => {
                  formRef.current?.requestSubmit()
                }}
              >
                Confirmer
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </form>
  )
}

export default ProfileDelete
