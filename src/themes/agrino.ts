import { deepmerge } from "@mui/utils";
import { defaultDarkTheme, defaultLightTheme, RaThemeOptions } from "react-admin";

/** Agrino brand tokens mirrored from the Element Web fork (`d:/projects/react/web`). */
export const agrinoColors = {
  primary: "#326430",
  primaryHover: "#2a5428",
  primaryPressed: "#1e3e1c",
  primaryLight: "#4a9e47",
  accentSoft: "#c8e6c5",
  brandBg: "#f3fcf2",
  hoverBg: "#e8f5e6",
  selectedBg: "#d4edda",
  submit: "#255625",
  surface: "#ffffff",
  surfaceMuted: "#f6f7f9",
  formBg: "#f9fafb",
  formBorder: "#E5E7EB",
  textPrimary: "#1b1d22",
  textSecondary: "#656d77",
  error: "#d51928",
  dark: {
    canvas: "#101317",
    surface: "#181b21",
    surfaceMuted: "#20242b",
    brandBg: "#0e1c0d",
    hoverBg: "#284025",
    selectedBg: "#1c2e1a",
    accentSoft: "#1c2e1a",
    formBg: "#111827",
    formBorder: "#374151",
    textPrimary: "#ebeef2",
    textSecondary: "#808994",
    error: "#fd3e3c",
  },
} as const;

const fontFamily = '"Vazirmatn", "Roboto", "Helvetica", "Arial", sans-serif';

const sharedComponents: RaThemeOptions["components"] = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        fontFamily,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 24,
        textTransform: "none",
        fontWeight: 600,
      },
      containedPrimary: {
        backgroundColor: agrinoColors.primary,
        "&:hover": {
          backgroundColor: agrinoColors.primaryHover,
        },
        "&:active": {
          backgroundColor: agrinoColors.primaryPressed,
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      colorSecondary: {
        backgroundColor: agrinoColors.primary,
        color: "#ffffff",
      },
    },
  },
  MuiFilledInput: {
    styleOverrides: {
      root: {
        backgroundColor: agrinoColors.formBg,
        borderRadius: 12,
        overflow: "hidden",
        "&:before, &:after": {
          display: "none",
        },
        "&:hover": {
          backgroundColor: agrinoColors.formBg,
        },
        "&.Mui-focused": {
          backgroundColor: agrinoColors.surface,
          boxShadow: `inset 0 0 0 1px ${agrinoColors.primary}`,
        },
      },
    },
  },
};
export const agrinoLightTheme: RaThemeOptions = deepmerge(defaultLightTheme, {
  palette: {
    mode: "light",
    primary: {
      main: agrinoColors.primary,
      light: agrinoColors.primaryLight,
      dark: agrinoColors.primaryHover,
      contrastText: "#ffffff",
    },
    secondary: {
      main: agrinoColors.primary,
      light: agrinoColors.primaryLight,
      dark: agrinoColors.primaryHover,
      contrastText: "#ffffff",
    },
    error: {
      main: agrinoColors.error,
    },
    background: {
      default: agrinoColors.brandBg,
      paper: agrinoColors.surface,
    },
    text: {
      primary: agrinoColors.textPrimary,
      secondary: agrinoColors.textSecondary,
    },
  },
  typography: {
    fontFamily,
  },
  shape: {
    borderRadius: 8,
  },
  sidebar: {
    width: 240,
    closedWidth: 50,
  },
  components: {
    ...sharedComponents,
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          "&.RaMenuItemLink-active": {
            backgroundColor: agrinoColors.selectedBg,
            borderInlineStart: `3px solid ${agrinoColors.primary}`,
          },
          "&:hover": {
            backgroundColor: agrinoColors.hoverBg,
          },
        },
      },
    },
    RaToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: agrinoColors.surfaceMuted,
        },
      },
    },
  },
});

export const agrinoDarkTheme: RaThemeOptions = deepmerge(defaultDarkTheme, {
  palette: {
    mode: "dark",
    primary: {
      main: agrinoColors.primaryLight,
      light: agrinoColors.accentSoft,
      dark: agrinoColors.primary,
      contrastText: "#ffffff",
    },
    secondary: {
      main: agrinoColors.primaryLight,
      light: agrinoColors.accentSoft,
      dark: agrinoColors.primary,
      contrastText: "#ffffff",
    },
    error: {
      main: agrinoColors.dark.error,
    },
    background: {
      default: agrinoColors.dark.canvas,
      paper: agrinoColors.dark.surface,
    },
    text: {
      primary: agrinoColors.dark.textPrimary,
      secondary: agrinoColors.dark.textSecondary,
    },
  },
  typography: {
    fontFamily,
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          textTransform: "none",
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: agrinoColors.primary,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: agrinoColors.primaryHover,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorSecondary: {
          backgroundColor: agrinoColors.dark.brandBg,
          color: agrinoColors.dark.textPrimary,
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: agrinoColors.dark.surfaceMuted,
          borderRadius: 12,
          overflow: "hidden",
          "&:before, &:after": {
            display: "none",
          },
          "&:hover": {
            backgroundColor: agrinoColors.dark.surfaceMuted,
          },
          "&.Mui-focused": {
            backgroundColor: agrinoColors.dark.surfaceMuted,
            boxShadow: `inset 0 0 0 1px ${agrinoColors.primaryLight}`,
          },
        },
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          "&.RaMenuItemLink-active": {
            backgroundColor: agrinoColors.dark.selectedBg,
            borderInlineStart: `3px solid ${agrinoColors.primaryLight}`,
          },
          "&:hover": {
            backgroundColor: agrinoColors.dark.hoverBg,
          },
        },
      },
    },
    RaToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: agrinoColors.dark.surfaceMuted,
        },
      },
    },
  },
});
