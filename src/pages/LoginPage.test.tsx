import userEvent from "@testing-library/user-event";
import polyglotI18nProvider from "ra-i18n-polyglot";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminContext, AuthProvider } from "react-admin";

import LoginPage from "./LoginPage";
import { AppContext } from "../AppContext";
import englishMessages from "../i18n/en";
import storage from "../storage";

const {
  mockedNotify,
  mockedGetSupportedLoginFlows,
  mockedGetWellKnownUrl,
  mockedIsValidBaseUrl,
  mockedSplitMxid,
} = vi.hoisted(() => ({
  mockedNotify: vi.fn(),
  mockedGetSupportedLoginFlows: vi.fn(),
  mockedGetWellKnownUrl: vi.fn(),
  mockedIsValidBaseUrl: vi.fn(),
  mockedSplitMxid: vi.fn(),
}));

vi.mock("react-admin", async importOriginal => {
  const actual = await importOriginal<typeof import("react-admin")>();

  return {
    ...actual,
    useNotify: () => mockedNotify,
  };
});

vi.mock("../synapse/synapse", () => ({
  getSupportedLoginFlows: mockedGetSupportedLoginFlows,
  getWellKnownUrl: mockedGetWellKnownUrl,
  isValidBaseUrl: mockedIsValidBaseUrl,
  splitMxid: mockedSplitMxid,
}));

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en", [{ locale: "en", name: "English" }]);

const authProvider: AuthProvider = {
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  checkError: vi.fn(),
  getPermissions: vi.fn(),
};

const renderLoginPage = (restrictBaseUrl?: string | string[]) =>
  render(
    <AppContext.Provider value={{ restrictBaseUrl }}>
      <AdminContext authProvider={authProvider} i18nProvider={i18nProvider}>
        <LoginPage />
      </AdminContext>
    </AppContext.Provider>
  );

describe("LoginForm", () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
    globalThis.alert = vi.fn();
    window.history.replaceState({}, "", "/");
    vi.mocked(authProvider.login).mockResolvedValue(undefined);
    vi.mocked(authProvider.logout).mockResolvedValue(undefined);
    vi.mocked(authProvider.checkAuth).mockResolvedValue(undefined);
    vi.mocked(authProvider.checkError).mockResolvedValue(undefined);
    vi.mocked(authProvider.getPermissions!).mockResolvedValue(undefined);
    mockedGetSupportedLoginFlows.mockResolvedValue([{ type: "m.login.password" }]);
    mockedGetWellKnownUrl.mockResolvedValue("https://matrix.example.com");
    mockedIsValidBaseUrl.mockImplementation(
      (value?: string) => typeof value === "string" && /^https?:\/\/[a-zA-Z0-9\-.]+(:\d+)?/.test(value)
    );
    mockedSplitMxid.mockImplementation((value?: string) => {
      if (!value?.includes(":")) {
        return undefined;
      }

      return { domain: value.split(":")[1] };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with no restriction to homeserver", () => {
    renderLoginPage();

    screen.getByText(englishMessages.synapseadmin.auth.welcome);
    screen.getByRole("textbox", { name: englishMessages.ra.auth.username });
    screen.getByText(englishMessages.ra.auth.password);
    const baseUrlInput = screen.getByRole("textbox", {
      name: englishMessages.synapseadmin.auth.base_url,
    });
    expect(baseUrlInput.className.split(" ")).not.toContain("Mui-readOnly");
    screen.getByRole("button", { name: englishMessages.ra.auth.sign_in });
  });

  it("renders with single restricted homeserver", () => {
    renderLoginPage("https://matrix.example.com");

    screen.getByText(englishMessages.synapseadmin.auth.welcome);
    screen.getByRole("textbox", { name: englishMessages.ra.auth.username });
    screen.getByText(englishMessages.ra.auth.password);
    expect(screen.queryByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url })).toBeNull();
    screen.getByRole("button", { name: englishMessages.ra.auth.sign_in });
  });

  it("renders with multiple restricted homeservers", async () => {
    renderLoginPage(["https://matrix.example.com", "https://matrix.example.org"]);

    screen.getByText(englishMessages.synapseadmin.auth.welcome);
    screen.getByRole("textbox", { name: englishMessages.ra.auth.username });
    screen.getByText(englishMessages.ra.auth.password);
    screen.getByRole("combobox", {
      name: englishMessages.synapseadmin.auth.base_url,
    });
    screen.getByRole("button", { name: englishMessages.ra.auth.sign_in });
  });

  it("uses the SSO login token from the callback URL", async () => {
    storage.setItem("sso_base_url", "https://matrix.example.com");
    window.history.replaceState({}, "", "/?loginToken=sso_token");

    renderLoginPage();

    await waitFor(() =>
      expect(authProvider.login).toHaveBeenCalledWith({
        base_url: "https://matrix.example.com",
        username: null,
        password: null,
        loginToken: "sso_token",
      })
    );
    expect(storage.getItem("sso_base_url")).toBeNull();
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("");
  });

  it("ignores SSO callback URLs without a stored base URL", async () => {
    window.history.replaceState({}, "", "/?loginToken=sso_token");

    renderLoginPage();

    await waitFor(() => expect(storage.getItem("sso_base_url")).toBeNull());
    expect(authProvider.login).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("");
  });

  it("loads login flows when a homeserver url is provided", async () => {
    mockedGetSupportedLoginFlows.mockResolvedValue([{ type: "m.login.password" }, { type: "m.login.sso" }]);

    renderLoginPage();

    fireEvent.change(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }), {
      target: { value: "https://matrix.example.com" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }));

    await waitFor(() =>
      expect(mockedGetSupportedLoginFlows).toHaveBeenCalledWith("https://matrix.example.com")
    );
  });

  it("submits credentials and reports login errors via notify", async () => {
    const user = userEvent.setup();
    vi.mocked(authProvider.login).mockRejectedValueOnce(new Error("bad credentials"));

    renderLoginPage();

    await user.type(screen.getByRole("textbox", { name: englishMessages.ra.auth.username }), "admin");
    await user.type(document.querySelector('input[name="password"]') as HTMLInputElement, "secret");
    fireEvent.change(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }), {
      target: { value: "https://matrix.example.com" },
    });
    await user.click(screen.getByRole("button", { name: englishMessages.ra.auth.sign_in }));

    await waitFor(() =>
      expect(authProvider.login).toHaveBeenCalledWith({
        username: "admin",
        password: "secret",
        base_url: "https://matrix.example.com",
      })
    );
    await waitFor(() => expect(mockedNotify).toHaveBeenCalledWith("bad credentials", { type: "warning" }));
  });

  it("keeps password login available when flow lookup fails", async () => {
    mockedGetSupportedLoginFlows.mockRejectedValueOnce(new Error("flows failed"));

    renderLoginPage();

    fireEvent.change(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }), {
      target: { value: "https://matrix.example.com" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: englishMessages.synapseadmin.auth.base_url }));

    await waitFor(() =>
      expect(mockedGetSupportedLoginFlows).toHaveBeenCalledWith("https://matrix.example.com")
    );
    expect(screen.getByRole("button", { name: englishMessages.ra.auth.sign_in }).hasAttribute("disabled")).toBe(false);
  });
});
