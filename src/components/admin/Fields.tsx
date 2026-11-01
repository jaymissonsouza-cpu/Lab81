import Image from "next/image";
import type { ImageRef } from "@/lib/repos";

export function Field({
  label,
  name,
  defaultValue,
  hint,
  type = "text",
  required,
  placeholder,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  hint?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
      </label>
      <input id={`f-${name}`} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} maxLength={maxLength} className="field" />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, name, defaultValue, hint, rows = 4, mono }: { label: string; name: string; defaultValue?: string; hint?: string; rows?: number; mono?: boolean }) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
      </label>
      <textarea id={`f-${name}`} name={name} defaultValue={defaultValue ?? ""} rows={rows} className={`field ${mono ? "font-mono text-sm" : ""}`} />
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
      </label>
      <select id={`f-${name}`} name={name} defaultValue={defaultValue} className="field">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Check({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 accent-orange" />
      <span>
        <span className="block text-sm text-offwhite">{label}</span>
        {hint && <span className="block text-xs text-titanium-600">{hint}</span>}
      </span>
    </label>
  );
}

export function Section({ title, children, description }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-carbon-800/50 p-5 md:p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-titanium">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

/** Gerenciador de imagens sem JavaScript: alt editável, remoção, escolha de capa e upload de novas. */
export function ImageManager({ images }: { images: ImageRef[] }) {
  return (
    <Section title="Imagens" description="A imagem marcada como capa aparece nos cards e no topo da página. Todas precisam de texto alternativo (alt).">
      {images.length > 0 && (
        <ul className="space-y-3">
          {images.map((img, i) => (
            <li key={img.src} className="grid gap-4 rounded-md border border-line p-3 sm:grid-cols-[96px_1fr]">
              <div className="relative h-24 w-24 overflow-hidden rounded bg-carbon-900">
                <Image src={img.src} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <div className="space-y-3">
                <input type="hidden" name="img_src" value={img.src} />
                <div>
                  <label className="field-label" htmlFor={`alt-${i}`}>
                    Texto alternativo
                  </label>
                  <input id={`alt-${i}`} name="img_alt" defaultValue={img.alt} className="field" />
                </div>
                <div className="flex flex-wrap gap-6 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="img_cover" value={img.src} defaultChecked={i === 0} className="accent-orange" /> Capa
                  </label>
                  <label className="flex items-center gap-2 text-red-300">
                    <input type="checkbox" name="img_remove" value={img.src} className="accent-red-500" /> Remover
                  </label>
                  <span className="truncate text-xs text-titanium-600">{img.src.startsWith("/demo/") ? "Imagem demonstrativa" : img.src}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-4 rounded-md border border-dashed border-line-strong p-4 sm:grid-cols-2">
        <div>
          <label htmlFor="new_images" className="field-label">
            Adicionar imagens
          </label>
          <input id="new_images" name="new_images" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="block w-full text-sm text-titanium file:mr-3 file:rounded file:border-0 file:bg-carbon-600 file:px-3 file:py-2 file:text-offwhite" />
          <p className="field-hint">JPG, PNG, WEBP ou AVIF até 20 MB. Convertidas automaticamente para WebP.</p>
        </div>
        <div>
          <label htmlFor="new_alt" className="field-label">
            Texto alternativo das novas imagens
          </label>
          <input id="new_alt" name="new_alt" className="field" placeholder="Ex.: Luminária laranja impressa em 3D sobre mesa de pedra" />
        </div>
      </div>
    </Section>
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "orange" | "green" | "red" }) {
  const cls = {
    neutral: "border-line-strong text-titanium",
    orange: "border-orange/50 bg-orange/10 text-orange",
    green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    red: "border-red-500/40 bg-red-500/10 text-red-300",
  }[tone];
  return <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}
