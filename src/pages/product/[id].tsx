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

  // Fallback durante o carregamento
  if (!product || !suggestions || suggestions.length === 0) {
    return <p>Carregando...</p>;
  }

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true);
  
      // Garantir que você está passando o priceId correto
      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: product.defaultPriceId, // Passando o priceId, não o valor do preço
        }),
      });
  
      const session = await response.json();
      if (session.url) {
        window.location.href = session.url; // Redireciona para o Stripe Checkout
      } else {
        throw new Error('Erro ao criar sessão de checkout');
      }
  
    } catch (error) {
      console.error('Erro ao criar a sessão de checkout:', error);
      setIsCreatingCheckoutSession(false);
    }
  }

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
          <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>
            Comprar agora
          </button>
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
                <div>{suggestedProduct.price}</div> {/* Exibindo o preço formatado */}
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

    // Formatação do preço
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
        }).format(price.unit_amount / 100), // Formatação para os produtos sugeridos
      };
    });

    return {
      props: {
        product: {
          id: product.id,
          name: product.name,
          imageUrl: product.images[0] || '/default-image.jpg',
          price: formattedPrice,
          description: product.description || 'Sem descrição',
          defaultPriceId: price.id, // Passando o priceId correto para o checkout
        },
        suggestions,
      },
      revalidate: 60 * 60 * 24, // 24 horas
    };
  } catch (error) {
    console.error('Erro ao recuperar o produto:', error);
    return {
      notFound: true,
    };
  }
};