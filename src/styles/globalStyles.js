import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  html, body { height: 100%; }
  html { overflow-x: hidden; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  body {
    margin: 0;
    font-family: "Open Sans", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif;
    font-weight: 400;
    overflow-x: hidden;
    background:
      radial-gradient(1000px 700px at 15% 10%, rgba(37, 99, 235, 0.14), transparent 60%),
      radial-gradient(900px 650px at 90% 12%, rgba(6, 182, 212, 0.12), transparent 62%),
      radial-gradient(900px 800px at 50% 100%, rgba(37, 99, 235, 0.07), transparent 55%),
      ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }

  img, svg, video, canvas {
    max-width: 100%;
  }

  a { color: inherit; text-decoration: none; }
  button, input { font: inherit; }

  input::placeholder,
  textarea::placeholder {
    color: #000000;
    opacity: 1;
  }

  @media (hover: hover) and (pointer: fine) {
    a, button {
      -webkit-tap-highlight-color: transparent;
    }

    button:hover, a:hover {
      text-shadow: 0 0 0 rgba(0,0,0,0);
    }
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

