
export type AppBootLoaderProps = {
  message?: string;
  compact?: boolean;
};

export function AppBootLoader({
  message = "Loading…",
  compact = false,
}: AppBootLoaderProps) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center justify-center gap-3 py-6"
          : "flex min-h-[min(60vh,560px)] flex-col items-center justify-center gap-4 bg-[#f4f4f4] px-4"
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-10 w-10 shrink-0 animate-spin rounded-full border-2 border-[#c6c6c6] border-t-[#0f62fe]"
        aria-hidden
      />
      <span className="max-w-[20rem] text-center text-sm font-medium text-[#393939]">
        {message}
      </span>
    </div>
  );
}
