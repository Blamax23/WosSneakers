import React from 'react';
import Head from 'next/head';

const Retours: React.FC = () => {
  return (
    <>
      <Head>
        <title>Politique de retour</title>
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Politique de retour</h1>
        
        <div className="space-y-6 text-base leading-relaxed">
            <p>
                Notre politique dure 14 jours. Si plus de 14 jours se sont écoulés depuis votre achat, nous ne pouvons malheureusement offrir ni remboursement ni échange.
            </p>
            
            <p>
                Pour pouvoir être retourné, votre article doit être inutilisé et dans l'état où vous l'avez reçu. Il doit aussi être dans son emballage d'origine.
            </p>
            
            <p>
                Pour compléter votre retour, nous exigeons un reçu ou une preuve d'achat.<br/>
                Ne retournez pas votre achat au fabricant.
            </p>
            
            <div>
                <p className="mb-2">Dans certains cas, seuls des remboursements partiels sont accordés :</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Tout article qui n'est pas dans son état d'origine, qui est endommagé ou auquel il manque des pièces pour une raison non due à une erreur de notre part</li>
                    <li>Tout article retourné plus de 14 jours après sa livraison</li>
                </ul>
            </div>
            
            <div>
                <p className="font-semibold mb-2">Remboursements</p>
                <p>Une fois votre retour reçu et inspecté, nous vous adresserons un e-mail pour vous indiquer que nous avons reçu l'article retourné. Nous vous préciserons également si votre remboursement est approuvé ou refusé.<br/>
                S'il est approuvé, votre remboursement est alors traité et votre carte de crédit ou moyen de paiement initial se voit crédité(e) automatiquement dans un délai de quelques jours.</p>
            </div>
            
            <div>
                <p className="font-semibold mb-2">Remboursements retardés ou manquants</p>
                <p>Si vous n'avez pas encore reçu de remboursement, revérifiez d'abord votre compte bancaire.<br/>
                Puis contactez la société émettrice de votre carte de crédit, car il se peut que l'affichage officiel de votre remboursement prenne un peu de temps.<br/>
                Ensuite, contactez votre banque. L'affichage d'un remboursement est souvent précédé d'un délai de traitement.<br/>
                Si vous avez effectué toutes ces démarches et que vous n'avez toujours pas reçu votre remboursement, contactez-nous à l'adresse suivante : <span className="underline">wossneakers@gmail.com</span>.</p>
            </div>
            
            <div>
                <p className="font-semibold mb-2">Articles soldés ou en promotion</p>
                <p>Seuls les articles à prix normal sont remboursables. Malheureusement, les articles soldés ou en promotion ne le sont pas.</p>
            </div>
            
            <div>
                <p className="font-semibold mb-2">Expédition</p>
                <p className="mt-2">Les coûts d'expédition liés au retour de votre article sont à votre charge. Ils ne sont pas remboursables.</p>
                <p className="mt-2">Selon l'endroit où vous vivez, le délai de réception de votre produit échangé peut varier.</p>
                <p className="mt-2">Si vous expédiez un article d'une valeur supérieure à 75 €, nous vous recommandons d'utiliser un service de suivi d'expédition ou de faire assurer votre envoi. Nous ne garantissons pas que nous recevions l'article retourné.</p>
            </div>
        </div>
    </div>
    </>
  );
};

export default Retours;