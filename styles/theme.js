import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    red: {
      50: '#fff5f5',
      100: '#fed7d7',
      200: '#feb2b2',
      300: '#fc8181',
      400: '#f56565',
      500: '#e53e3e',
      600: '#c53030',
      700: '#9b2c2c',
      800: '#822727',
      900: '#63171b',
    },
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      sizes: {
        xl: {
          h: '56px',
          fontSize: 'lg',
          px: '32px',
        },
      },
    },
    Card: {
      baseStyle: {
        p: '20px',
        borderRadius: 'lg',
        boxShadow: 'md',
      },
    },
  },
});

export default theme;
