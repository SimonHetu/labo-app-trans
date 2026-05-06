// lib/stripe.ts
// Ce fichier cree un singleton Stripe reutilisable dans tout le projet

// Importer le SDK Stripe officiel
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion: "2026-04-22.dahlia"
})