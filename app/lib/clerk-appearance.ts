/**
 * Light / white Clerk UI — avoids following system dark mode for auth surfaces.
 * @see https://clerk.com/docs/guides/customizing-clerk/appearance-prop/overview
 */
export const opencostClerkAppearance = {
  variables: {
    colorPrimary: "#2d7d64",
    colorPrimaryForeground: "#ffffff",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInput: "#ffffff",
    colorText: "#161616",
    colorTextSecondary: "#525252",
    colorTextOnPrimaryBackground: "#ffffff",
    colorNeutral: "#e0e0e0",
    colorShimmer: "#f4f4f4",
    colorSuccess: "#198038",
    colorWarning: "#f1c21b",
    colorDanger: "#da1e28",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: { width: "100%", colorScheme: "light" as const },
    card: {
      backgroundColor: "#ffffff",
      boxShadow:
        "0 1px 2px rgba(22, 40, 33, 0.06), 0 12px 40px -12px rgba(22, 40, 33, 0.1)",
    },
    headerTitle: { color: "#161616" },
    headerSubtitle: { color: "#525252" },
    socialButtonsBlockButton: {
      borderColor: "#c6d1cc",
      backgroundColor: "#ffffff",
      color: "#161616",
    },
    socialButtonsBlockButtonText: { color: "#161616" },
    dividerLine: { backgroundColor: "#e0e7e4" },
    dividerText: { color: "#525252" },
    formFieldLabel: { color: "#161616" },
    formFieldInput: {
      backgroundColor: "#ffffff",
      borderColor: "#c6d1cc",
      color: "#161616",
    },
    formFieldInputShowPasswordButton: { color: "#525252" },
    formButtonPrimary: {
      backgroundColor: "#2d7d64",
      color: "#ffffff",
    },
    footer: { background: "transparent" },
    footerActionLink: { color: "#2d7d64" },
    identityPreviewText: { color: "#161616" },
    identityPreviewEditButton: { color: "#2d7d64" },
    formResendCodeLink: { color: "#2d7d64" },
    alternativeMethodsBlockButton: {
      borderColor: "#c6d1cc",
      backgroundColor: "#ffffff",
      color: "#161616",
    },
    otpCodeFieldInput: {
      borderColor: "#c6d1cc",
      backgroundColor: "#ffffff",
      color: "#161616",
    },
  },
  layout: {
    logoImageUrl: "/logo.png",
    logoPlacement: "inside" as const,
  },
};
