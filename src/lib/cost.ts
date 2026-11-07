/**
 * Calculadora de custo de impressão 3D (uso interno, painel /admin/calculadora).
 * Funções puras: usadas no navegador (cálculo ao vivo) e no servidor (salvar cálculos).
 */

export type MaterialPreset = { name: string; pricePerKg: number };

/** Parâmetros fixos do estúdio (salvos no painel e reaproveitados em todo cálculo). */
export type CostDefaults = {
  materials: MaterialPreset[];
  kwhPrice: number; // R$ por kWh
  printerWatts: number; // consumo médio da impressora (W)
  printerPrice: number; // valor da impressora (R$)
  printerLifeHours: number; // vida útil estimada (h)
  maintenancePerHour: number; // peças de desgaste, bicos, correias… (R$/h)
  laborPerHour: number; // valor da hora de trabalho (R$/h)
  failureRate: number; // % de margem para falhas de impressão
  markup: number; // % de lucro sobre o custo
  feesRate: number; // % de impostos + taxas (cartão, marketplace) sobre o preço final
};

/** Dados de um trabalho. Os valores de impressão são de UMA mesa (impressão) completa. */
export type CostJob = {
  name: string;
  material: string;
  pricePerKg: number;
  gramsPerPlate: number; // filamento total da mesa, incluindo suportes e purga
  hoursPerPlate: number; // tempo de impressão da mesa (h)
  unitsPerPlate: number; // peças por mesa
  quantity: number; // peças do pedido
  setupMinutesPerPlate: number; // preparar arquivo, fatiar, limpar mesa
  finishMinutesPerUnit: number; // remover suporte, lixar, montar, embalar
  extrasPerUnit: number; // argola, ímã, parafuso, embalagem… (R$/peça)
  designCost: number; // modelagem do pedido (R$, dividida pelas peças)
  markup: number;
  feesRate: number;
};

export const DEFAULT_COST_SETTINGS: CostDefaults = {
  materials: [
    { name: "PLA", pricePerKg: 110 },
    { name: "PETG", pricePerKg: 120 },
    { name: "ABS", pricePerKg: 110 },
    { name: "ASA", pricePerKg: 150 },
  ],
  kwhPrice: 0.95,
  printerWatts: 150,
  printerPrice: 5000,
  printerLifeHours: 5000,
  maintenancePerHour: 0.5,
  laborPerHour: 30,
  failureRate: 10,
  markup: 100,
  feesRate: 10,
};

export function emptyJob(d: CostDefaults): CostJob {
  return {
    name: "",
    material: d.materials[0]?.name ?? "PLA",
    pricePerKg: d.materials[0]?.pricePerKg ?? 0,
    gramsPerPlate: 50,
    hoursPerPlate: 3,
    unitsPerPlate: 1,
    quantity: 1,
    setupMinutesPerPlate: 10,
    finishMinutesPerUnit: 5,
    extrasPerUnit: 0,
    designCost: 0,
    markup: d.markup,
    feesRate: d.feesRate,
  };
}

const n = (v: unknown, min = 0) => {
  const x = typeof v === "number" ? v : Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(x) ? Math.max(min, x) : min;
};

export type CostResult = {
  plates: number;
  perUnit: {
    material: number;
    energy: number;
    machine: number;
    labor: number;
    extras: number;
    design: number;
    failure: number;
    cost: number;
    price: number;
    fees: number;
    profit: number;
  };
  total: { cost: number; price: number; profit: number; grams: number; hours: number };
  marginOnPrice: number; // lucro / preço (%)
};

export function calculate(d: CostDefaults, j: CostJob): CostResult {
  const units = Math.max(1, Math.floor(n(j.unitsPerPlate, 1)));
  const qty = Math.max(1, Math.floor(n(j.quantity, 1)));
  const plates = Math.ceil(qty / units);
  const hours = n(j.hoursPerPlate);
  const grams = n(j.gramsPerPlate);

  // custos de uma mesa, rateados pelas peças da mesa
  const materialPlate = (grams / 1000) * n(j.pricePerKg);
  const energyPlate = (n(d.printerWatts) / 1000) * hours * n(d.kwhPrice);
  const depreciation = n(d.printerLifeHours) > 0 ? n(d.printerPrice) / n(d.printerLifeHours) : 0;
  const machinePlate = hours * (depreciation + n(d.maintenancePerHour));
  const setupPlate = (n(j.setupMinutesPerPlate) / 60) * n(d.laborPerHour);

  const material = materialPlate / units;
  const energy = energyPlate / units;
  const machine = machinePlate / units;
  const labor = setupPlate / units + (n(j.finishMinutesPerUnit) / 60) * n(d.laborPerHour);
  const extras = n(j.extrasPerUnit);
  const design = n(j.designCost) / qty;

  // falhas incidem sobre o que é perdido numa impressão ruim (material, energia e máquina)
  const failure = (material + energy + machine) * (n(d.failureRate) / 100);
  const cost = material + energy + machine + labor + extras + design + failure;

  const fees = Math.min(n(j.feesRate), 90) / 100;
  const price = (cost * (1 + n(j.markup) / 100)) / (1 - fees);
  const feesValue = price * fees;
  const profit = price - feesValue - cost;

  return {
    plates,
    perUnit: { material, energy, machine, labor, extras, design, failure, cost, price, fees: feesValue, profit },
    total: { cost: cost * qty, price: price * qty, profit: profit * qty, grams: grams * plates, hours: hours * plates },
    marginOnPrice: price > 0 ? (profit / price) * 100 : 0,
  };
}

export function normalizeDefaults(raw: unknown): CostDefaults {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<CostDefaults>;
  const base = DEFAULT_COST_SETTINGS;
  const mats = Array.isArray(r.materials)
    ? r.materials
        .filter((m) => m && typeof m.name === "string" && m.name.trim())
        .map((m) => ({ name: String(m.name).trim().slice(0, 40), pricePerKg: n(m.pricePerKg) }))
        .slice(0, 20)
    : base.materials;
  return {
    materials: mats.length ? mats : base.materials,
    kwhPrice: n(r.kwhPrice ?? base.kwhPrice),
    printerWatts: n(r.printerWatts ?? base.printerWatts),
    printerPrice: n(r.printerPrice ?? base.printerPrice),
    printerLifeHours: n(r.printerLifeHours ?? base.printerLifeHours),
    maintenancePerHour: n(r.maintenancePerHour ?? base.maintenancePerHour),
    laborPerHour: n(r.laborPerHour ?? base.laborPerHour),
    failureRate: Math.min(n(r.failureRate ?? base.failureRate), 100),
    markup: n(r.markup ?? base.markup),
    feesRate: Math.min(n(r.feesRate ?? base.feesRate), 90),
  };
}

export function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
