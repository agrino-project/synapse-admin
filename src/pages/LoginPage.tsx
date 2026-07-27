import { useState, useEffect } from "react";

import LockIcon from "@mui/icons-material/Lock";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Form,
  FormDataConsumer,
  Notification,
  required,
  useLogin,
  useNotify,
  useLocaleState,
  useTranslate,
  PasswordInput,
  TextInput,
  useLocales,
} from "react-admin";
import { useFormContext } from "react-hook-form";

import { useAppContext } from "../AppContext";
import {
  getServerVersion,
  getSupportedFeatures,
  getSupportedLoginFlows,
  getWellKnownUrl,
  isValidBaseUrl,
  splitMxid,
} from "../synapse/synapse";
import storage from "../storage";
import { agrinoColors } from "../themes/agrino";

const FormBox = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";

  return {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
    backgroundColor: isDark ? agrinoColors.dark.canvas : agrinoColors.brandBg,
    backgroundImage: isDark
      ? `radial-gradient(ellipse at 50% 0%, rgba(74, 158, 71, 0.16), transparent 55%)`
      : `radial-gradient(ellipse at 50% 0%, rgba(50, 100, 48, 0.1), transparent 55%)`,

    [`& .card`]: {
      width: "100%",
      maxWidth: "26rem",
      borderRadius: 16,
      padding: theme.spacing(1, 0.5, 0.5),
      backgroundColor: isDark ? agrinoColors.dark.surface : agrinoColors.surface,
      border: `1px solid ${isDark ? agrinoColors.dark.formBorder : agrinoColors.formBorder}`,
      boxShadow: isDark ? "0 16px 40px rgba(0, 0, 0, 0.35)" : "0 16px 40px rgba(50, 100, 48, 0.1)",
    },
    [`& .avatar`]: {
      marginTop: theme.spacing(2),
      display: "flex",
      justifyContent: "center",
    },
    [`& .icon`]: {
      width: 56,
      height: 56,
      backgroundColor: agrinoColors.primary,
      color: "#fff",
    },
    [`& .hint`]: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      display: "flex",
      justifyContent: "center",
      textAlign: "center",
      paddingInline: theme.spacing(2),
      color: isDark ? agrinoColors.dark.textPrimary : agrinoColors.textPrimary,
      fontWeight: 600,
      fontSize: "1.05rem",
      lineHeight: 1.6,
    },
    [`& .form`]: {
      padding: theme.spacing(1.5, 2.5, 2.5),
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(2),
    },
    [`& .select`]: {
      marginBottom: 0,
      borderRadius: 12,
      backgroundColor: isDark ? agrinoColors.dark.formBg : agrinoColors.formBg,
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: isDark ? agrinoColors.dark.formBorder : agrinoColors.formBorder,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: agrinoColors.primaryLight,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: agrinoColors.primary,
        borderWidth: 1,
      },
    },
    [`& .field`]: {
      margin: 0,
      "& .MuiFormControl-root": {
        margin: 0,
      },
      "& .MuiFormHelperText-root": {
        marginTop: 4,
        marginInlineStart: 0,
        minHeight: 0,
        lineHeight: 1.2,
      },
      "& .MuiFormHelperText-root:empty": {
        display: "none",
      },
      "& .MuiFilledInput-root, & .MuiOutlinedInput-root": {
        borderRadius: 12,
        backgroundColor: isDark ? agrinoColors.dark.formBg : agrinoColors.formBg,
        "&:before, &:after": {
          display: "none",
        },
        "&:hover": {
          backgroundColor: isDark ? agrinoColors.dark.formBg : agrinoColors.formBg,
        },
        "&.Mui-focused": {
          backgroundColor: isDark ? agrinoColors.dark.formBg : agrinoColors.formBg,
          boxShadow: `0 0 0 1px ${agrinoColors.primary}`,
        },
        "&.Mui-error": {
          boxShadow: `0 0 0 1px ${isDark ? agrinoColors.dark.error : agrinoColors.error}`,
        },
      },
      "& .MuiInputLabel-root": {
        color: isDark ? agrinoColors.dark.textSecondary : agrinoColors.textSecondary,
      },
      "& .MuiInputLabel-root.Mui-focused": {
        color: agrinoColors.primaryLight,
      },
      "& .MuiInputLabel-root.Mui-error": {
        color: isDark ? agrinoColors.dark.error : agrinoColors.error,
      },
    },
    [`& .actions`]: {
      padding: theme.spacing(1, 0, 0),
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(1.5),
    },
    [`& .serverVersion, & .matrixVersions`]: {
      color: isDark ? agrinoColors.dark.textSecondary : agrinoColors.textSecondary,
      fontSize: "0.8rem",
      marginTop: theme.spacing(0.5),
    },
  };
});

const LoginPage = () => {
  const login = useLogin();
  const notify = useNotify();
  const { restrictBaseUrl } = useAppContext();
  const allowSingleBaseUrl = typeof restrictBaseUrl === "string";
  const allowMultipleBaseUrls = Array.isArray(restrictBaseUrl);
  const allowAnyBaseUrl = !(allowSingleBaseUrl || allowMultipleBaseUrls);
  const [loading, setLoading] = useState(false);
  const [supportPassAuth, setSupportPassAuth] = useState(true);
  const [locale, setLocale] = useLocaleState();
  const locales = useLocales();
  const translate = useTranslate();
  const base_url = allowSingleBaseUrl ? restrictBaseUrl : storage.getItem("base_url");
  const [ssoBaseUrl, setSSOBaseUrl] = useState("");

  useEffect(() => {
    const loginToken = /[?&]loginToken=([a-zA-Z0-9_-]+)/.exec(window.location.href);

    if (!loginToken) {
      return;
    }

    const ssoToken = loginToken[1];
    window.history.replaceState({}, "", window.location.href.replace(loginToken[0], "#").split("#")[0]);

    const baseUrl = storage.getItem("sso_base_url");
    storage.removeItem("sso_base_url");

    if (!baseUrl) {
      return;
    }

    login({
      base_url: baseUrl,
      username: null,
      password: null,
      loginToken: ssoToken,
    }).catch(error => {
      alert(
        typeof error === "string"
          ? error
          : typeof error === "undefined" || !error.message
            ? "ra.auth.sign_in_error"
            : error.message
      );
    });
  }, [login]);

  const validateBaseUrl = value => {
    if (!value.match(/^(http|https):\/\//)) {
      return translate("synapseadmin.auth.protocol_error");
    } else if (!value.match(/^(http|https):\/\/[a-zA-Z0-9\-.]+(:\d{1,5})?[^?&\s]*$/)) {
      return translate("synapseadmin.auth.url_error");
    } else {
      return undefined;
    }
  };

  const handleSubmit = auth => {
    setLoading(true);
    const credentials = allowSingleBaseUrl ? { ...auth, base_url: restrictBaseUrl } : auth;
    login(credentials).catch(error => {
      setLoading(false);
      notify(
        typeof error === "string"
          ? error
          : typeof error === "undefined" || !error.message
            ? "ra.auth.sign_in_error"
            : error.message,
        { type: "warning" }
      );
    });
  };

  const handleSSO = () => {
    const ssoUrl = allowSingleBaseUrl ? restrictBaseUrl : ssoBaseUrl;
    storage.setItem("sso_base_url", ssoUrl);
    const ssoFullUrl = `${ssoUrl}/_matrix/client/r0/login/sso/redirect?redirectUrl=${encodeURIComponent(
      window.location.href
    )}`;
    window.location.href = ssoFullUrl;
  };

  const UserData = ({ formData }) => {
    const form = useFormContext();
    const [serverVersion, setServerVersion] = useState("");
    const [matrixVersions, setMatrixVersions] = useState("");

    const handleUsernameChange = () => {
      if (formData.base_url || allowSingleBaseUrl) return;
      const domain = splitMxid(formData.username)?.domain;
      if (domain) {
        getWellKnownUrl(domain).then(url => {
          if (allowAnyBaseUrl || (allowMultipleBaseUrls && restrictBaseUrl.includes(url)))
            form?.setValue("base_url", url);
        });
      }
    };

    useEffect(() => {
      if (formData.base_url === "" && allowMultipleBaseUrls) {
        form?.setValue("base_url", restrictBaseUrl[0]);
      }

      const activeBaseUrl = allowSingleBaseUrl ? restrictBaseUrl : formData.base_url;
      if (!isValidBaseUrl(activeBaseUrl)) return;

      getServerVersion(activeBaseUrl)
        .then(version => setServerVersion(`${translate("synapseadmin.auth.server_version")} ${version}`))
        .catch(() => setServerVersion(""));

      getSupportedFeatures(activeBaseUrl)
        .then(features =>
          setMatrixVersions(`${translate("synapseadmin.auth.supports_specs")} ${features.versions.join(", ")}`)
        )
        .catch(() => setMatrixVersions(""));

      getSupportedLoginFlows(activeBaseUrl)
        .then(loginFlows => {
          const supportPass = loginFlows.find(f => f.type === "m.login.password") !== undefined;
          const supportSSO = loginFlows.find(f => f.type === "m.login.sso") !== undefined;
          setSupportPassAuth(supportPass);
          setSSOBaseUrl(supportSSO ? activeBaseUrl : "");
        })
        .catch(() => setSSOBaseUrl(""));
    }, [formData.base_url, form]);

    return (
      <>
        <Box className="field">
          <TextInput
            autoFocus
            source="username"
            label="ra.auth.username"
            autoComplete="username"
            disabled={loading || !supportPassAuth}
            onBlur={handleUsernameChange}
            resettable
            validate={required()}
            variant="filled"
            margin="none"
            helperText={false}
          />
        </Box>
        <Box className="field">
          <PasswordInput
            source="password"
            label="ra.auth.password"
            type="password"
            autoComplete="current-password"
            disabled={loading || !supportPassAuth}
            resettable
            validate={required()}
            variant="filled"
            margin="none"
            helperText={false}
          />
        </Box>
        {!allowSingleBaseUrl && (
          <Box className="field">
            <TextInput
              source="base_url"
              label="synapseadmin.auth.base_url"
              select={allowMultipleBaseUrls}
              autoComplete="url"
              disabled={loading}
              resettable={allowAnyBaseUrl}
              validate={[required(), validateBaseUrl]}
              variant="filled"
              margin="none"
              helperText={false}
            >
              {allowMultipleBaseUrls &&
                restrictBaseUrl.map(url => (
                  <MenuItem key={url} value={url}>
                    {url}
                  </MenuItem>
                ))}
            </TextInput>
          </Box>
        )}
        {serverVersion && <Typography className="serverVersion">{serverVersion}</Typography>}
        {matrixVersions && <Typography className="matrixVersions">{matrixVersions}</Typography>}
      </>
    );
  };

  return (
    <Form defaultValues={{ base_url: base_url }} onSubmit={handleSubmit} mode="onSubmit" reValidateMode="onSubmit">
      <FormBox>
        <Card className="card" elevation={0}>
          <Box className="avatar">
            {loading ? (
              <CircularProgress size={28} thickness={3} sx={{ color: agrinoColors.primary }} />
            ) : (
              <Avatar className="icon">
                <LockIcon />
              </Avatar>
            )}
          </Box>
          <Box className="hint">{translate("synapseadmin.auth.welcome")}</Box>
          <Box className="form">
            <Select
              value={locale}
              onChange={e => setLocale(e.target.value)}
              fullWidth
              disabled={loading}
              className="select"
              variant="outlined"
              size="small"
            >
              {locales.map(l => (
                <MenuItem key={l.locale} value={l.locale}>
                  {l.name}
                </MenuItem>
              ))}
            </Select>
            <FormDataConsumer>{formDataProps => <UserData {...formDataProps} />}</FormDataConsumer>
            <CardActions className="actions" disableSpacing>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                disabled={loading || !supportPassAuth}
                fullWidth
                size="large"
                sx={{ py: 1.25 }}
              >
                {translate("ra.auth.sign_in")}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleSSO}
                disabled={loading || ssoBaseUrl === ""}
                fullWidth
                size="large"
                sx={{ py: 1.1 }}
              >
                {translate("synapseadmin.auth.sso_sign_in")}
              </Button>
            </CardActions>
          </Box>
        </Card>
      </FormBox>
      <Notification />
    </Form>
  );
};

export default LoginPage;
