"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";
import {
  CONTACT_PREFERENCES,
  DEADLINES,
  MATERIAL_UNKNOWN,
  MODEL_EXTENSIONS,
  PROJECT_TYPES,
  PROJECT_TYPE_LABEL,
  REFERENCE_EXTENSIONS,
  UPLOAD_LIMITS,
  fileExtension,
} from "@/content/quote";
import { Dropzone } from "./Dropzone";

type Data = {
  project_type: string;
  description: string;
  dimensions: string;
  material: string;
  colors: string[];
  colorsText: string;
  quantity: string;
  deadline: string;
  notes: string;
  product_slug: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  contact_preference: string;
  consent: boolean;
};

const STEPS = ["Projeto", "Arquivos", "Detalhes", "Contato", "Resumo"] as const;
const MB = 1024 * 1024;

export type QuoteFormProps = {
  materials: string[];
  colors: string[];
  maxModelMb: number;
  preset?: { productSlug?: string; productName?: string; referenceTitle?: string };
};

export function QuoteForm({ materials, colors, maxModelMb, preset }: QuoteFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(() => ({
    project_type: preset?.productSlug ? "produto" : "",
    description: preset?.productName
      ? `Tenho interesse no produto "${preset.productName}".`
      : preset?.referenceTitle
        ? `Gostaria de um projeto semelhante a "${preset.referenceTitle}".`
        : "",
    dimensions: "",
    material: "",
    colors: [],
    colorsText: "",
    quantity: "1",
    deadline: "",
    notes: "",
    product_slug: preset?.productSlug ?? "",
    name: "",
    company: "",
    email: "",
    phone: "",
    city: "",
    contact_preference: "WhatsApp",
    consent: false,
  }));
  const [models, setModels] = useState<File[]>([]);
  const [refs, setRefs] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [serverError, setServerError] = useState("");
  const started = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    if (!started.current) {
      started.current = true;
      track("quote_start", { project_type: data.project_type || undefined });
    }
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => {
      if (!e[k]) return e;
      const n = { ...e };
      delete n[k];
      return n;
    });
  };

  // Move o foco para o título da etapa (acessibilidade) ao trocar de etapa
  useEffect(() => {
    if (step > 0) headingRef.current?.focus({ preventScroll: false });
  }, [step]);

  const materialOptions = useMemo(() => [...materials, MATERIAL_UNKNOWN], [materials]);

  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!data.project_type) e.project_type = "Selecione o tipo de projeto.";
      if (data.description.trim().length < 10) e.description = "Descreva o projeto com pelo menos 10 caracteres.";
    }
    if (s === 2) {
      const q = Number(data.quantity);
      if (!Number.isInteger(q) || q < 1) e.quantity = "Informe uma quantidade válida (mínimo 1).";
    }
    if (s === 3) {
      if (data.name.trim().length < 2) e.name = "Informe seu nome.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) e.email = "Informe um e-mail válido.";
      if (data.phone && data.phone.replace(/\D/g, "").length < 10) e.phone = "Informe o telefone com DDD.";
      if (data.contact_preference !== "E-mail" && !data.phone) e.phone = "Informe um telefone para contato por " + data.contact_preference + ".";
      if (!data.consent) e.consent = "É necessário autorizar o uso dos dados para enviarmos a proposta.";
    }
    return e;
  }

  function next() {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`q-${first}`)?.focus();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: (document.getElementById("quote-top")?.offsetTop ?? 0) - 90, behavior: "smooth" });
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }
  function goTo(s: number) {
    for (let i = 0; i < s; i++) {
      const e = validate(i);
      if (Object.keys(e).length) {
        setStep(i);
        setErrors(e);
        return;
      }
    }
    setStep(s);
  }

  function addFiles(kind: "model" | "reference", list: FileList | File[]) {
    setFileError("");
    const incoming = Array.from(list);
    const exts: readonly string[] = kind === "model" ? MODEL_EXTENSIONS : REFERENCE_EXTENSIONS;
    const maxSize = (kind === "model" ? maxModelMb : UPLOAD_LIMITS.maxReferenceMb) * MB;
    const maxCount = kind === "model" ? UPLOAD_LIMITS.maxModelFiles : UPLOAD_LIMITS.maxReferenceFiles;
    const current = kind === "model" ? models : refs;
    const ok: File[] = [];
    const problems: string[] = [];
    for (const f of incoming) {
      const ext = fileExtension(f.name);
      if (!exts.includes(ext)) problems.push(`${f.name}: formato não aceito`);
      else if (f.size > maxSize) problems.push(`${f.name}: maior que ${maxSize / MB} MB`);
      else if (current.some((c) => c.name === f.name && c.size === f.size)) continue;
      else ok.push(f);
    }
    const merged = [...current, ...ok].slice(0, maxCount);
    if (current.length + ok.length > maxCount) problems.push(`Limite de ${maxCount} arquivos`);
    const total = [...(kind === "model" ? merged : models), ...(kind === "model" ? refs : merged)].reduce((s, f) => s + f.size, 0);
    if (total > UPLOAD_LIMITS.maxTotalMb * MB) {
      setFileError(`O total de arquivos não pode passar de ${UPLOAD_LIMITS.maxTotalMb} MB.`);
      return;
    }
    if (kind === "model") setModels(merged);
    else setRefs(merged);
    for (const f of ok) track("quote_file_upload", { kind, extension: fileExtension(f.name) });
    if (!started.current) {
      started.current = true;
      track("quote_start");
    }
    if (problems.length) setFileError(problems.join(" · "));
  }

  function collectSource() {
    const out: Record<string, string> = {};
    try {
      const params = new URLSearchParams(window.location.search);
      for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"]) {
        const v = params.get(k) ?? sessionStorage.getItem(`lab81_${k}`);
        if (v) out[k] = v.slice(0, 200);
      }
      const ref = sessionStorage.getItem("lab81_referrer") ?? document.referrer;
      if (ref) out.referrer = ref.slice(0, 300);
      const landing = sessionStorage.getItem("lab81_landing");
      if (landing) out.landing = landing.slice(0, 300);
    } catch {
      /* armazenamento indisponível */
    }
    return out;
  }

  function submit() {
    // Revalida todas as etapas antes do envio
    for (let i = 0; i < 4; i++) {
      const e = validate(i);
      if (Object.keys(e).length) {
        setStep(i);
        setErrors(e);
        return;
      }
    }
    setServerError("");
    setSubmitting(true);
    setProgress(0);

    const colorList = colors.length ? data.colors : data.colorsText.split(",").map((c) => c.trim()).filter(Boolean);
    const payload = {
      project_type: data.project_type,
      description: data.description,
      dimensions: data.dimensions,
      material: data.material,
      colors: colorList,
      quantity: Number(data.quantity),
      deadline: data.deadline,
      notes: data.notes,
      product_slug: data.product_slug,
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      city: data.city,
      contact_preference: data.contact_preference,
      consent: data.consent,
      source: collectSource(),
    };
    const fd = new FormData();
    fd.append("data", JSON.stringify(payload));
    fd.append("website", honeypot.current?.value ?? "");
    models.forEach((f) => fd.append("model", f, f.name));
    refs.forEach((f) => fd.append("reference", f, f.name));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/orcamento");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      const res = (xhr.response ?? {}) as { ok?: boolean; protocol?: string; message?: string; fields?: Record<string, string> };
      if (xhr.status >= 200 && xhr.status < 300 && res.ok && res.protocol) {
        track("quote_submit", { project_type: data.project_type, files: models.length + refs.length });
        router.push(`/orcamento/confirmacao?protocolo=${encodeURIComponent(res.protocol)}`);
        return;
      }
      setSubmitting(false);
      setServerError(res.message || "Não foi possível enviar agora. Tente novamente.");
      if (res.fields) setErrors(res.fields);
    };
    xhr.onerror = () => {
      setSubmitting(false);
      setServerError("Falha de conexão. Verifique sua internet e tente novamente. Seus dados continuam preenchidos.");
    };
    xhr.send(fd);
  }

  const fieldErr = (k: string) =>
    errors[k] ? (
      <p id={`q-${k}-e`} className="mt-1.5 text-sm text-red-400">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `q-${k}-e` : undefined });

  return (
    <div id="quote-top" className="panel overflow-hidden">
      {/* Indicador de etapas */}
      <nav aria-label="Etapas do orçamento" className="border-b border-line px-5 py-4 md:px-8">
        <ol className="flex items-center gap-2">
          {STEPS.map((label, i) => {
            const state = i < step ? "done" : i === step ? "current" : "todo";
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => i < step && goTo(i)}
                  disabled={i > step || submitting}
                  aria-current={state === "current" ? "step" : undefined}
                  className="group flex min-w-0 items-center gap-2 text-left disabled:cursor-default"
                >
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                      state === "current"
                        ? "border-orange bg-orange text-carbon"
                        : state === "done"
                          ? "border-orange text-orange group-hover:bg-orange/10"
                          : "border-line-strong text-titanium-600"
                    }`}
                  >
                    {state === "done" ? <Icon name="check" size={14} /> : i + 1}
                  </span>
                  <span className={`hidden truncate text-sm md:inline ${state === "current" ? "text-offwhite" : "text-titanium-600"}`}>{label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <span aria-hidden="true" className="h-px flex-1 bg-line-strong">
                    <span className={`block h-px bg-orange transition-[width] duration-500 ${i < step ? "w-full" : "w-0"}`} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-sm text-titanium-600 md:hidden">
          Etapa {step + 1} de {STEPS.length}: <span className="text-offwhite">{STEPS[step]}</span>
        </p>
      </nav>

      <form
        className="relative p-5 md:p-8"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < STEPS.length - 1) next();
          else submit();
        }}
      >
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Não preencha <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {/* ── Etapa 1: Projeto ── */}
        {step === 0 && (
          <fieldset className="quote-step">
            <legend className="sr-only">Tipo de projeto</legend>
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold outline-none">
              O que você precisa?
            </h2>
            <div id="q-project_type" role="radiogroup" aria-label="Tipo de projeto" tabIndex={-1} className="mt-6 grid gap-3 outline-none sm:grid-cols-2">
              {PROJECT_TYPES.map((t) => {
                const on = data.project_type === t.value;
                return (
                  <label
                    key={t.value}
                    className={`relative flex cursor-pointer gap-3 rounded-md border p-4 transition-colors ${
                      on ? "border-orange bg-orange/[0.07]" : "border-line-strong hover:border-titanium"
                    }`}
                  >
                    <input
                      type="radio"
                      name="project_type"
                      value={t.value}
                      checked={on}
                      onChange={() => set("project_type", t.value)}
                      className="mt-1 h-4 w-4 shrink-0 accent-orange"
                    />
                    <span>
                      <span className="block font-medium text-offwhite">{t.label}</span>
                      <span className="mt-0.5 block text-sm text-titanium">{t.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {fieldErr("project_type")}

            <div className="mt-8">
              <label htmlFor="q-description" className="field-label">
                Descreva seu projeto
              </label>
              <textarea
                id="q-description"
                className="field"
                rows={5}
                value={data.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Ex.: 50 chaveiros com a logomarca do meu restaurante · Um porta-QR code para 12 mesas · Um suporte para substituir uma peça quebrada"
                {...aria("description")}
              />
              <p className="field-hint">Para que a peça será usada? Onde vai ficar? Vai sofrer esforço, calor ou sol?</p>
              {fieldErr("description")}
            </div>
          </fieldset>
        )}

        {/* ── Etapa 2: Arquivos ── */}
        {step === 1 && (
          <fieldset className="quote-step space-y-8">
            <legend className="sr-only">Arquivos</legend>
            <div>
              <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold outline-none">
                Envie seus arquivos
              </h2>
              <p className="mt-2 text-titanium">Opcional, mas ajuda muito. Sem arquivo 3D? Envie fotos e esboços em referências.</p>
            </div>
            <Dropzone
              id="q-model"
              title="Arquivo 3D"
              subtitle="Arraste e solte ou toque para selecionar"
              formats={`STL, OBJ, 3MF, STEP (até ${maxModelMb} MB cada · máx. ${UPLOAD_LIMITS.maxModelFiles})`}
              icon="upload"
              files={models}
              onAdd={(f) => addFiles("model", f)}
              onRemove={(i) => setModels((m) => m.filter((_, j) => j !== i))}
            />
            <Dropzone
              id="q-reference"
              title="Fotos e referências"
              subtitle="Fotos da peça, esboços ou desenhos técnicos"
              formats={`JPG, PNG, WEBP, PDF (até ${UPLOAD_LIMITS.maxReferenceMb} MB cada · máx. ${UPLOAD_LIMITS.maxReferenceFiles})`}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              icon="image"
              files={refs}
              onAdd={(f) => addFiles("reference", f)}
              onRemove={(i) => setRefs((m) => m.filter((_, j) => j !== i))}
            />
            {fileError && (
              <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {fileError}
              </p>
            )}
            <p className="flex items-start gap-2 text-sm text-titanium-600">
              <Icon name="shield" size={16} className="mt-0.5 shrink-0" />
              Seus arquivos ficam em ambiente restrito e são usados apenas para avaliar o seu projeto.
            </p>
          </fieldset>
        )}

        {/* ── Etapa 3: Detalhes ── */}
        {step === 2 && (
          <fieldset className="quote-step">
            <legend className="sr-only">Detalhes da peça</legend>
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold outline-none">
              Detalhes da peça
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="q-dimensions" className="field-label">
                  Dimensões aproximadas <span className="text-titanium-600">(opcional)</span>
                </label>
                <input
                  id="q-dimensions"
                  className="field"
                  value={data.dimensions}
                  onChange={(e) => set("dimensions", e.target.value)}
                  placeholder="Ex.: 12 x 8 x 5 cm (largura x profundidade x altura)"
                />
              </div>
              <div>
                <label htmlFor="q-material" className="field-label">
                  Material
                </label>
                <select id="q-material" className="field" value={data.material} onChange={(e) => set("material", e.target.value)}>
                  <option value="">Selecione o material</option>
                  {materialOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className="field-hint">
                  Dúvida?{" "}
                  <Link href="/blog/pla-ou-petg-qual-escolher" target="_blank" className="underline decoration-orange underline-offset-2">
                    Compare os materiais
                  </Link>
                </p>
              </div>
              <div>
                <label htmlFor="q-quantity" className="field-label">
                  Quantidade
                </label>
                <input
                  id="q-quantity"
                  className="field"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10000}
                  value={data.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                  {...aria("quantity")}
                />
                {fieldErr("quantity")}
              </div>
              <div className="sm:col-span-2">
                {colors.length > 0 ? (
                  <fieldset>
                    <legend className="field-label">
                      Cores <span className="text-titanium-600">(opcional, escolha uma ou mais)</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c) => {
                        const on = data.colors.includes(c);
                        return (
                          <label
                            key={c}
                            className={`cursor-pointer rounded-md border px-3.5 py-2 text-sm transition-colors ${
                              on ? "border-orange bg-orange/10 text-offwhite" : "border-line-strong text-titanium hover:border-titanium"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={on}
                              onChange={() => set("colors", on ? data.colors.filter((x) => x !== c) : [...data.colors, c])}
                            />
                            {c}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ) : (
                  <>
                    <label htmlFor="q-colors" className="field-label">
                      Cores desejadas <span className="text-titanium-600">(opcional)</span>
                    </label>
                    <input
                      id="q-colors"
                      className="field"
                      value={data.colorsText}
                      onChange={(e) => set("colorsText", e.target.value)}
                      placeholder="Ex.: preto, laranja"
                    />
                    <p className="field-hint">Confirmamos a disponibilidade de cores na proposta.</p>
                  </>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="q-deadline" className="field-label">
                  Prazo desejado <span className="text-titanium-600">(opcional)</span>
                </label>
                <select id="q-deadline" className="field" value={data.deadline} onChange={(e) => set("deadline", e.target.value)}>
                  <option value="">Selecione</option>
                  {DEADLINES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="q-notes" className="field-label">
                  Observações <span className="text-titanium-600">(opcional)</span>
                </label>
                <textarea
                  id="q-notes"
                  className="field"
                  rows={4}
                  value={data.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Conte mais sobre o seu projeto: acabamento, encaixes, medidas críticas…"
                />
              </div>
            </div>
          </fieldset>
        )}

        {/* ── Etapa 4: Contato ── */}
        {step === 3 && (
          <fieldset className="quote-step">
            <legend className="sr-only">Dados de contato</legend>
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold outline-none">
              Como falamos com você?
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="q-name" className="field-label">
                  Nome
                </label>
                <input id="q-name" className="field" autoComplete="name" value={data.name} onChange={(e) => set("name", e.target.value)} {...aria("name")} />
                {fieldErr("name")}
              </div>
              <div>
                <label htmlFor="q-company" className="field-label">
                  Empresa <span className="text-titanium-600">(opcional)</span>
                </label>
                <input
                  id="q-company"
                  className="field"
                  autoComplete="organization"
                  placeholder="Restaurante, loja, empresa…"
                  value={data.company}
                  onChange={(e) => set("company", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="q-email" className="field-label">
                  E-mail
                </label>
                <input
                  id="q-email"
                  className="field"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={data.email}
                  onChange={(e) => set("email", e.target.value)}
                  {...aria("email")}
                />
                {fieldErr("email")}
              </div>
              <div>
                <label htmlFor="q-phone" className="field-label">
                  WhatsApp / telefone
                </label>
                <input
                  id="q-phone"
                  className="field"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(81) 9 0000-0000"
                  value={data.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  {...aria("phone")}
                />
                {fieldErr("phone")}
              </div>
              <div>
                <label htmlFor="q-city" className="field-label">
                  Cidade <span className="text-titanium-600">(opcional)</span>
                </label>
                <input
                  id="q-city"
                  className="field"
                  autoComplete="address-level2"
                  placeholder="Ex.: Recife – PE"
                  value={data.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
              <div>
                <span className="field-label" id="q-pref-label">
                  Prefere contato por
                </span>
                <div role="radiogroup" aria-labelledby="q-pref-label" className="flex flex-wrap gap-2">
                  {CONTACT_PREFERENCES.map((p) => (
                    <label
                      key={p}
                      className={`cursor-pointer rounded-md border px-3.5 py-2.5 text-sm transition-colors ${
                        data.contact_preference === p ? "border-orange bg-orange/10 text-offwhite" : "border-line-strong text-titanium"
                      }`}
                    >
                      <input
                        type="radio"
                        name="contact_preference"
                        className="sr-only"
                        checked={data.contact_preference === p}
                        onChange={() => set("contact_preference", p)}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-start gap-3 text-sm text-titanium">
                  <input
                    id="q-consent"
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-orange"
                    checked={data.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    {...aria("consent")}
                  />
                  <span>
                    Autorizo a LAB81 a usar meus dados e arquivos para analisar a solicitação e enviar a proposta, conforme a{" "}
                    <Link href="/politica-de-privacidade" target="_blank" className="text-offwhite underline decoration-orange underline-offset-4">
                      política de privacidade
                    </Link>
                    .
                  </span>
                </label>
                {fieldErr("consent")}
              </div>
            </div>
          </fieldset>
        )}

        {/* ── Etapa 5: Resumo ── */}
        {step === 4 && (
          <div className="quote-step">
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold outline-none">
              Confira sua solicitação
            </h2>
            <p className="mt-2 text-titanium">Revise os dados antes de enviar. Você pode voltar e editar qualquer etapa.</p>
            <div className="mt-6 divide-y divide-line rounded-md border border-line">
              <Summary title="Projeto" onEdit={() => setStep(0)}>
                <Row label="Tipo" value={PROJECT_TYPE_LABEL[data.project_type]} />
                <Row label="Descrição" value={data.description} multiline />
              </Summary>
              <Summary title="Arquivos" onEdit={() => setStep(1)}>
                <Row label="Arquivos 3D" value={models.length ? models.map((f) => f.name).join(", ") : "Nenhum"} />
                <Row label="Referências" value={refs.length ? refs.map((f) => f.name).join(", ") : "Nenhuma"} />
              </Summary>
              <Summary title="Detalhes" onEdit={() => setStep(2)}>
                <Row label="Dimensões" value={data.dimensions || "Não informadas"} />
                <Row label="Material" value={data.material || "Não informado"} />
                <Row label="Cores" value={(colors.length ? data.colors.join(", ") : data.colorsText) || "Não informadas"} />
                <Row label="Quantidade" value={data.quantity} />
                <Row label="Prazo" value={data.deadline || "Não informado"} />
                {data.notes && <Row label="Observações" value={data.notes} multiline />}
              </Summary>
              <Summary title="Contato" onEdit={() => setStep(3)}>
                <Row label="Nome" value={data.name} />
                {data.company && <Row label="Empresa" value={data.company} />}
                <Row label="E-mail" value={data.email} />
                <Row label="Telefone" value={data.phone || "Não informado"} />
                <Row label="Cidade" value={data.city || "Não informada"} />
                <Row label="Preferência" value={data.contact_preference} />
              </Summary>
            </div>

            {submitting && (
              <div className="mt-6" role="status" aria-live="polite">
                <div className="flex justify-between text-sm text-titanium">
                  <span>{progress < 100 ? "Enviando arquivos…" : "Registrando solicitação…"}</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded bg-line-strong">
                  <div className="h-full bg-orange transition-[width] duration-200" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {serverError && (
              <p role="alert" className="mt-6 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {serverError}
              </p>
            )}
          </div>
        )}

        {/* Navegação */}
        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <button type="button" className="btn btn-outline" onClick={back} disabled={submitting}>
              <Icon name="arrow-left" size={18} /> Voltar
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}
          {step < STEPS.length - 1 ? (
            <button type="submit" className="btn btn-primary">
              Continuar <Icon name="arrow" size={18} />
            </button>
          ) : (
            <button type="submit" className="btn btn-primary sm:min-w-64" disabled={submitting}>
              {submitting ? "Enviando…" : "Solicitar orçamento"} {!submitting && <Icon name="arrow" size={18} />}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Summary({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="p-4 md:p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-titanium-600">{title}</h3>
        <button type="button" onClick={onEdit} className="text-sm text-orange hover:underline">
          Editar
        </button>
      </div>
      <dl className="mt-3 space-y-2">{children}</dl>
    </section>
  );
}

function Row({ label, value, multiline }: { label: string; value?: string; multiline?: boolean }) {
  return (
    <div className="grid gap-1 text-sm sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-titanium-600">{label}</dt>
      <dd className={`break-words text-offwhite ${multiline ? "whitespace-pre-line" : ""}`}>{value}</dd>
    </div>
  );
}
