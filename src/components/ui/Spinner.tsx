export function FullPageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-light dark:bg-surface-dark">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-ink-500">載入中...</p>
      </div>
    </div>
  );
}
