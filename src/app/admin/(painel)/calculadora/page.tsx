import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getCostCalc, getCostDefaultsRaw, listCostCalcs } from "@/lib/repos";
import { DEFAULT_COST_SETTINGS, normalizeDefaults, type CostJob } from "@/lib/cost";
import { parseJson } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { deleteCostCalcAction } from "../../actions";
import { Calculator } from "./Calculator";

export const metadata = { title: "Calculadora de custos" };

export default async function CalculadoraPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireAdmin();
  const { id } = await searchParams;
  const defaults = normalizeDefaults(getCostDefaultsRaw() ?? DEFAULT_COST_SETTINGS);
  const saved = listCostCalcs();
  const current = id ? getCostCalc(Number(id)) : undefined;
  const initial = current ? { id: current.id, job: parseJson<CostJob>(current.job, {} as CostJob) } : null;

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-3xl font-semibold">Calculadora de custos</h1>
      <p className="mt-2 max-w-2xl text-titanium">
        Preencha os dados da peça (gramas e tempo vêm do fatiador). O custo e o preço sugerido são atualizados na hora. Uso interno: nada
        aparece no site.
      </p>

      <div className="mt-8">
        <Calculator key={current?.id ?? "novo"} defaults={defaults} initial={initial} />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Cálculos salvos</h2>
        {saved.length === 0 ? (
          <p className="mt-3 text-sm text-titanium">Nenhum cálculo salvo ainda.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
            {saved.map((c) => (
              <li key={c.id} className={`flex items-center gap-3 p-4 ${current?.id === c.id ? "bg-carbon-800" : ""}`}>
                <Link href={`/admin/calculadora?id=${c.id}`} className="min-w-0 flex-1">
                  <span className="block truncate font-medium hover:text-orange">{c.name}</span>
                  <span className="block text-xs text-titanium-600">
                    Custo {formatPrice(c.unit_cost_cents)} · Preço {formatPrice(c.unit_price_cents)} por peça · {c.quantity} un. ·{" "}
                    {formatDate(c.updated_at, { dateStyle: "short" })}
                  </span>
                </Link>
                <form action={deleteCostCalcAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-sm text-red-400 hover:underline" aria-label={`Excluir ${c.name}`}>
                    Excluir
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
