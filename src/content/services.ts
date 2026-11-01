/**
 * Serviços confirmados pela LAB81: impressão 3D sob demanda, modelagem 3D, prototipagem e produtos autorais.
 * Materiais confirmados: PLA, PETG, ABS e ASA (FDM).
 * Não adicione aqui serviços que ainda não são oferecidos.
 */

export type ServiceCard = {
  title: string;
  description: string;
  href: string;
  icon: "print" | "model" | "prototype" | "gear" | "spark";
};

export const SERVICE_CARDS: ServiceCard[] = [
  {
    title: "Impressão 3D personalizada",
    description: "Fabricamos sua peça a partir de um arquivo 3D, com orientação sobre material, resistência e acabamento.",
    href: "/impressao-3d-personalizada",
    icon: "print",
  },
  {
    title: "Modelagem 3D",
    description: "Transformamos esboços, fotos e medidas em modelos 3D prontos para fabricação.",
    href: "/modelagem-3d",
    icon: "model",
  },
  {
    title: "Prototipagem 3D",
    description: "Protótipos para validar forma, encaixe e função antes de investir em produção.",
    href: "/prototipagem-3d",
    icon: "prototype",
  },
  {
    title: "Peças funcionais",
    description: "Suportes, encaixes e peças de reposição em PETG, ABS e ASA, pensados para uso real.",
    href: "/impressao-3d-personalizada#pecas-funcionais",
    icon: "gear",
  },
  {
    title: "Produtos autorais",
    description: "Luminárias, vasos e objetos de design próprio, produzidos sob encomenda e personalizáveis.",
    href: "/produtos",
    icon: "spark",
  },
];

export type ServicePage = {
  path: string;
  eyebrow: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  lead: string;
  image: { src: string; alt: string };
  highlights: { title: string; text: string }[];
  sections: { id?: string; title: string; paragraphs: string[]; bullets?: string[] }[];
  faqs: { q: string; a: string }[];
  related: { href: string; label: string }[];
  ctaTitle: string;
};

export const MATERIALS_INFO = [
  { name: "PLA", text: "Ótimo acabamento e precisão. Ideal para decoração, maquetes e protótipos de forma em ambiente interno." },
  { name: "PETG", text: "Mais tenaz e resistente à umidade. Indicado para peças funcionais, suportes e encaixes." },
  { name: "ABS", text: "Boa resistência térmica e mecânica para peças técnicas que trabalham perto de fontes de calor." },
  { name: "ASA", text: "Semelhante ao ABS, com melhor resistência a raios UV. Indicado para peças de uso externo." },
];

export const SERVICE_PAGES: Record<string, ServicePage> = {
  "impressao-3d-recife": {
    path: "/impressao-3d-recife",
    eyebrow: "Impressão 3D em Recife",
    h1: "Impressão 3D em Recife, do arquivo à peça pronta",
    metaTitle: "Impressão 3D em Recife | Peças sob demanda e prototipagem",
    metaDescription:
      "Serviço de impressão 3D em Recife e Pernambuco: peças personalizadas, protótipos e modelagem 3D em PLA, PETG, ABS e ASA. Solicite um orçamento.",
    lead:
      "A LAB81 é um estúdio de design e fabricação digital em Recife. Desenvolvemos e imprimimos peças sob demanda para quem precisa de um objeto único, uma reposição, um protótipo ou uma pequena série.",
    image: { src: "/demo/luminaria-parametrica-laranja.webp", alt: "Luminária paramétrica laranja impressa em 3D (imagem demonstrativa)" },
    highlights: [
      { title: "Atendimento próximo", text: "Conversa direta com quem projeta e fabrica a sua peça." },
      { title: "Orientação técnica", text: "Indicamos material, orientação de impressão e acabamento para cada uso." },
      { title: "Do zero ou do arquivo", text: "Imprimimos o seu arquivo ou modelamos a peça a partir de fotos e medidas." },
    ],
    sections: [
      {
        title: "Para quem é o nosso serviço",
        paragraphs: [
          "Atendemos pessoas, profissionais e empresas que precisam transformar uma ideia em objeto físico. Arquitetos e designers que precisam de maquetes e peças de apresentação, empreendedores validando um produto, técnicos em busca de uma peça de reposição e qualquer pessoa com um projeto pessoal.",
        ],
        bullets: [
          "Peças de reposição e adaptação",
          "Protótipos de produtos",
          "Objetos decorativos e personalizados",
          "Suportes, encaixes e peças funcionais",
          "Pequenas séries sem custo de molde",
        ],
      },
      {
        title: "Como funciona o atendimento em Recife",
        paragraphs: [
          "Você envia sua solicitação pelo formulário de orçamento, com arquivo 3D, fotos ou uma descrição da ideia. Analisamos a viabilidade, sugerimos o material mais adequado e enviamos uma proposta personalizada.",
          "Após a aprovação, fabricamos a peça, realizamos os acabamentos combinados e combinamos a forma de entrega. Atendemos Recife e a Região Metropolitana e enviamos para outras regiões conforme a capacidade operacional.",
        ],
      },
    ],
    faqs: [
      {
        q: "Vocês fazem impressão 3D em Recife?",
        a: "Sim. A LAB81 é um estúdio de Recife (PE) e atende a cidade e a Região Metropolitana. Para outras regiões, consulte as condições de envio no orçamento.",
      },
      {
        q: "Preciso ter o arquivo 3D?",
        a: "Não. Se você não tiver o arquivo, podemos modelar a peça a partir de fotos, esboços e medidas. A modelagem é orçada junto com a impressão.",
      },
      {
        q: "Quanto custa uma impressão 3D?",
        a: "O valor depende do tamanho, do material, do tempo de máquina, da modelagem e do acabamento. Por isso, cada projeto recebe um orçamento personalizado.",
      },
      {
        q: "Qual o prazo de entrega?",
        a: "O prazo depende da complexidade e da quantidade de peças. Ele é informado na proposta, antes de você aprovar o serviço.",
      },
    ],
    related: [
      { href: "/impressao-3d-personalizada", label: "Impressão 3D personalizada" },
      { href: "/modelagem-3d", label: "Modelagem 3D" },
      { href: "/prototipagem-3d", label: "Prototipagem 3D" },
      { href: "/blog/quanto-custa-uma-impressao-3d", label: "Quanto custa uma impressão 3D?" },
    ],
    ctaTitle: "Tem uma peça para fabricar em Recife?",
  },

  "impressao-3d-personalizada": {
    path: "/impressao-3d-personalizada",
    eyebrow: "Impressão 3D sob demanda",
    h1: "Impressão 3D personalizada para peças únicas e pequenas séries",
    metaTitle: "Impressão 3D personalizada e sob demanda | LAB81 Studio",
    metaDescription:
      "Impressão 3D sob demanda em PLA, PETG, ABS e ASA. Peças personalizadas, funcionais e decorativas com análise técnica e acabamento profissional.",
    lead:
      "Envie seu arquivo ou sua ideia. Analisamos o modelo, indicamos o material certo e fabricamos a peça com o acabamento que o projeto pede.",
    image: { src: "/demo/suporte-tecnico-preto.webp", alt: "Suporte técnico preto impresso em 3D (imagem demonstrativa)" },
    highlights: [
      { title: "Análise do arquivo", text: "Verificamos malha, espessuras e encaixes antes de imprimir." },
      { title: "Material adequado", text: "PLA, PETG, ABS ou ASA, conforme o uso real da peça." },
      { title: "Acabamento cuidadoso", text: "Remoção de suportes e acabamentos combinados com você." },
    ],
    sections: [
      {
        title: "Da peça única à pequena série",
        paragraphs: [
          "A impressão 3D dispensa moldes. Isso torna viável fabricar uma única peça ou algumas unidades com o mesmo cuidado, e ajustar o projeto entre uma versão e outra.",
        ],
      },
      {
        id: "pecas-funcionais",
        title: "Peças funcionais",
        paragraphs: [
          "Suportes, encaixes, tampas, adaptadores e peças de reposição precisam funcionar, não apenas parecer bonitos. Para essas aplicações, escolhemos materiais mais resistentes e definimos a orientação de impressão de acordo com o esforço que a peça vai sofrer.",
        ],
        bullets: [
          "PETG para peças tenazes e resistentes à umidade",
          "ABS para peças técnicas próximas a fontes de calor",
          "ASA para uso externo, com exposição ao sol",
          "Reforço de paredes e preenchimento nas áreas de esforço",
        ],
      },
      {
        title: "Peças decorativas e personalizadas",
        paragraphs: [
          "Objetos com geometrias complexas, formas orgânicas e padrões vazados são o território natural da impressão 3D. Produzimos peças decorativas, presentes personalizados e objetos sob medida para o seu espaço.",
        ],
      },
      {
        title: "Arquivos aceitos",
        paragraphs: [
          "Recebemos arquivos STL, OBJ, 3MF e STEP. Se você não tem o arquivo, podemos modelar a peça a partir de fotos, esboços e medidas.",
        ],
      },
    ],
    faqs: [
      {
        q: "Qual material devo escolher?",
        a: "Depende do uso. PLA é ótimo para decoração e protótipos; PETG para peças funcionais; ABS e ASA para calor e uso externo. Se tiver dúvida, indicamos o material no orçamento.",
      },
      {
        q: "Vocês corrigem arquivos com problemas?",
        a: "Sim. Todo arquivo passa por análise. Se houver malha aberta, paredes finas demais ou outros problemas, avisamos e propomos a correção.",
      },
      {
        q: "Posso encomendar mais de uma unidade?",
        a: "Sim. Informe a quantidade no formulário. Em pequenas séries, parte da preparação é compartilhada entre as peças.",
      },
    ],
    related: [
      { href: "/modelagem-3d", label: "Modelagem 3D" },
      { href: "/blog/pla-ou-petg-qual-escolher", label: "PLA ou PETG: qual escolher?" },
      { href: "/blog/quais-arquivos-sao-usados-para-impressao-3d", label: "Quais arquivos são usados para impressão 3D?" },
      { href: "/projetos", label: "Ver projetos" },
    ],
    ctaTitle: "Pronto para imprimir sua peça?",
  },

  "modelagem-3d": {
    path: "/modelagem-3d",
    eyebrow: "Modelagem 3D",
    h1: "Modelagem 3D para fabricação",
    metaTitle: "Modelagem 3D para impressão | LAB81 Studio Recife",
    metaDescription:
      "Criamos modelos 3D a partir de esboços, fotos e medidas, prontos para impressão. Modelagem técnica de peças e modelagem de objetos decorativos.",
    lead:
      "Não tem o arquivo? A gente desenha. Transformamos esboços, fotos e medidas em modelos 3D pensados desde o início para serem fabricados.",
    image: { src: "/demo/carcaca-aerodinamica-laranja.webp", alt: "Carcaça aerodinâmica com estrutura hexagonal impressa em 3D (imagem demonstrativa)" },
    highlights: [
      { title: "A partir do que você tem", text: "Esboço, foto, peça quebrada ou só uma ideia bem descrita." },
      { title: "Pensada para imprimir", text: "Espessuras, encaixes e ângulos definidos para a fabricação." },
      { title: "Validação com você", text: "Você revisa o modelo antes da impressão." },
    ],
    sections: [
      {
        title: "Modelagem técnica",
        paragraphs: [
          "Para peças de reposição, suportes e encaixes, a precisão das medidas é o que importa. Modelamos a partir das medidas da peça original ou do local onde ela vai ser instalada, considerando folgas e tolerâncias de encaixe.",
        ],
      },
      {
        title: "Modelagem de objetos e produtos",
        paragraphs: [
          "Para objetos decorativos e produtos, trabalhamos forma, proporção e detalhes. Com modelagem paramétrica, uma mesma peça pode ganhar variações de tamanho e desenho.",
        ],
      },
      {
        title: "O que enviar",
        paragraphs: ["Quanto mais informação, mais preciso o resultado:"],
        bullets: [
          "Fotos da peça ou referência, de preferência com régua ou trena aparecendo",
          "Esboço com as medidas principais",
          "Descrição do uso e de onde a peça vai encaixar",
          "Arquivos de referência, se houver",
        ],
      },
    ],
    faqs: [
      {
        q: "Vocês entregam o arquivo 3D?",
        a: "As condições de entrega do arquivo são combinadas na proposta de cada projeto.",
      },
      {
        q: "Consigo reproduzir uma peça quebrada?",
        a: "Na maioria dos casos, sim. Com fotos e medidas da peça, modelamos uma nova. Para encaixes críticos, recomendamos um protótipo de teste.",
      },
      {
        q: "Posso pedir só a modelagem, sem a impressão?",
        a: "Conte sua necessidade no formulário de orçamento e avaliamos o melhor formato para o seu projeto.",
      },
    ],
    related: [
      { href: "/prototipagem-3d", label: "Prototipagem 3D" },
      { href: "/blog/como-preparar-um-modelo-para-impressao-3d", label: "Como preparar um modelo para impressão" },
      { href: "/impressao-3d-personalizada", label: "Impressão 3D personalizada" },
    ],
    ctaTitle: "Tem uma ideia que ainda não virou arquivo?",
  },

  "prototipagem-3d": {
    path: "/prototipagem-3d",
    eyebrow: "Prototipagem 3D",
    h1: "Prototipagem 3D para testar antes de produzir",
    metaTitle: "Prototipagem 3D em Recife | Protótipos de forma, encaixe e função",
    metaDescription:
      "Protótipos impressos em 3D para validar forma, encaixe e função do seu produto antes da produção. Iterações rápidas com modelagem e impressão no mesmo estúdio.",
    lead:
      "Segure sua ideia na mão antes de investir em produção. Desenvolvemos protótipos para validar forma, encaixe e função, com ajustes rápidos entre uma versão e outra.",
    image: { src: "/demo/carcaca-aerodinamica-2.webp", alt: "Protótipo de carcaça laranja com padrão hexagonal (imagem demonstrativa)" },
    highlights: [
      { title: "Forma", text: "Aparência, proporção e ergonomia na mão." },
      { title: "Encaixe", text: "Verificação de medidas e montagem entre partes." },
      { title: "Função", text: "Testes de uso com material adequado ao esforço." },
    ],
    sections: [
      {
        title: "Por que prototipar",
        paragraphs: [
          "Erros de medida, ergonomia ou montagem são muito mais baratos de corrigir antes da produção. Um protótipo físico também facilita conversas com sócios, clientes e fornecedores.",
        ],
      },
      {
        title: "Modelagem e impressão no mesmo lugar",
        paragraphs: [
          "Como modelamos e imprimimos no mesmo estúdio, cada rodada de ajuste é mais rápida: você testa, aponta o que mudar, ajustamos o modelo e imprimimos a próxima versão.",
        ],
        bullets: [
          "Protótipos de produtos e carcaças",
          "Testes de encaixe com peças existentes",
          "Peças de apresentação para investidores e clientes",
          "Validação antes de moldes e produção em série",
        ],
      },
      {
        title: "Limites que vale conhecer",
        paragraphs: [
          "Um protótipo impresso em filamento é excelente para validar forma e encaixe e muito útil em testes funcionais. Ainda assim, ele pode não reproduzir exatamente o comportamento de uma peça injetada em série. Discutimos isso com você para que o teste responda às perguntas certas.",
        ],
      },
    ],
    faqs: [
      {
        q: "Quantas versões de protótipo posso fazer?",
        a: "Quantas forem necessárias. Cada rodada é combinada com você, com ajustes no modelo entre uma versão e outra.",
      },
      {
        q: "Qual material usar em um protótipo?",
        a: "PLA costuma ser ideal para protótipos de forma. Para testes funcionais, PETG, ABS ou ASA podem ser mais adequados, conforme o esforço.",
      },
      {
        q: "Vocês assinam acordo de confidencialidade?",
        a: "Informe essa necessidade no formulário de orçamento para combinarmos as condições do projeto.",
      },
    ],
    related: [
      { href: "/modelagem-3d", label: "Modelagem 3D" },
      { href: "/blog/o-que-e-prototipagem-3d", label: "O que é prototipagem 3D?" },
      { href: "/projetos?categoria=prototipos", label: "Ver protótipos" },
    ],
    ctaTitle: "Vamos tirar seu produto do papel?",
  },
};
