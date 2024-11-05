// pages/_app.tsx
import { AppProps } from "next/app";
import { globalStyles } from "../styles/global";
import Image from "next/image";
import logoImg from '../assets/logo.svg';
import { Container, Header } from "../styles/pages/app";
import '../styles/styles.css'; // Importação do CSS global

globalStyles();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Container>
      <Header>
        <Image 
          src={logoImg}
          alt="" 
          width={129.74}
          height={52}
        />
      </Header>
      <Component {...pageProps} />
    </Container>
  );
}
