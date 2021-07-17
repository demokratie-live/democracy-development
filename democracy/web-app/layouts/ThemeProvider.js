import { ThemeProvider } from 'styled-components';

const defaultTheme = {
  colors: {
    default: '#000',
    primary: '#4494d3',
    tertiary: 'rgb(239,239,244)',
    link: '#4494d3',
    highlight: 'rgb(68,148,211)',
    lightBlue: 'rgba(68,148,211, 0.1)',
    disabled: 'rgb(216,216,216)',
    inactive: 'rgb(143,142,148)',
    divider: 'rgb(188,187,193)',
    arrow: 'rgb(173,173,176)',
  },
  backgrounds: {
    primary: '#ffffff',
    secondary: '#ececec',
    tertiary: 'rgb(242,242,242)',
  },
  fontSizes: {
    small: '16px',
    default: '20px',
    medium: '30px',
    large: '50px',
    huge: '80px',
  },
  responsive: {
    mobileWidth: '768px',
  },
  space: multi => multi * 10,
};

const ThemeProviderWrapper = ({ children }) => (
  <ThemeProvider theme={defaultTheme}>
    <>
      {children}
      <link rel="stylesheet" href="/static/style.css" />
      <link rel="stylesheet" href="/static/fonts/democracy/icons.css" />
      <style jsx global>{`
        @font-face {
          font-family: 'helvetica';
          src: url('/static/fonts/HelveticaNeue-Light-08.ttf') format('truetype');
        }
        @font-face {
          font-family: 'edosz';
          src: url('/static/fonts/edosz.ttf') format('truetype');
        }
        * {
          font-family: helvetica;
        }
        body {
          margin: 0;
          padding: 0;
        }
        a {
          color: #22bad9;
        }
        p {
          font-size: 14px;
          line-height: 24px;
        }
        article {
          margin: 0 auto;
          max-width: 650px;
        }
        button {
          align-items: center;
          background-color: #22bad9;
          border: 0;
          color: white;
          display: flex;
          padding: 5px 7px;
        }
        button:active {
          background-color: #1b9db7;
          transition: background-color 0.3s;
        }
        button:focus {
          outline: none;
        }
      `}</style>
    </>
  </ThemeProvider>
);

ThemeProviderWrapper.displayName = 'ThemeProvider';

export default ThemeProviderWrapper;
