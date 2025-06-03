"use client";

import { useState } from "react";

const NewsletterForm = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!email.trim()) {
            setMessage("Veuillez entrer une adresse email valide");
            setIsSuccess(false);
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/newsletter`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
                },
                body: JSON.stringify({
                    email: email.trim()
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "Inscription réussie ! Merci de vous être inscrit à notre newsletter.");
                setIsSuccess(true);
                setEmail(""); // Réinitialiser le formulaire
            } else {
                setMessage(data.message || "Une erreur est survenue lors de l'inscription.");
                setIsSuccess(false);
            }
        } catch (error) {
            console.error("Erreur lors de l'inscription:", error);
            setMessage("Erreur de connexion. Veuillez réessayer plus tard.");
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <input
                        type="email"
                        className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Entrez votre adresse email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${isLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    disabled={isLoading}
                >
                    {isLoading ? "Inscription en cours..." : "S'inscrire à la newsletter"}
                </button>
            </form>

            {message && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${isSuccess
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                    }`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default NewsletterForm;