// pages/index.tsx
import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { stripe } from "../lib/stripe";
import { Stripe } from "stripe";
import { HomeContainer, Product } from "../styles/pages/home";
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Link from "next/link";
import { useState } from "react";
import vestImage from '../assets/melhor-loja-de-brinquedos.jpg.webp'; // Mantenha a importação da imagem

interface HomeProps {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
  }[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    }
  });

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <Head>
        <title>Toy Kids Brasil</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css" />
      </Head>

      {/* Header */}
      <header className="max-width bg" id="Home">
        <div className="container">
          <nav className="menu">
            <div className="logo"></div>
            <div className="desktop-menu">
              <ul>
                <li><a href="#Home">Home</a></li>
                <li><a href="#About">Novidades</a></li>
                <li><a href="#Service">Destaque</a></li>
                <li><a href="#Contact">Contato</a></li>
              </ul>
            </div>
            <div className="mobile-menu" onClick={toggleMenu}>
              <i className="fa fa-bars"></i>
              <ul id="myLinks" style={{ display: menuOpen ? 'block' : 'none' }}>
                <li><a href="#Home">Home</a></li>
                <li><a href="#About">Novidades</a></li>
                <li><a href="#Service">Destaque</a></li>
                <li><a href="#Contact">Contato</a></li>
              </ul>
            </div>
          </nav>
          <div className="call">
            <div className="left">
              <h1 className="color-azul text-gd">Novidades em Alta</h1>
              <p className="color-azul text-pq">Confira os produtos que estão bombando</p>
              <button>Compre Agora</button>
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

      {/* Products Slider */}
      <HomeContainer ref={sliderRef} className="keen-slider">
        {products.map(product => (
          <Link href={`/product/${product.id}`} key={product.id} prefetch={false}>
            <Product className="keen-slider__slide">
              <Image src={product.imageUrl} alt={product.name} width={520} height={480} />
              <footer>
                <strong>{product.name}</strong>
                <span>{product.price}</span>
              </footer>
            </Product>
          </Link>
        ))}
      </HomeContainer>

      {/* About Section */}
      <section className="max-width bg2" id="About">
        {/* ...restante do seu código do About aqui... */}
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price']
  });

  const products = response.data.map(product => {
    const price = product.default_price as Stripe.Price;

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
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
    revalidate: 60 * 60 * 20 // 2 horas   
  };
}
