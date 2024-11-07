import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { stripe } from "../lib/stripe";
import { Stripe } from "stripe";
import { HomeContainer, Product, ProductGrid } from "../styles/pages/home"; // Certifique-se de que está importando ProductGrid
import Link from "next/link"; // Importação do Link do Next.js
import { useState } from "react";
import vestImage from '../assets/pexels-ryutaro-6249454.jpg'; // Imagem de capa

interface HomeProps {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
  }[]
}

export default function Home({ products }: HomeProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
              {/* Verifique se os dados do produto estão presentes */}
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
        {/* ...restante do seu código do About aqui... */}
      </section>
    </>
  );
}
export const getStaticProps: GetStaticProps = async () => {
  try {
    const response = await stripe.products.list({
      expand: ['data.default_price'],
    });

    const products = response.data.map((product) => {
      const price = product.default_price as Stripe.Price;

      // Retornar um objeto com os dados do produto
      return {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0] || '/default-image.jpg', // Garantir que sempre tenha uma imagem
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price.unit_amount / 100),
      };
    });

    return {
      props: {
        products,
      },
      revalidate: 60 * 60 * 20, // 20 horas para revalidar a página
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      notFound: true, // Se algo der errado, retorna página 404
    };
  }
};