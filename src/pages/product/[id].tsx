// pages/product/[id].tsx

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
    price: string;
    description: string;
    defaultPriceId: string;
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
  if (!product || !suggestions) {
    return <p>Carregando...</p>;
  }

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: product.defaultPriceId,
        }),
      });

      const { checkoutUrl } = await response.json();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        alert('Erro ao criar a sessão de checkout.');
      }
    } catch (err) {
      setIsCreatingCheckoutSession(false);
      alert('Falha ao redirecionar ao checkout!');
    }
  }

  return (
    <>
      <Head>
        <title>{product.name}</title>
      </Head>
      <ProductContaider>
        <ImageContaider>
          <Image src={product.imageUrl || '/default-image.jpg'} alt={product.name} width={520} height={480} />
        </ImageContaider>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>
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
    const products = await stripe.products.list({ limit: 5 }); // Limita para evitar sobrecarga
  
    const paths = products.data.map((product) => ({
      params: { id: product.id },
    }));
  
    return {
      paths,
      fallback: 'blocking', // 'blocking' para garantir que a página será gerada durante a requisição
    };
  };
  export const getStaticProps: GetStaticProps = async ({ params }) => {
    const productId = params?.id;
  
    try {
      // Recuperando o produto principal
      const product = await stripe.products.retrieve(productId as string, {
        expand: ['default_price'],
      });
  
      const price = product.default_price as Stripe.Price;
  
      // Formatação do preço
      const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price.unit_amount / 100);
  
      // Recuperando produtos relacionados
      const relatedProducts = await stripe.products.list({
        limit: 5,
        expand: ['data.default_price'],
      });
  
      const suggestions = relatedProducts.data.map((suggestedProduct) => {
        const price = suggestedProduct.default_price as Stripe.Price;
        return {
          id: suggestedProduct.id,
          name: suggestedProduct.name,
          imageUrl: suggestedProduct.images[0] || '/default-image.jpg',
          price: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(price.unit_amount / 100),
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
            defaultPriceId: price.id,
          },
          suggestions,
        },
        revalidate: 60 * 60 * 24, // 24 horas
      };
    } catch (error) {
      console.error('Erro ao recuperar o produto:', error);
      return {
        notFound: true, // Página 404 caso o produto não exista
      };
    }
  };