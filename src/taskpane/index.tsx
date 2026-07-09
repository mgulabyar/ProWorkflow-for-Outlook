declare const Office: any;
import React from "react";
import * as ReactDOM from "react-dom";
import App from "./components/App";
import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3B82F6",
    },
    secondary: {
      main: "#10B981",
    },
  },
});


Office.onReady(() => {
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>,
    document.getElementById("container")
  );
});