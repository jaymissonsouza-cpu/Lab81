"use client";

import { useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { formatBytes } from "@/lib/format";

export function Dropzone({
  id,
  title,
  subtitle,
  formats,
  accept,
  icon,
  files,
  onAdd,
  onRemove,
}: {
  id: string;
  title: string;
  subtitle: string;
  formats: string;
  accept?: string;
  icon: IconName;
  files: File[];
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files);
        }}
        className={`relative rounded-lg border border-dashed px-6 py-9 text-center transition-colors focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/30 ${
          over ? "border-orange bg-orange/[0.06]" : "border-titanium/40 hover:border-titanium"
        }`}
      >
        <Icon name={icon} size={34} className={`mx-auto ${over ? "text-orange" : "text-offwhite"}`} strokeWidth={1.25} />
        <p className="mt-3 font-display text-lg font-semibold">{title}</p>
        <p className="mt-1 text-sm text-titanium">{subtitle}</p>
        <p className="mt-3 text-xs text-titanium-600">{formats}</p>
        <label htmlFor={id} className="absolute inset-0 cursor-pointer rounded-lg">
          <span className="sr-only">
            {title}: selecionar arquivos ({formats})
          </span>
        </label>
        {/* Sem "accept" para arquivos 3D: no iOS/Android extensões como .stl ficariam bloqueadas no seletor. A validação é feita no envio. */}
        <input
          ref={input}
          id={id}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) onAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label={`${title}: arquivos selecionados`}>
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}`} className="flex items-center gap-3 rounded-md border border-line bg-carbon-900 px-3 py-2.5 text-sm">
              <Icon name="file" size={18} className="shrink-0 text-orange" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="shrink-0 text-titanium-600">{formatBytes(f.size)}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-titanium hover:bg-red-500/10 hover:text-red-300"
                aria-label={`Remover ${f.name}`}
              >
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
