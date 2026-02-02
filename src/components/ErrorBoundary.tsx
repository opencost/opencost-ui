import { Component, ErrorInfo, ReactNode } from "react";
import { Tile, Button } from "@carbon/react";
import { Renew } from "@carbon/icons-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Tile>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem",
              textAlign: "center",
              minHeight: "300px",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "var(--cds-text-primary)",
                marginBottom: "1rem",
              }}
            >
              Something went wrong
            </h3>
            <p
              style={{
                color: "var(--cds-text-secondary)",
                marginBottom: "1.5rem",
                maxWidth: "400px",
              }}
            >
              An unexpected error occurred while loading this page. Please try refreshing.
            </p>
            {this.state.error && (
              <p
                style={{
                  color: "var(--cds-text-helper)",
                  fontSize: "0.875rem",
                  marginBottom: "1.5rem",
                  fontFamily: "monospace",
                  backgroundColor: "var(--cds-layer-01)",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                }}
              >
                {this.state.error.message}
              </p>
            )}
            <Button
              kind="primary"
              size="md"
              renderIcon={() => <Renew size={20} />}
              onClick={this.handleRetry}
            >
              Refresh Page
            </Button>
          </div>
        </Tile>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
