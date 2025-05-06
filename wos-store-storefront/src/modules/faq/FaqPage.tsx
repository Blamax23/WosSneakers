"use client"

import React, { useState } from "react"

const faqData = [
  {
    question: "Comment suivre ma commande ?",
    answer: "Tu peux suivre ta commande depuis ton espace client dans la section 'Mes commandes'.",
  },
  {
    question: "Quels sont les délais de livraison ?",
    answer: "Les délais de livraison varient entre 2 et 5 jours ouvrés selon ta localisation.",
  },
  {
    question: "Puis-je modifier ma commande après validation ?",
    answer: "Oui, tu peux la modifier tant qu'elle n'est pas encore expédiée. Contacte le support rapidement.",
  },
]

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    const toggle = (index: number) => {
        setActiveIndex(index === activeIndex ? null : index)
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Foire aux Questions</h2>
            <div className="space-y-4">
                {faqData.map((item, index) => (
                <div
                    key={index}
                    className="border border-gray-200 rounded-md overflow-hidden"
                >
                    <button
                        onClick={() => toggle(index)}
                        className="w-full text-left px-4 py-3 bg-black text-white hover:bg-black flex justify-between items-center"
                    >
                    <span className="font-medium">{item.question}</span>
                    <span className="text-xl">
                        {activeIndex === index ? "−" : "+"}
                    </span>
                    </button>
                    {activeIndex === index && (
                    <div className="px-4 py-3 text-sm text-gray-700 bg-white">
                        {item.answer}
                    </div>
                    )}
                </div>
                ))}
            </div>
        </div>
    )
}

export default FAQ
