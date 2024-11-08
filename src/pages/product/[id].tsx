import { GetStaticPaths, GetStaticProps } from 'next';
import { stripe } from '../../lib/stripe';
import { Stripe } from 'stripe';
import Image from 'next/image';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ProductContaider, ImageContaider, ProductDetails } from '../../styles/pages/product';

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string; // Preço já formatado para exibição
    description: string;
    defaultPriceId: string; // Passando o priceId para o checkout
  };
  suggestions: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
  }[];
}

export default function Product({ product, suggestions }: ProductProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Função para criar a sessão de checkout com PIX ou Cartão
  const handleCheckout = async (paymentMethod: 'card' | 'pix') => {
    setIsCreatingCheckoutSession(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: product.defaultPriceId,
          paymentMethod, // Envia o tipo de pagamento escolhido
        }),
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url; // Redireciona para o Stripe Checkout
      } else {
        throw new Error('Erro ao criar sessão de checkout');
      }
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      setError('Erro ao criar a sessão de checkout');
      setIsCreatingCheckoutSession(false);
    }
  };

  const handleGeneratePix = async () => {
    setError(null);
    try {
      const response = await fetch('/api/gerar-pix', {
        method: 'POST',
        body: JSON.stringify({
          priceId: product.defaultPriceId, // Passa o priceId para a API
        }),
      });
  
      const data = await response.json();
      if (data.qrCode) {
        setPixQrCode(data.qrCode); // Recebe o QR Code gerado
      } else {
        setError('Não foi possível gerar o QR Code');
      }
    } catch (error) {
      console.error('Erro ao gerar o QR Code do PIX:', error);
      setError('Erro ao gerar o QR Code do PIX');
    }
  };

  return (
    <>
      <Head>
        <title>{product.name}</title>
      </Head>
      <ProductContaider>
        <ImageContaider>
          <Image
            src={product.imageUrl || '/default-image.jpg'}
            alt={product.name}
            width={520}
            height={480}
          />
        </ImageContaider>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span> {/* Exibindo o preço formatado */}
          <p>{product.description}</p>

          {/* Botão para pagamento via Stripe (cartão) */}
          <button disabled={isCreatingCheckoutSession} onClick={() => handleCheckout('card')}>
            Comprar agora (Cartão)
          </button>

          {/* Botão para gerar QR Code PIX */}
          <button disabled={isCreatingCheckoutSession} onClick={handleGeneratePix}>
            Pagar com PIX
          </button>

          {pixQrCode && (
  <div>
    <h3>Escaneie o QR Code para pagamento via PIX:</h3>
    <img src={`data:image/png;base64,${pixQrCode}`} alt="QR Code PIX" />
  </div>
)}

          {error && <p>{error}</p>}
        </ProductDetails>
      </ProductContaider>

      <h2>Sugestões de produtos</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {suggestions.map((suggestedProduct) => (
          <Link href={`/product/${suggestedProduct.id}`} key={suggestedProduct.id}>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <Image
                src={suggestedProduct.imageUrl || '/default-image.jpg'}
                alt={suggestedProduct.name}
                width={200}
                height={300}
                style={{ objectFit: 'cover' }}
              />
              <div>
                <strong>{suggestedProduct.name}</strong>
                <div>{suggestedProduct.price}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const products = await stripe.products.list({ limit: 5 });

  const paths = products.data.map((product) => ({
    params: { id: product.id },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const productId = params?.id as string;

  if (!productId) {
    return {
      notFound: true,
    };
  }

  try {
    // Recuperando o produto principal
    const product = await stripe.products.retrieve(productId, {
      expand: ['default_price'],
    });

    const price = product.default_price as Stripe.Price;
    if (!price) {
      console.error('Preço não encontrado para o produto', product.id);
      return { notFound: true };
    }

    // Formatação do preço para exibição (convertendo de centavos para reais)
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price.unit_amount / 100); // Convertendo de centavos para reais

    // Recuperando produtos relacionados
    const relatedProducts = await stripe.products.list({
      limit: 5,
      expand: ['data.default_price'],
    });

    // Formatação de preços para os produtos sugeridos
    const suggestions = relatedProducts.data.map((suggestedProduct) => {
      const price = suggestedProduct.default_price as Stripe.Price;
      return {
        id: suggestedProduct.id,
        name: suggestedProduct.name,
        imageUrl: suggestedProduct.images[0] || '/default-image.jpg',
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price.unit_amount / 100), // Formatar preço sugerido
      };
    });

    return {
      props: {
        product: {
          id: product.id,
          name: product.name,
          imageUrl: product.images[0] || '/default-image.jpg',
          price: formattedPrice, // Preço formatado como moeda
          description: product.description || 'Descrição não disponível',
          defaultPriceId: price.id,
        },
        suggestions,
      },
      revalidate: 60 * 60, // Revalidar a cada hora
    };
  } catch (error) {
    console.error('Erro ao recuperar o produto:', error);
    return { notFound: true };
  }
};