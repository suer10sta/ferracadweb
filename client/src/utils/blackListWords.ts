// Function to check if keywords exist in text
function containsKeywords(text: string, keywords: string[]) {
    const lowerText = text.toLowerCase();
    for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
            return true;
        }
    }
    return false;
}

// Check if text contains spam or advertising content
function isSpamOrAdsText(text: string) {
    const spamTextKeywords = [
        // English spam terms
        'buy now', 'click here', 'limited time', 'urgent action', 'winner', 'earn money', 'fast cash',
        'cialis', 'casino', 'bitcoin', 'cryptocurrency', 'viagra', 'pharmacy', 'prescription',
        'work from home', 'guaranteed income', 'no risk', 'get rich', 'free money', 'millionaire',
        'loan offer', 'credit repair', 'act now', 'best price', 'cheap deal', 'discount',
        'promo code', 'subscribe now', 'make money fast', 'online gambling', 'lottery', 'prize',
        'you\'ve won', 'congratulations', 'selected', 'exclusive offer', 'limited offer',
        
        // Digital marketing & SEO spam
        'seo', 'search engine optimization', 'digital marketing', 'social media marketing',
        'google ranking', 'page rank', 'backlinks', 'link building', 'keyword ranking',
        'website traffic', 'organic traffic', 'leads generation', 'conversion rate',
        'email marketing', 'newsletter', 'opt-in', 'lead magnet', 'funnel', 'sales funnel',
        'affiliate marketing', 'dropshipping', 'passive income', 'side hustle',
        'make money online', 'online business', 'ecommerce', 'shop now', 'buy today',
        'limited stock', 'while supplies last', 'final clearance', 'huge discount',
        'massive savings', 'special promotion', 'flash sale', 'black friday', 'cyber monday',
        'web traffic', 'clicks', 'impressions', 'cta', 'call to action', 'conversion',
        'roi', 'return on investment', 'viral', 'go viral', 'boost engagement',
        'instagram followers', 'youtube views', 'tiktok followers', 'social media growth',
        
        // Additional Marketing & Commercial Keywords
        'marketing agency', 'brand awareness', 'content marketing', 'inbound marketing',
        'outbound marketing', 'ppc', 'pay per click', 'google ads', 'facebook ads',
        'instagram ads', 'banner ads', 'native advertising', 'programmatic advertising',
        'cpm', 'cpc', 'cpa', 'cost per acquisition', 'kpi', 'key performance indicator',
        'b2b', 'b2c', 'business to business', 'business to consumer',
        'customer acquisition', 'customer retention', 'lifetime value', 'customer lifetime value',
        'market research', 'target audience', 'buyer persona', 'customer journey',
        'omnichannel', 'multichannel', 'cross-channel', 'retargeting', 'remarketing',
        'ab testing', 'split testing', 'conversion optimization', 'landing page',
        'lead generation', 'cold calling', 'telemarketing', 'direct mail',
        'public relations', 'pr', 'media buying', 'ad space', 'sponsorship',
        'influencer marketing', 'brand ambassador', 'affiliate program',
        'sales page', 'checkout page', 'shopping cart', 'abandoned cart',
        'upsell', 'cross-sell', 'downsell', 'one time offer', 'oto',
        'webinar', 'masterclass', 'free training', 'free workshop',
        'demo', 'free trial', 'money back guarantee', 'satisfaction guaranteed',
        'wholesale', 'retail', 'distributor', 'reseller', 'dropship',
        'closeout', 'overstock', 'clearance sale', 'going out of business',
        'pre-order', 'early bird', 'launch discount', 'introductory offer',
        'bundle', 'package deal', 'combo offer', 'premium package',
        'vip', 'exclusive', 'elite', 'pro', 'professional', 'enterprise',
        'automated', 'autopilot', 'hands-free', 'effortless', 'easy money',
        'revolutionary', 'breakthrough', 'innovative', 'cutting-edge',
        'industry secret', 'insider tip', 'hidden method', 'little-known',
        'system', 'method', 'formula', 'blueprint', 'framework',
        'mastermind', 'coaching', 'mentorship', 'consulting', 'agency services',
        
        // French spam terms
        'achetez maintenant', 'cliquez ici', 'gagnant', 'gagner de l\'argent', 'argent rapide',
        'revenu garanti', 'sans risque', 'revenus passifs', 'temps limité', 'travail à domicile',
        'cialis', 'casino', 'bitcoin', 'cryptomonnaie', 'viagra', 'pharmacie',
        'prêt rapide', 'crédit facile', 'obtenez riche', 'publicité sponsorisée', 'loterie',
        'félicitations', 'vous avez gagné', 'offre exclusive', 'offre limitée',
        'marketing digital', 'référencement naturel', 'seo', 'optimisation pour les moteurs de recherche',
        'marketing des médias sociaux', 'classement google', 'backlinks', 'création de liens',
        'trafic web', 'trafic organique', 'génération de leads', 'taux de conversion',
        'marketing par email', 'newsletter', 'opt-in', 'revenu passif', 'commerce en ligne',
        'achat immédiat', 'stock limité', 'soldes', 'promotion exceptionnelle',
        'vente flash', 'rabais important', 'économies importantes', 'affiliation',
        'abonnés instagram', 'vues youtube', 'abonnés tiktok', 'croissance des médias sociaux',
        
        // Additional French Marketing & Commercial Terms
        'agence marketing', 'notoriété de marque', 'marketing de contenu',
        'marketing entrant', 'marketing sortant', 'publicité en ligne',
        'annonces google', 'annonces facebook', 'annonces instagram',
        'publicité native', 'publicité programmatique',
        'coût par clic', 'coût par acquisition', 'indicateur de performance',
        'entreprise à entreprise', 'entreprise à consommateur',
        'acquisition de clients', 'fidélisation de la clientèle',
        'recherche de marché', 'audience cible', 'persona acheteur',
        'parcours client', 'omnicanal', 'reciblage', 'test a/b',
        'page de destination', 'génération de leads', 'appel froid',
        'télémarketing', 'courrier direct', 'relations publiques',
        'achat d\'espace publicitaire', 'parrainage', 'marketing d\'influence',
        'ambassadeur de marque', 'programme d\'affiliation',
        'page de vente', 'page de paiement', 'panier abandonné',
        'vente additionnelle', 'vente croisée', 'offre unique',
        'webinaire', 'formation gratuite', 'atelier gratuit',
        'démonstration', 'essai gratuit', 'garantie de remboursement',
        'satisfaction garantie', 'grossiste', 'détaillant',
        'distributeur', 'revendeur', 'liquidation', 'surstock',
        'précommande', 'tarif early bird', 'offre de lancement',
        'offre groupée', 'forfait', 'offre combo', 'forfait premium',
        'vip', 'exclusif', 'élite', 'professionnel', 'entreprise',
        'automatisé', 'pilote automatique', 'sans effort',
        'révolutionnaire', 'innovation', 'de pointe',
        'secret de l\'industrie', 'conseil d\'initié', 'méthode cachée',
        'système', 'méthode', 'formule', 'plan directeur', 'cadre',
        'mastermind', 'coaching', 'mentorat', 'conseil', 'services d\'agence', 'ATTENTION'
    ];

    return containsKeywords(text, spamTextKeywords);
}

// Export the functions
export { containsKeywords, isSpamOrAdsText };

// Default export
export default isSpamOrAdsText;