/**
 * Arquitetura preparada para precificação automática futura.
 *
 * Hoje a LAB81 trabalha apenas com ORÇAMENTO PERSONALIZADO: nenhum preço é calculado no site.
 * Para implementar uma estimativa no futuro:
 *  1. Crie uma estratégia que implemente `PricingStrategy` (ex.: volume do STL × custo do material + tempo de máquina).
 *  2. Registre-a em `activePricing`.
 *  3. O resultado pode ser salvo em quotes.estimated_price_cents (coluna já existente) e exibido no painel
 *     como referência interna antes de ser mostrado ao cliente.
 */
export type PricingInput = {
  projectType: string;
  material: string;
  quantity: number;
  models: { name: string; size: number }[];
};

export type PricingEstimate = { cents: number; breakdown: Record<string, number>; confidence: "baixa" | "media" | "alta" };

export interface PricingStrategy {
  id: string;
  estimate(input: PricingInput): Promise<PricingEstimate | null>;
}

/** Estratégia atual: sem cálculo automático. */
export const manualQuote: PricingStrategy = {
  id: "manual",
  async estimate() {
    return null;
  },
};

export const activePricing: PricingStrategy = manualQuote;
