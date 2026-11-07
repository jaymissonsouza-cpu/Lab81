"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { brl, calculate, emptyJob, type CostDefaults, type CostJob } from "@/lib/cost";
import { saveCostCalcAction, saveCostDefaultsAction } from "../../actions";

type Props = { defaults: CostDefaults; initial?: { id: number; job: CostJob } | null };

const num = (v: string) => {
  const x = Number(v.replace(",", "."));
  return Number.isFinite(x) ? x : 0;
};

function NumField({
  label,
  value,
  onChange,
  suffix,
  hint,
  step = "any",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  hint?: string;
  step?: string;
}) {
  const id = label.replace(/\W+/g, "-").toLowerCase();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={0}
          className={`field ${suffix ? "pr-14" : ""}`}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(num(e.target.value))}
          onFocus={(e) => e.target.select()}
        />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-titanium-600">{suffix}</span>}
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function Calculator({ defaults: initialDefaults, initial }: Props) {
  const router = useRouter();
  const [defaults, setDefaults] = useState<CostDefaults>(initialDefaults);
  const [job, setJob] = useState<CostJob>(() => initial?.job ?? emptyJob(initialDefaults));
  const [calcId, setCalcId] = useState<number | undefined>(initial?.id);
  const [showSettings, setShowSettings] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const r = useMemo(() => calculate(defaults, job), [defaults, job]);
  const set = <K extends keyof CostJob>(k: K, v: CostJob[K]) => setJob((j) => ({ ...j, [k]: v }));
  const setD = <K extends keyof CostDefaults>(k: K, v: CostDefaults[K]) => setDefaults((d) => ({ ...d, [k]: v }));

  function pickMaterial(name: string) {
    const m = defaults.materials.find((x) => x.name === name);
    setJob((j) => ({ ...j, material: name, pricePerKg: m?.pricePerKg ?? j.pricePerKg }));
  }

  function saveCalc(asNew = false) {
    setMsg(null);
    start(async () => {
      const res = await saveCostCalcAction({ id: asNew ? undefined : calcId, job });
      setMsg({ ok: res?.ok ?? false, text: res?.message ?? "Erro ao salvar." });
      if (res?.ok && res.id) {
        setCalcId(res.id);
        router.replace(`/admin/calculadora?id=${res.id}`, { scroll: false });
      }
    });
  }

  function saveDefaults() {
    setMsg(null);
    start(async () => {
      const res = await saveCostDefaultsAction(defaults);
      setMsg({ ok: res?.ok ?? false, text: res?.message ?? "Erro ao salvar." });
    });
  }

  function newCalc() {
    setCalcId(undefined);
    setJob(emptyJob(defaults));
    setMsg(null);
    router.replace("/admin/calculadora", { scroll: false });
  }

  async function copySummary() {
    const lines = [
      `${job.name || "Cálculo"} — ${job.quantity} un. (${job.material})`,
      `Custo por peça: ${brl(r.perUnit.cost)}`,
      `Preço sugerido por peça: ${brl(r.perUnit.price)}`,
      `Total do pedido: ${brl(r.total.price)} (lucro ${brl(r.total.profit)})`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setMsg({ ok: true, text: "Resumo copiado." });
    } catch {
      setMsg({ ok: false, text: "Não foi possível copiar." });
    }
  }

  const rows: [string, number][] = [
    ["Material", r.perUnit.material],
    ["Energia", r.perUnit.energy],
    ["Máquina (desgaste e manutenção)", r.perUnit.machine],
    ["Mão de obra", r.perUnit.labor],
    ["Extras (argola, embalagem…)", r.perUnit.extras],
    ["Modelagem", r.perUnit.design],
    ["Margem para falhas", r.perUnit.failure],
  ];

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_22rem] lg:pb-0">
      {/* Barra fixa no celular: preço sempre visível enquanto preenche */}
      <a
        href="#resultado"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-orange/50 bg-carbon-800/95 px-5 py-3 backdrop-blur lg:hidden"
      >
        <span>
          <span className="block text-[0.6875rem] uppercase tracking-[0.15em] text-titanium-600">Preço por peça</span>
          <span className="font-display text-2xl font-bold text-orange">{brl(r.perUnit.price)}</span>
        </span>
        <span className="text-right text-xs text-titanium">
          Custo {brl(r.perUnit.cost)}
          <br />
          Total {brl(r.total.price)}
        </span>
      </a>
      <div className="space-y-6">
        {/* Peça */}
        <section className="rounded-lg border border-line bg-carbon-800/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Peça</h2>
            {calcId && (
              <button type="button" onClick={newCalc} className="text-sm text-orange">
                + Novo cálculo
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="c-name" className="field-label">
                Nome do produto ou pedido
              </label>
              <input id="c-name" className="field" placeholder="Ex.: Chaveiro com nome" value={job.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label htmlFor="c-mat" className="field-label">
                Material
              </label>
              <select id="c-mat" className="field" value={job.material} onChange={(e) => pickMaterial(e.target.value)}>
                {defaults.materials.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({brl(m.pricePerKg)}/kg)
                  </option>
                ))}
              </select>
            </div>
            <NumField label="Preço do filamento" suffix="R$/kg" value={job.pricePerKg} onChange={(v) => set("pricePerKg", v)} />
            <NumField label="Filamento por impressão" suffix="g" value={job.gramsPerPlate} onChange={(v) => set("gramsPerPlate", v)} hint="Do fatiador, com suportes." />
            <NumField label="Tempo de impressão" suffix="h" value={job.hoursPerPlate} onChange={(v) => set("hoursPerPlate", v)} hint="Ex.: 2h30 = 2,5" />
            <NumField label="Peças por impressão" suffix="un." step="1" value={job.unitsPerPlate} onChange={(v) => set("unitsPerPlate", Math.max(1, Math.round(v)))} hint="Quantas cabem na mesa." />
            <NumField label="Quantidade do pedido" suffix="un." step="1" value={job.quantity} onChange={(v) => set("quantity", Math.max(1, Math.round(v)))} />
          </div>
        </section>

        {/* Trabalho */}
        <section className="rounded-lg border border-line bg-carbon-800/50 p-5">
          <h2 className="font-display text-lg font-semibold">Trabalho e extras</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumField label="Preparação por impressão" suffix="min" value={job.setupMinutesPerPlate} onChange={(v) => set("setupMinutesPerPlate", v)} hint="Fatiar, limpar mesa, iniciar." />
            <NumField label="Acabamento por peça" suffix="min" value={job.finishMinutesPerUnit} onChange={(v) => set("finishMinutesPerUnit", v)} hint="Suportes, lixa, montagem, embalagem." />
            <NumField label="Extras por peça" suffix="R$" value={job.extrasPerUnit} onChange={(v) => set("extrasPerUnit", v)} hint="Argola, ímã, parafuso, saquinho…" />
            <NumField label="Modelagem do pedido" suffix="R$" value={job.designCost} onChange={(v) => set("designCost", v)} hint="Dividido entre as peças." />
          </div>
        </section>

        {/* Preço */}
        <section className="rounded-lg border border-line bg-carbon-800/50 p-5">
          <h2 className="font-display text-lg font-semibold">Preço de venda</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumField label="Lucro sobre o custo" suffix="%" value={job.markup} onChange={(v) => set("markup", v)} hint="100% = vender pelo dobro do custo." />
            <NumField label="Impostos e taxas" suffix="%" value={job.feesRate} onChange={(v) => set("feesRate", Math.min(v, 90))} hint="Simples, maquininha, marketplace…" />
          </div>
        </section>

        {/* Parâmetros do estúdio */}
        <section className="rounded-lg border border-line p-5">
          <button type="button" onClick={() => setShowSettings((v) => !v)} className="flex w-full items-center justify-between text-left" aria-expanded={showSettings}>
            <span>
              <span className="block font-display text-lg font-semibold">Parâmetros do estúdio</span>
              <span className="block text-sm text-titanium">Energia, impressora, hora de trabalho e filamentos. Configure uma vez.</span>
            </span>
            <span className="text-2xl text-orange">{showSettings ? "−" : "+"}</span>
          </button>
          {showSettings && (
            <div className="mt-5 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumField label="Tarifa de energia" suffix="R$/kWh" value={defaults.kwhPrice} onChange={(v) => setD("kwhPrice", v)} hint="Na conta de luz (com impostos)." />
                <NumField label="Consumo da impressora" suffix="W" value={defaults.printerWatts} onChange={(v) => setD("printerWatts", v)} hint="Média durante a impressão." />
                <NumField label="Valor da impressora" suffix="R$" value={defaults.printerPrice} onChange={(v) => setD("printerPrice", v)} />
                <NumField label="Vida útil estimada" suffix="h" value={defaults.printerLifeHours} onChange={(v) => setD("printerLifeHours", v)} />
                <NumField label="Manutenção" suffix="R$/h" value={defaults.maintenancePerHour} onChange={(v) => setD("maintenancePerHour", v)} hint="Bicos, correias, PEI…" />
                <NumField label="Valor da sua hora" suffix="R$/h" value={defaults.laborPerHour} onChange={(v) => setD("laborPerHour", v)} />
                <NumField label="Margem para falhas" suffix="%" value={defaults.failureRate} onChange={(v) => setD("failureRate", Math.min(v, 100))} />
                <NumField label="Lucro padrão" suffix="%" value={defaults.markup} onChange={(v) => setD("markup", v)} />
                <NumField label="Impostos e taxas padrão" suffix="%" value={defaults.feesRate} onChange={(v) => setD("feesRate", Math.min(v, 90))} />
              </div>
              <div>
                <p className="field-label">Filamentos (R$ por kg)</p>
                <ul className="space-y-2">
                  {defaults.materials.map((m, i) => (
                    <li key={i} className="grid grid-cols-[1fr_8rem_2.5rem] gap-2">
                      <input
                        className="field"
                        aria-label="Nome do filamento"
                        value={m.name}
                        onChange={(e) => setD("materials", defaults.materials.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                      />
                      <input
                        className="field"
                        type="number"
                        inputMode="decimal"
                        aria-label={`Preço do ${m.name} por kg`}
                        value={m.pricePerKg}
                        onChange={(e) => setD("materials", defaults.materials.map((x, j) => (j === i ? { ...x, pricePerKg: num(e.target.value) } : x)))}
                      />
                      <button
                        type="button"
                        aria-label={`Remover ${m.name}`}
                        className="rounded border border-line-strong text-titanium hover:text-red-300"
                        onClick={() => setD("materials", defaults.materials.filter((_, j) => j !== i))}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-2 text-sm text-orange"
                  onClick={() => setD("materials", [...defaults.materials, { name: "Novo", pricePerKg: 100 }])}
                >
                  + Adicionar filamento
                </button>
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={saveDefaults} disabled={pending}>
                Salvar parâmetros
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Resultado */}
      <aside id="resultado" className="scroll-mt-20 lg:sticky lg:top-6 lg:self-start">
        <div className="overflow-hidden rounded-lg border border-orange/50 bg-carbon-800">
          <div className="border-b border-line p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-titanium-600">Preço sugerido por peça</p>
            <p className="mt-1 font-display text-4xl font-bold text-orange">{brl(r.perUnit.price)}</p>
            <p className="mt-2 text-sm text-titanium">
              Custo {brl(r.perUnit.cost)} · Lucro {brl(r.perUnit.profit)} ({r.marginOnPrice.toFixed(0)}% do preço)
            </p>
          </div>
          <dl className="divide-y divide-line text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-5 py-2.5">
                <dt className="text-titanium">{k}</dt>
                <dd>{brl(v)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 bg-carbon-700/50 px-5 py-2.5 font-semibold">
              <dt>Custo por peça</dt>
              <dd>{brl(r.perUnit.cost)}</dd>
            </div>
            <div className="flex justify-between gap-4 px-5 py-2.5">
              <dt className="text-titanium">Impostos e taxas</dt>
              <dd>{brl(r.perUnit.fees)}</dd>
            </div>
          </dl>
          <div className="space-y-1.5 border-t border-line p-5 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-titanium-600">Pedido de {job.quantity} un.</p>
            <div className="flex justify-between">
              <span className="text-titanium">Preço total</span>
              <strong className="text-base">{brl(r.total.price)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-titanium">Custo total</span>
              <span>{brl(r.total.cost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-titanium">Lucro total</span>
              <span className="text-emerald-300">{brl(r.total.profit)}</span>
            </div>
            <p className="pt-2 text-xs text-titanium-600">
              {r.plates} impressão(ões) · {r.total.hours.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h de máquina ·{" "}
              {r.total.grams.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} g de filamento
            </p>
          </div>
          <div className="flex flex-col gap-2 border-t border-line p-5">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => saveCalc(false)} disabled={pending}>
              {pending ? "Salvando…" : calcId ? "Salvar alterações" : "Salvar cálculo"}
            </button>
            {calcId && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => saveCalc(true)} disabled={pending}>
                Salvar como novo
              </button>
            )}
            <button type="button" className="btn btn-outline btn-sm" onClick={copySummary}>
              Copiar resumo
            </button>
            {msg && (
              <p role="status" className={`text-sm ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>
                {msg.text}
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
