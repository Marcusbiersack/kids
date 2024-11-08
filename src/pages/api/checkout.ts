import { stripe } from "../../lib/stripe"; // Supondo que você tenha configurado o stripe na lib
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { priceId } = JSON.parse(req.body); // Aqui estamos recebendo o priceId enviado do cliente

      if (!priceId) {
        return res.status(400).json({ error: 'Preço não encontrado' });
      }

      // Criando a sessão de checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId, // Usando o priceId, não o valor do preço
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      });

      return res.status(200).json({ url: session.url });

    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
}