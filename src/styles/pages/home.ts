import { styled } from "..";

export const HomeContainer = styled('main', {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: 'calc(100vw - ((100vw - 1180px) / 2))',
  marginLeft: 'auto',
  minHeight: 656,
  padding: '20px',
});

export const ProductGrid = styled('section', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Usa auto-fill e minmax para adaptação responsiva
  gap: '50px', // Espaçamento entre os itens
  marginTop: '40px',
  padding: '0 15px',
  justifyItems: 'center', // Centraliza os itens na grid
  alignItems: 'start', // Garante que os itens começam no topo
  width: '100%',  // Usar 100% para garantir que a grade ocupe toda a largura disponível
  maxWidth: 'none', // Removido o limite de largura para permitir exibição total
  marginLeft: 'auto',
  marginRight: 'auto', // Centraliza os itens na tela

  '@media (max-width: 1200px)': {
    gridTemplateColumns: 'repeat(3, 1fr)', // 3 colunas em telas menores que 1200px
  },

  '@media (max-width: 768px)': {
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 colunas em telas menores que 768px
  },

  '@media (max-width: 480px)': {
    gridTemplateColumns: '1fr', // 1 coluna em telas menores que 480px
  }
});

export const Product = styled('div', {
  background: 'linear-gradient(180deg, #781ea4 0%, #7465d4 100%)',
  borderRadius: 8,
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.2s ease',
  maxWidth: '500px', // Limita o tamanho máximo de cada produto para evitar que fiquem muito grandes

  '&:hover': {
    transform: 'scale(1.05)', // Efeito de zoom quando o usuário passa o mouse
  },

  // Estilo da imagem
  img: {
    objectFit: 'contain', // Alterado para contain para que a imagem não seja cortada
    width: '100%', // Garante que a imagem ocupe toda a largura disponível
    height: 'auto', // Mantém a altura proporcional à largura da imagem
  },

  footer: {
    position: 'absolute',
    bottom: '0.25rem',
    left: '0.25rem',
    right: '0.25rem',
    padding: '1.5rem',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    transform: 'translateY(110%)',
    opacity: 0,
    transition: 'all 0.2s ease-in-out',

    strong: {
      fontSize: '$lg',
      color: '$gray100',
    },

    span: {
      fontSize: '$xl',
      fontWeight: 'bold',
      color: '$green300',
    },
  },

  '&:hover footer': {
    transform: 'translateY(0%)',
    opacity: 1,
  },
});