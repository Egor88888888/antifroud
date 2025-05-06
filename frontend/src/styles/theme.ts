import { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#004B85', // основной фирменный цвет
    colorInfo: '#8EC0FF', // дополнительный цвет
    colorSuccess: '#CAFF85', // акцентный цвет
    colorBgContainer: '#FFFFFF', // фон
    colorText: '#333333', // текст
    borderRadius: 4, // скругление углов
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 4,
      controlHeight: 40,
    },
    Card: {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderRadius: 4,
    },
    Typography: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 14,
    },
  },
};

export const customStyles = {
  heading: {
    fontFamily: 'Roboto Bold, sans-serif',
    fontSize: {
      h1: '24px',
      h2: '20px',
      h3: '18px',
    },
    lineHeight: 1.4,
  },
  text: {
    regular: {
      fontFamily: 'Roboto Regular, sans-serif',
      fontSize: '14px',
      lineHeight: 1.6,
    },
    small: {
      fontFamily: 'Roboto Light, sans-serif',
      fontSize: '12px',
      lineHeight: 1.4,
    },
  },
  colors: {
    primary: '#004B85',
    secondary: '#8EC0FF',
    accent: '#CAFF85',
    background: '#FFFFFF',
    text: '#333333',
    border: '#E8E8E8',
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#F5222D',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 8px rgba(0,0,0,0.1)',
    large: '0 8px 16px rgba(0,0,0,0.1)',
  },
}; 