import type { ReactNode } from "react";

interface WidgetCardProps {
  children: ReactNode;
  className?: string;
  /** Optional: renders the full header section with title / description / actions */
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  /** When true the card body has no padding (useful when a chart needs to bleed to edges) */
  noPadding?: boolean;
}

/**
 * V2 shared panel surface — replaces ad-hoc `<Tile className="p-4">` usage.
 * Derives all colours from Carbon --cds-* tokens so light/dark mode is automatic.
 */
export default function WidgetCard({
  children,
  className = "",
  title,
  description,
  headerActions,
  noPadding = false,
}: WidgetCardProps) {
  const hasHeader = title || description || headerActions;

  return (
    <div className={`v2-widget-card ${className}`}>
      {hasHeader && (
        <div className="v2-widget-card-header">
          <div className="min-w-0 flex-1">
            {title && <p className="v2-widget-title">{title}</p>}
            {description && (
              <p
                className="m-0 mt-0.5 text-xs"
                style={{ color: "var(--cds-text-secondary)" }}
              >
                {description}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex-shrink-0 flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className={noPadding ? "" : "v2-widget-card-body"}>
        {children}
      </div>
    </div>
  );
}
