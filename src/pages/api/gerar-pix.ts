import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../lib/stripe"; // Certifique-se de que isso esteja correto
import BrCode from "@models/BrCode"; // Importe a classe para gerar o QR Code
import QRCode from "qrcode"; // Certifique-se de que QRCode está instalado
import { v4 as uuidv4 } from "uuid"; // UUID para gerar transações únicas

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { priceId } = JSON.parse(req.body);

    if (!priceId) {
      return res.status(400).json({ error: "priceId é obrigatório" });
    }

    try {
      // Recupera o preço do produto usando o priceId
      const price = await stripe.prices.retrieve(priceId);

      if (!price) {
        return res.status(404).json({ error: "Preço não encontrado" });
      }

      // Dados para gerar o QR Code Pix
      const chavePix = "marcosraline08@gmail.com"; // Chave do recebedor (exemplo com e-mail)
      const txid = Date.now().toString(); // TXID único para a transação

      // Preço do produto já em reais (em vez de centavos)
      const amountInReais = price.unit_amount / 10000; // Converte de centavos para reais

      // Verifique se o valor está correto
      console.log("Valor do produto em reais: ", amountInReais); // Exemplo: 45.50

      // Gerar o GUI (Globally Unique Identifier) para o arranjo de pagamento
      const gui = uuidv4(); // Gera um UUID único dinamicamente

      // **Declaração e inicialização de brCode antes do uso**
      const brCode = new BrCode(
        chavePix,
        amountInReais.toFixed(2), // Passa o valor em reais corretamente formatado
        "MARCUS VINICIUS TAVA", // Nome do recebedor
        txid, // ID da transação
        "email", // Tipo de chave Pix (email, celular, CPF/CNPJ)
        "CARUARU" // Cidade do recebedor
      );

      // Gerar o payload para o QR Code
      const payload = brCode.generate_qrcp();

      // Gerar o QR Code com a string do payload
      const qrCode = await QRCode.toDataURL(payload); // Gerar QR Code

      // Remover o prefixo "data:image/png;base64," da string base64
      const base64Data = qrCode.split(",")[1];

      // Retornar o QR Code gerado
      return res.status(200).json({ qrCode: base64Data });
    } catch (error) {
      console.error("Erro ao gerar o QR Code do PIX:", error);
      return res.status(500).json({ error: "Erro ao gerar QR Code do PIX" });
    }
  } else {
    return res.status(405).json({ error: "Método não permitido" });
  }
}