import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Store, defaultDarkTheme, defaultLightTheme, localStorageStore } from "react-admin";
import { prefixer } from "stylis";

const RTL_LOCALES = new Set(["fa", "ar", "he"]);

export const appStore: Store = localStorageStore();

const isRtlLocale = (locale: string) => RTL_LOCALES.has(locale);

type LocaleDirectionProps = {
  children: (props: {
    lightTheme: typeof defaultLightTheme;
    darkTheme: typeof defaultDarkTheme;
    store: Store;
  }) => ReactNode;
  defaultLocale?: string;
};

/**
 * Syncs document direction, Emotion cache, and MUI theme direction with the active locale.
 * React-admin only switches translations; RTL must be applied separately for languages like Farsi.
 */
export const LocaleDirection = ({ children, defaultLocale = "fa" }: LocaleDirectionProps) => {
  const [locale, setLocale] = useState(() => appStore.getItem<string>("locale", defaultLocale) ?? defaultLocale);
  const isRtl = isRtlLocale(locale);

  useEffect(() => appStore.subscribe("locale", next => setLocale(next ?? defaultLocale)), [defaultLocale]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
  }, [isRtl]);

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
      ...defaultLightTheme,
      direction: isRtl ? ("rtl" as const) : ("ltr" as const),
    }),
    [isRtl]
  );

  const darkTheme = useMemo(
    () => ({
      ...defaultDarkTheme,
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
