import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Store, localStorageStore, RaThemeOptions } from "react-admin";
import { prefixer } from "stylis";

import { agrinoDarkTheme, agrinoLightTheme } from "../themes/agrino";

const RTL_LOCALES = new Set(["fa", "ar", "he"]);

export const appStore: Store = localStorageStore();

const isRtlLocale = (locale: string) => RTL_LOCALES.has(locale);

type LocaleDirectionProps = {
  children: (props: {
    lightTheme: RaThemeOptions;
    darkTheme: RaThemeOptions;
    store: Store;
  }) => ReactNode;
  defaultLocale?: string;
};

/**
 * Syncs document direction, Emotion cache, and MUI theme direction with the active locale.
 * React-admin only switches translations; RTL must be applied separately for languages like Farsi.
 */
export const LocaleDirection = ({ children, defaultLocale = "fa" }: LocaleDirectionProps) => {
  const [locale, setLocale] = useState(defaultLocale);
  const isRtl = isRtlLocale(locale);

  useEffect(() => {
    appStore.setItem("locale", defaultLocale);
    setLocale(defaultLocale);
  }, [defaultLocale]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale);
  }, [isRtl, locale]);

  const cache = useMemo(
    () =>
      createCache({
        key: isRtl ? "muirtl" : "muiltr",
        stylisPlugins: isRtl ? [prefixer, rtlPlugin] : [prefixer],
      }),
    [isRtl]
  );

  const lightTheme = useMemo(
    () => ({
      ...agrinoLightTheme,
      direction: isRtl ? ("rtl" as const) : ("ltr" as const),
    }),
    [isRtl]
  );

  const darkTheme = useMemo(
    () => ({
      ...agrinoDarkTheme,
      direction: isRtl ? ("rtl" as const) : ("ltr" as const),
    }),
    [isRtl]
  );

  return (
    <CacheProvider value={cache}>
      {children({ lightTheme, darkTheme, store: appStore })}
    </CacheProvider>
  );
};
