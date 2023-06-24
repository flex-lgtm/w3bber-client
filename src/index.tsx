import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { m_AppBgColor } from "./Constants";

const theme = extendTheme({
  initialColorMode: "dark",
  useSystemColorMode: false,
  styles: {
    global: {
      body: {
        background: m_AppBgColor,
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <ChakraProvider theme={theme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ChakraProvider>
);
