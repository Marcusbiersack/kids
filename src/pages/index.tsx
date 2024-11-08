import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { stripe } from "../lib/stripe";
import { Stripe } from "stripe";
import { HomeContainer, Product, ProductGrid } from "../styles/pages/home";
import Link from "next/link";
import { useState } from "react";
import vestImage from '../assets/pexels-ryutaro-6249454.jpg';

interface HomeProps {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
  }[];
  error?: string;
}

export default function Home({ products, error }: HomeProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Exibindo uma mensagem de erro caso ocorra algum problema no carregamento
  if (error) {
    return (
      <div>
        <h1>Erro ao carregar produtos</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Loja Canti Brasil</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" />
      </Head>

      {/* Header */}
      <header className="max-width bg" id="Home">
        <div className="container">
          <nav className="menu">
            <div className="logo"></div>
            <div className="desktop-menu">
              <ul>
                <li><Link href="#Home">Home</Link></li>
                <li><Link href="/product/prod_RAcmPXcJLFvG4U">Brinquedos</Link></li>
                <li><Link href="/product/prod_RAd7LAfMf1f68o">Eletrônicos</Link></li>
                <li><Link href="/product/prod_RAcuKq521rxlRy">Airsoft & Caça</Link></li>
              </ul>
            </div>
            <div className="mobile-menu" onClick={toggleMenu}>
              <i className="fa fa-bars"></i>
              <ul id="myLinks" style={{ display: menuOpen ? 'block' : 'none' }}>
                <li><Link href="#Home">Home</Link></li>
                <li><Link href="/product/prod_RAcmPXcJLFvG4U">Brinquedos</Link></li>
                <li><Link href="/product/prod_RAd7LAfMf1f68o">Eletrônicos</Link></li>
                <li><Link href="/product/prod_RAcuKq521rxlRy">Airsoft & Caça</Link></li>
              </ul>
            </div>
          </nav>
          <div className="call">
            <div className="left">
              <h1 className="color-azul text-gd">Lojas Canti Com as Melhores Novidades</h1>
              <p className="color-azul text-pq">Confira os produtos que estão bombando, temos as melhores opções de presente.</p>
              <button>Confira Ofertas</button>
            </div>
            <div className="right">
              <div className="imagem">
                <Image src={vestImage} alt="Vest" layout="responsive" width={500} height={500} />
              </div>
            </div>
          </div>
        </div>
        <button id="back-to-top" onClick={() => window.scrollTo(0, 0)}>^</button>
      </header>

      {/* Product Grid */}
      <ProductGrid>
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} prefetch={false}>
            <Product>
              <Image
                src={product.imageUrl || '/default-image.jpg'}
                alt={product.name || 'Produto sem nome'}
                width={400}
                height={600}
                style={{ objectFit: 'cover' }}
              />
              <footer>
                <strong>{product.name || 'Produto sem nome'}</strong>
                <span>{product.price}</span>
              </footer>
            </Product>
          </Link>
        ))}
      </ProductGrid>

      {/* About Section */}
      <section className="max-width bg2" id="About">
        {/* Adicione o conteúdo do "About" aqui */}
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    let allProducts: Stripe.Product[] = [];
    let hasMore = true;
    let startingAfter: string | null = null;

    // Loop para pegar todos os produtos com paginação
    while (hasMore) {
      const params: { limit: number; starting_after?: string; expand: string[] } = {
        limit: 100,  // Limite de produtos por requisição
        expand: ['data.default_price', 'data.prices'],  // Expandindo para pegar os preços também
      };

      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      const response = await stripe.products.list(params);

      allProducts = [...allProducts, ...response.data];

      if (response.has_more) {
        startingAfter = response.data[response.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }

    // Mapeando os produtos e seus preços
    const products = allProducts.map((product) => {
      // Garantir que você tem um preço para o produto
      const defaultPrice = product.default_price as Stripe.Price; // Acessando o preço padrão

      return {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0] || '/default-image.jpg',
        price: defaultPrice
          ? new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(defaultPrice.unit_amount / 100) // Convertendo de centavos para reais
          : 'Preço indisponível',
        priceId: defaultPrice ? defaultPrice.id : null,  // Passando o priceId para a página
      };
    });

    return {
      props: {
        products,
      },
      revalidate: 60 * 60 * 20, // Revalidação da página a cada 20 horas
    };
  } catch (error) {
    console.error('Erro ao recuperar os produtos:', error);
    return {
      props: {
        products: [],
        error: 'Não foi possível carregar os produtos no momento. Tente novamente mais tarde.',
      },
    };
  }
};