const DarkModeButton = () => {
  return (
    <button
      id="theme-toggle"
      class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      type="button"
      aria-pressed="false"
    >
      <span class="h-2 w-2 rounded-full bg-slate-400 dark:bg-emerald-400"></span>
      Dark mode
    </button>
  )
}

export default DarkModeButton
