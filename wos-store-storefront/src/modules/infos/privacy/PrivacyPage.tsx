import React from 'react';
import Head from 'next/head';

const Privacy: React.FC = () => {
  return (
    <>
      <Head>
        <title>Politique de Confidentialité</title>
      </Head>
      <div className="px-4 py-8 max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">Politique de Confidentialité</h1>
        <p className="text-center text-sm text-gray-500 mb-8">Dernière mise à jour : Février 2025</p>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Collecte des données personnelles</h2>
            <p className="mb-2">Nous collectons les informations suivantes lorsque vous utilisez notre site :</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Lors de la création d’un compte :</strong> Nom, prénom, email, adresse, numéro de téléphone.</li>
              <li><strong>Lors d’un achat :</strong> Adresse de livraison, moyen de paiement.</li>
              <li><strong>Cookies & tracking :</strong> Données de navigation et préférences utilisateur.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Utilisation des données</h2>
            <p className="mb-2">Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Gérer votre compte et vos commandes.</li>
              <li>Vous envoyer des emails de confirmation et de suivi.</li>
              <li>Améliorer votre expérience utilisateur.</li>
              <li>Personnaliser nos offres et recommandations.</li>
            </ul>
            <p className="mt-2"><strong>Nous ne vendons pas</strong> vos données à des tiers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Partage des données</h2>
            <p className="mb-2">Nous partageons certaines données avec :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Nos prestataires de paiement (ex: Stripe, PayPal).</li>
              <li>Nos transporteurs pour la livraison.</li>
              <li>Des services analytiques (ex: Google Analytics).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Durée de conservation</h2>
            <p className="mb-2">Vos données sont conservées selon la durée suivante :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Données de compte : Tant que votre compte est actif.</li>
              <li>Données de commande : 5 ans (obligations légales).</li>
              <li>Cookies : Entre 6 mois et 2 ans selon leur usage.</li>
            </ul>
            <p className="mt-2">Vous pouvez demander la suppression de vos données à tout moment.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Sécurité des données</h2>
            <p className="mb-2">Nous mettons en place des mesures de sécurité :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Chiffrement des transactions (SSL/TLS).</li>
              <li>Stockage sécurisé des informations.</li>
              <li>Accès restreint aux données personnelles.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Vos droits</h2>
            <p className="mb-2">Conformément au RGPD, vous avez le droit de :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Accéder à vos données.</li>
              <li>Modifier ou supprimer vos informations.</li>
              <li>Retirer votre consentement pour les cookies.</li>
              <li>Demander l’exportation de vos données.</li>
            </ul>
            <p className="mt-2">Pour exercer ces droits, contactez-nous à <strong>[ton email]</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Cookies & suivi</h2>
            <p className="mb-2">Nous utilisons des cookies pour :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Assurer le bon fonctionnement du site.</li>
              <li>Analyser le trafic (Google Analytics).</li>
              <li>Personnaliser les publicités.</li>
            </ul>
            <p className="mt-2">Vous pouvez gérer vos préférences via notre bandeau de cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
            <p className="mb-4">Pour toute question, contactez-nous :</p>
            <a href="/contact">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
                Contact
              </button>
            </a>
          </section>
        </div>
      </div>
    </>
  );
};

export default Privacy;