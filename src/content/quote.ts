/** Definições compartilhadas (cliente e servidor) do fluxo de orçamento. */

export const PROJECT_TYPES = [
  { value: "impressao", label: "Imprimir um arquivo 3D", hint: "Já tenho o modelo (STL, OBJ, 3MF ou STEP)." },
  { value: "modelagem", label: "Modelagem + impressão", hint: "Tenho uma ideia, esboço, foto ou peça para reproduzir." },
  { value: "prototipo", label: "Protótipo", hint: "Quero validar forma, encaixe ou função de um produto." },
  { value: "peca_funcional", label: "Peça funcional ou reposição", hint: "Suporte, encaixe, adaptador ou peça quebrada." },
  { value: "brinde", label: "Brindes, lembranças ou chaveiros", hint: "Peças personalizadas para presentes, festas, eventos ou marcas." },
  { value: "empresa", label: "Solução para empresa", hint: "Restaurante, loja ou escritório: displays, porta-QR code, sinalização…" },
  { value: "produto", label: "Produto do catálogo", hint: "Quero um produto da LAB81 ou uma versão personalizada." },
  { value: "outro", label: "Outro", hint: "Conte sua necessidade na descrição." },
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number]["value"];
export const PROJECT_TYPE_LABEL: Record<string, string> = Object.fromEntries(PROJECT_TYPES.map((t) => [t.value, t.label]));

export const MATERIAL_UNKNOWN = "Não sei — quero orientação";

export const DEADLINES = ["Sem urgência", "Até 1 semana", "Até 15 dias", "Até 30 dias", "Tenho uma data específica (informar nas observações)"];

export const CONTACT_PREFERENCES = ["WhatsApp", "E-mail", "Telefone"];

export const MODEL_EXTENSIONS = ["stl", "obj", "3mf", "step", "stp"] as const;
export const REFERENCE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "pdf"] as const;

export const UPLOAD_LIMITS = {
  maxModelFiles: 5,
  maxReferenceFiles: 8,
  maxReferenceMb: 10,
  maxTotalMb: 150,
};

export function fileExtension(name: string) {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : "";
}
