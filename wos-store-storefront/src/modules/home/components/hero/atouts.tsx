import 'bootstrap-icons/font/bootstrap-icons.css';

const Atouts = () => {
return (
    <div className="w-full py-12 px-4 bg-white">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center">
        <i className="bi bi-truck text-4xl text-gray-800 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Livraison rapide et soignée</h3>
        <p className="text-sm text-gray-600">Nous livrons dans les plus courts délais et toujours bien emballé.</p>
        </div>

        <div className="flex flex-col items-center text-center">
        <i className="bi bi-patch-check text-4xl text-gray-800 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Produits authentiques</h3>
        <p className="text-sm text-gray-600">Nous contrôlons chaque produit afin de garantir son authenticité.</p>
        </div>

        <div className="flex flex-col items-center text-center">
        <i className="bi bi-credit-card text-4xl text-gray-800 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Paiement sécurisé</h3>
        <p className="text-sm text-gray-600">Nous utilisons des moyens de paiement sécurisés pour garantir la sécurité de vos données.</p>
        </div>

        <div className="flex flex-col items-center text-center">
        <i className="bi bi-arrow-repeat text-4xl text-gray-800 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Retour facile</h3>
        <p className="text-sm text-gray-600">Vous avez jusqu'à 14 jours pour être satisfait ou remboursé.</p>
        </div>
    </div>
    </div>
)
}

export default Atouts
