import React from "react";

import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
import { createRoot } from "react-dom/client";

import { Bootstrap } from "./bootstrap";
import storage from "./storage";

// Anonymous visitors must enter through the login route. Letting them land on any
// other route makes react-admin's `requireAuth` mount <LogoutOnMount>, whose
// logout() clears the react-query cache that decided to render it. Because our
// logout resolves without a network call, that cycle repeats faster than the
// redirect settles and React aborts the render, leaving a blank page.
const ANONYMOUS_ROUTES = ["/login", "/auth-callback"];
const currentRoute = window.location.hash.replace(/^#/, "");

if (
  typeof storage.getItem("access_token") !== "string" &&
  !ANONYMOUS_ROUTES.some(route => currentRoute.startsWith(route))
) {
  window.location.hash = "#/login";
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>
);
