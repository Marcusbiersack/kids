import Stripe from 'stripe';

// Inicializa o Stripe com a chave secreta
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',  // Certifique-se de usar a versão da API que você está utilizando
});