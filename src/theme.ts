import { createTheme } from "@mui/material";


export const theme = createTheme({
  palette: {
    error: {
      main: "#d32f2f",
    },
    primary: {
      main: "#0088CC",
    },
    text: {
      primary: "rgb(114, 138, 150)",
      secondary: "rgb(22, 28, 40)",
    },
  },

  typography: {
    allVariants: {
      color: "rgb(114, 138, 150)",
    },
    h1: {
      fontSize: 44,
      fontWeight: 800,
      color: "rgb(22, 28, 40)",
    },
    h2: {
      fontSize: 20,
      fontWeight: 800,
      color: "rgb(22, 28, 40)",
    },
    h4: {
      fontSize: 20,
      fontWeight: 800,
      color: "rgb(22, 28, 40)",
    },
    fontFamily: "mulish",
  },
});