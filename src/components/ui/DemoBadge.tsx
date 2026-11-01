/** Selo que identifica conteúdo/imagem demonstrativa, a ser substituída por material real. */
export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border border-titanium/30 bg-carbon/80 px-2 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-titanium backdrop-blur ${className}`}
      title="Imagem e conteúdo ilustrativos, que serão substituídos por trabalhos reais da LAB81"
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-titanium" />
      Demonstrativo
    </span>
  );
}
