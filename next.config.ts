// next.config.ts
// Configuration Next.js — ajoute des headers HTTP de securite a toutes les pages

// Importer le type NextConfig pour le typage TypeScript
import type { NextConfig } from 'next';

// Verifier si on est en mode production (true) ou developpement (false)
// Certains headers ne doivent etre actives qu'en production
const isProduction = process.env.NODE_ENV === 'production';

// Tableau de tous les headers de securite a ajouter aux reponses HTTP
const securityHeaders = [
  // 1. X-Frame-Options : empeche le site d'etre affiche dans une iframe
  // Protege contre les attaques de clickjacking
  {
    key: 'X-Frame-Options',
    value: 'DENY', // DENY = aucun site ne peut integrer le notre dans une iframe
  },
  // 2. X-Content-Type-Options : empeche le navigateur de deviner le type MIME
  // Le navigateur doit respecter le Content-Type envoye par le serveur
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff', // nosniff = pas de "sniffing" de type MIME
  },
  // 3. Referrer-Policy : controle les informations envoyees dans le header Referer
  // Evite de transmettre des URLs completes contenant des donnees sensibles
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin', // Envoie uniquement l'origine pour les requetes cross-origin
  },
  // 4. Permissions-Policy : desactive certaines APIs du navigateur non necessaires
  // Reduit la surface d'attaque en bloquant camera, micro, geolocalisation
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    // camera=() → desactive la camera
    // microphone=() → desactive le micro
    // geolocation=() → desactive la geolocalisation
    // interest-cohort=() → desactive l'ancien mecanisme de tracking FLoC
  },
  // 5. HSTS (Strict-Transport-Security) : force HTTPS — UNIQUEMENT en production
  // En developpement, on utilise http://localhost:3000 donc HSTS bloquerait tout
  ...(isProduction
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
          // max-age=63072000 → le navigateur se souvient pendant 2 ans
          // includeSubDomains → applique aussi aux sous-domaines
          // preload → permet d'etre ajoute a la liste de pre-chargement HSTS des navigateurs
        },
      ]
    : []), // En developpement : tableau vide (pas de HSTS)
  // 6. Content-Security-Policy (CSP) : controle ce que le navigateur peut charger
  // C'est le header de securite le plus puissant et le plus complexe
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",                    // Par defaut : uniquement les ressources du meme site
      `script-src 'self' 'unsafe-inline' ${    // Scripts autorises :
        isProduction ? '' : "'unsafe-eval'"     // 'unsafe-eval' uniquement en dev (hot reload)
      } https://js.stripe.com`,                 // + scripts Stripe
      "frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com",  // Iframes Stripe uniquement
      "connect-src 'self' https://api.stripe.com",  // Connexions API : notre site + API Stripe
      "img-src 'self' data: https:",            // Images : locales, base64, et tout HTTPS
      "style-src 'self' 'unsafe-inline'",       // Styles : locaux + inline (necessaire pour React)
      "font-src 'self' data:",                  // Polices : locales et data URI
      "object-src 'none'",                      // Objets (Flash, Java) : bloques completement
      "base-uri 'self'",                        // Balise <base> : uniquement meme site
      "form-action 'self' https://checkout.stripe.com",  // Formulaires : notre site + Stripe
      "frame-ancestors 'none'",                 // Equivalent moderne de X-Frame-Options: DENY
    ].join('; '), // Joindre toutes les directives avec un point-virgule
  },
];

// Configuration principale de Next.js
const nextConfig: NextConfig = {
  // Fonction async headers() : Next.js l'appelle pour ajouter des headers personnalises
  async headers() {
    return [
      {
        source: '/:path*',          // Appliquer a TOUTES les routes du site
        headers: securityHeaders,    // Utiliser notre tableau de headers de securite
      },
    ];
  },
};

export default nextConfig;
