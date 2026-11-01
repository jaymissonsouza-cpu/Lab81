/**
 * Artigos iniciais do blog. Conteúdo original, sem preços, estatísticas ou casos inventados.
 * Após a primeira execução, os artigos passam a ser editados no painel (/admin/blog).
 */
export type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  seo_title: string;
  seo_description: string;
};

export const BLOG_POSTS: SeedPost[] = [
  {
    slug: "quanto-custa-uma-impressao-3d",
    title: "Quanto custa uma impressão 3D?",
    excerpt: "Entenda os fatores que formam o preço de uma peça impressa em 3D e como pedir um orçamento mais preciso.",
    published_at: "2026-11-01",
    seo_title: "Quanto custa uma impressão 3D? Entenda o que forma o preço",
    seo_description:
      "Material, tamanho, tempo de máquina, modelagem e acabamento: veja o que influencia o preço de uma impressão 3D e como pedir um orçamento preciso.",
    content: `Não existe um preço fixo por peça. O valor de uma impressão 3D depende do objeto, do material e do trabalho envolvido antes e depois da impressão. Por isso, desconfie de tabelas genéricas: duas peças do mesmo tamanho podem ter custos bem diferentes.

## O que entra no cálculo

### 1. Tempo de máquina
É, na maioria dos casos, o fator mais importante. Uma peça alta, com paredes grossas ou com muitos detalhes finos ocupa a impressora por mais horas. A altura de camada também pesa: camadas mais finas deixam a superfície mais lisa, mas aumentam o tempo de impressão.

### 2. Material
Cada filamento tem um custo e um comportamento. O **PLA** é o mais simples de imprimir; **PETG**, **ABS** e **ASA** oferecem mais resistência mecânica, térmica ou a raios UV, mas exigem mais controle no processo. A quantidade de material depende do volume da peça e do preenchimento interno escolhido.

### 3. Modelagem 3D
Se você já tem um arquivo pronto (STL, OBJ ou 3MF), esta etapa pode nem existir. Se a peça precisa ser desenhada a partir de um esboço, de uma foto ou de medidas de um objeto quebrado, o tempo de modelagem entra no orçamento.

### 4. Preparação e ajustes
Mesmo arquivos prontos às vezes precisam de correções: malhas abertas, paredes finas demais ou partes que não se sustentam durante a impressão.

### 5. Acabamento
Remoção de suportes, lixamento, montagem de partes e outros acabamentos manuais aumentam a qualidade final e também o tempo de trabalho.

### 6. Quantidade
Em pequenas séries, parte do trabalho de preparação é compartilhada entre as peças, o que pode reduzir o custo por unidade.

## Como receber um orçamento mais preciso

- Envie o arquivo 3D, se tiver.
- Se não tiver, mande fotos, um esboço e **medidas aproximadas**.
- Conte para que a peça será usada: decoração, encaixe, uso externo, contato com calor.
- Informe a quantidade e se existe um prazo.

Com essas informações, conseguimos indicar o material adequado e montar uma proposta personalizada. Na LAB81, cada orçamento é analisado individualmente, sem cálculo automático genérico.

[Solicite seu orçamento](/orcamento) e receba uma proposta para o seu projeto.`,
  },
  {
    slug: "como-funciona-a-impressao-3d",
    title: "Como funciona a impressão 3D?",
    excerpt: "Do arquivo digital à peça física: o passo a passo da impressão 3D por filamento, explicado sem complicação.",
    published_at: "2026-11-01",
    seo_title: "Como funciona a impressão 3D? Guia simples da fabricação aditiva",
    seo_description:
      "Entenda como a impressão 3D por filamento transforma um modelo digital em objeto físico, camada por camada, e quando ela é a melhor escolha.",
    content: `A impressão 3D é um processo de **fabricação aditiva**: em vez de cortar ou esculpir um bloco de material, a máquina constrói o objeto adicionando material, uma camada fina sobre a outra.

## As etapas

### 1. O modelo digital
Tudo começa com um arquivo 3D, criado em um software de modelagem ou obtido por escaneamento. Ele descreve a geometria da peça. Os formatos mais usados são STL, OBJ, 3MF e, em projetos de engenharia, STEP.

### 2. O fatiamento
Um software chamado *fatiador* divide o modelo em centenas ou milhares de camadas horizontais e gera as instruções que a impressora vai seguir. Nesta etapa são definidos a altura de camada, a espessura das paredes, o preenchimento interno e os suportes.

### 3. A impressão
Na tecnologia **FDM** (modelagem por deposição fundida), um filamento plástico é aquecido e depositado por um bico que se move com precisão. Cada camada se funde à anterior. É por isso que, olhando de perto, uma peça impressa revela linhas horizontais: são as camadas que a formaram.

### 4. O acabamento
Depois da impressão, os suportes são removidos e a peça pode receber acabamentos, como lixamento ou montagem de partes.

## Quando a impressão 3D é a melhor escolha

- **Peças únicas ou pequenas séries**, em que fazer um molde não compensa.
- **Protótipos**, para testar forma, encaixe e função antes da produção.
- **Geometrias complexas**, como estruturas vazadas e formas orgânicas difíceis de fabricar por outros métodos.
- **Peças de reposição** que não são mais vendidas.

## E quando talvez não seja

Para milhares de peças idênticas, processos como injeção plástica costumam ser mais econômicos. Para superfícies espelhadas ou tolerâncias muito apertadas, pode ser necessário combinar a impressão com outros processos.

Quer entender se o seu projeto é viável? [Fale com a LAB81](/orcamento).`,
  },
  {
    slug: "pla-ou-petg-qual-escolher",
    title: "PLA ou PETG: qual escolher?",
    excerpt: "Comparamos os dois filamentos mais usados na impressão 3D para ajudar você a escolher o material certo para cada peça.",
    published_at: "2026-11-01",
    seo_title: "PLA ou PETG: qual filamento escolher para sua peça?",
    seo_description:
      "Diferenças entre PLA e PETG em acabamento, resistência, temperatura e uso. Saiba qual material é mais indicado para o seu projeto de impressão 3D.",
    content: `PLA e PETG são os filamentos mais comuns na impressão 3D. Os dois são ótimos, mas para usos diferentes. A escolha certa depende de onde a peça vai ficar e do esforço que ela vai sofrer.

## PLA

O PLA é fácil de imprimir, tem ótima precisão dimensional e bom acabamento visual.

**Indicado para:** decoração, maquetes, protótipos de forma, luminárias com LED de baixo aquecimento, objetos que ficam em ambiente interno.

**Atenção:** começa a amolecer em temperaturas relativamente baixas. Não é a melhor opção para peças dentro de carro ao sol ou perto de fontes de calor.

## PETG

O PETG é mais tenaz: em vez de quebrar de forma frágil, tende a flexionar um pouco antes de falhar. Também resiste melhor à umidade e a temperaturas um pouco mais altas que o PLA.

**Indicado para:** peças funcionais, suportes, encaixes, peças que sofrem impacto ou ficam em ambiente úmido.

**Atenção:** o acabamento pode ser um pouco menos nítido em detalhes muito finos.

## Comparação rápida

| Critério | PLA | PETG |
|---|---|---|
| Facilidade de impressão | Alta | Média |
| Acabamento e detalhes | Excelente | Bom |
| Resistência a impacto | Média | Alta |
| Resistência ao calor | Baixa | Média |
| Uso típico | Decoração e protótipos | Peças funcionais |

## E ABS ou ASA?

Quando a peça precisa suportar mais calor, ou ficar exposta ao sol, ABS e ASA entram na conversa. O ASA, em especial, tem boa resistência a raios UV, o que o torna interessante para uso externo.

## Na dúvida, pergunte

Você não precisa saber qual material escolher. No [formulário de orçamento](/orcamento), marque "Não sei, quero orientação" e conte como a peça será usada. A equipe indica a melhor opção.`,
  },
  {
    slug: "como-encomendar-uma-peca-impressa-em-3d",
    title: "Como encomendar uma peça impressa em 3D?",
    excerpt: "Um guia prático para quem nunca encomendou uma impressão 3D: o que enviar, o que esperar e como evitar retrabalho.",
    published_at: "2026-11-01",
    seo_title: "Como encomendar uma peça impressa em 3D: passo a passo",
    seo_description:
      "Saiba o que enviar, como informar medidas e o que acontece entre o pedido e a entrega de uma peça impressa em 3D.",
    content: `Encomendar uma peça impressa em 3D é mais simples do que parece. Você não precisa dominar softwares nem conhecer os materiais: basta descrever bem o que precisa.

## 1. Reúna o que você tem

Qualquer uma destas opções serve como ponto de partida:

- **Arquivo 3D** (STL, OBJ, 3MF ou STEP), se você ou alguém já modelou a peça.
- **Fotos** do objeto que você quer reproduzir ou consertar, de preferência com uma régua ou trena aparecendo.
- **Esboço** à mão com as medidas principais.
- **Referências** de peças parecidas.

## 2. Informe as medidas

Medidas aproximadas já ajudam muito. Para peças de encaixe, informe as medidas críticas com mais cuidado: diâmetro de furos, distância entre furos, espessura onde a peça vai encaixar.

## 3. Conte como a peça será usada

Ela vai ficar ao sol? Vai suportar peso? Vai ter contato com água? Essas respostas definem o material e a forma de impressão.

## 4. Envie a solicitação

No [formulário de orçamento](/orcamento) você envia arquivos e fotos, escolhe material e quantidade, e recebe um número de protocolo para acompanhar a solicitação.

## 5. Análise e proposta

A equipe avalia a viabilidade, sugere ajustes quando necessário e envia uma proposta personalizada com valor e prazo.

## 6. Fabricação e entrega

Com a proposta aprovada, a peça é modelada (se necessário), impressa, recebe os acabamentos combinados e segue para entrega ou retirada.

## Dica para evitar retrabalho

Quando a peça precisa encaixar em algo que já existe, considere encomendar primeiro um protótipo rápido para testar as medidas. Isso economiza tempo e material na versão final.`,
  },
  {
    slug: "o-que-e-prototipagem-3d",
    title: "O que é prototipagem 3D?",
    excerpt: "Por que imprimir um protótipo antes de produzir? Veja como a prototipagem 3D reduz riscos e acelera o desenvolvimento de produtos.",
    published_at: "2026-11-01",
    seo_title: "O que é prototipagem 3D e quando ela vale a pena",
    seo_description:
      "Entenda o que é prototipagem 3D, os tipos de protótipo e como ela ajuda a validar forma, encaixe e função antes da produção.",
    content: `Prototipagem 3D é o uso da impressão 3D para criar versões físicas de um produto **antes** da produção final. Em vez de discutir uma ideia apenas na tela, você segura a peça, testa e decide com base no objeto real.

## Por que prototipar

- **Reduzir riscos.** Erros de medida ou de ergonomia aparecem cedo, quando ainda são baratos de corrigir.
- **Acelerar decisões.** Um protótipo na mão facilita conversas com sócios, clientes e fornecedores.
- **Iterar rápido.** É possível testar várias versões em sequência, ajustando o modelo entre uma e outra.

## Tipos de protótipo

### Protótipo de forma
Mostra aparência, proporção e volume. Útil para apresentações e validação estética.

### Protótipo de encaixe
Testa se as peças se encaixam entre si ou em um produto existente. Aqui a precisão das medidas é o mais importante.

### Protótipo funcional
Testa o uso real: resistência, movimento, montagem. O material precisa ser escolhido conforme o esforço esperado.

## Como funciona na prática

1. Você apresenta a ideia, o esboço ou o modelo.
2. Desenvolvemos ou ajustamos o modelo 3D.
3. Imprimimos a primeira versão.
4. Você testa e devolve o que precisa mudar.
5. Repetimos até chegar à versão final.

## Limites que vale conhecer

Um protótipo impresso em filamento pode não reproduzir exatamente o comportamento de uma peça injetada em série. Ele é excelente para validar forma e encaixe e muito útil em testes funcionais, mas a validação final deve considerar o processo de produção definitivo.

Conheça nosso [serviço de prototipagem 3D](/prototipagem-3d).`,
  },
  {
    slug: "quais-arquivos-sao-usados-para-impressao-3d",
    title: "Quais arquivos são usados para impressão 3D?",
    excerpt: "STL, OBJ, 3MF e STEP: o que cada formato guarda e qual enviar ao pedir um orçamento.",
    published_at: "2026-11-01",
    seo_title: "Arquivos para impressão 3D: STL, OBJ, 3MF ou STEP?",
    seo_description:
      "Conheça os formatos de arquivo usados na impressão 3D, suas diferenças e qual deles enviar para um orçamento.",
    content: `Ao pedir uma impressão 3D, a primeira pergunta costuma ser: "você tem o arquivo?". Veja o que cada formato significa.

## STL

O formato mais comum. Descreve a superfície da peça como uma malha de triângulos. É simples e aceito por praticamente qualquer software de impressão, mas não guarda cor, unidade de medida nem histórico de modelagem.

**Dica:** confirme se o arquivo foi exportado em milímetros. Um STL não diz a unidade e uma peça pode aparecer 10 ou 25 vezes maior ou menor do que deveria.

## OBJ

Também é uma malha, mas pode guardar informações de cor e textura. Comum em modelos vindos de softwares de animação e escultura digital.

## 3MF

Formato mais moderno, criado especificamente para impressão 3D. Guarda unidades, cores, materiais e várias peças em um único arquivo. Quando disponível, é uma ótima escolha.

## STEP (.step / .stp)

Formato de engenharia (CAD). Diferente dos anteriores, descreve a geometria de forma matemática exata, o que é útil quando a peça precisa ser **alterada** antes da impressão: ajustar um furo ou mudar uma espessura, por exemplo.

## Qual enviar?

- Tem o projeto em CAD? Envie o **STEP** e, se possível, também um STL.
- Baixou um modelo pronto? Envie o arquivo como veio (geralmente **STL** ou **3MF**).
- Não tem arquivo? Sem problema: envie **fotos e medidas**. Fazemos a [modelagem 3D](/modelagem-3d) a partir delas.

No [formulário de orçamento](/orcamento) você pode anexar arquivos STL, OBJ, 3MF e STEP.`,
  },
  {
    slug: "como-preparar-um-modelo-para-impressao-3d",
    title: "Como preparar um modelo para impressão 3D",
    excerpt: "Cuidados de modelagem que evitam falhas: espessura de parede, malha fechada, ângulos e tolerâncias de encaixe.",
    published_at: "2026-11-01",
    seo_title: "Como preparar um modelo 3D para impressão: checklist",
    seo_description:
      "Espessura mínima, malha fechada, balanços, tolerâncias de encaixe e orientação: o que verificar no seu modelo antes de imprimir.",
    content: `Um modelo bonito na tela nem sempre está pronto para virar objeto. Estes cuidados evitam falhas e retrabalho.

## 1. Malha fechada ("watertight")

O modelo precisa ser um volume fechado, sem buracos ou faces soltas. Malhas abertas confundem o fatiador e podem gerar peças com falhas.

## 2. Espessura de parede

Paredes muito finas podem não ser impressas ou ficar frágeis. Como referência geral para impressão por filamento, evite paredes mais finas do que algumas vezes o diâmetro do bico da impressora. Em peças funcionais, paredes mais grossas aumentam a resistência.

## 3. Balanços e suportes

Partes que "flutuam" sobre o vazio precisam de suportes. Ângulos muito abertos em relação à vertical também. Sempre que possível, desenhe chanfros em vez de balanços horizontais: a peça fica mais limpa e economiza material.

## 4. Tolerâncias de encaixe

Duas peças desenhadas com a mesma medida exata provavelmente não vão encaixar. Deixe uma pequena folga entre partes móveis ou de encaixe. O valor ideal depende do material e da máquina, por isso, em encaixes críticos, vale imprimir um teste antes.

## 5. Orientação de impressão

A peça é mais resistente ao longo das camadas do que entre elas. Pense em como a força vai agir sobre a peça e oriente a impressão para que as camadas não sejam "descoladas" pelo esforço.

## 6. Unidades e escala

Exporte em milímetros e confira as medidas principais antes de enviar.

## Não quer se preocupar com isso?

Todo arquivo recebido pela LAB81 passa por uma análise técnica antes da impressão. Se algo precisar de ajuste, avisamos e sugerimos a correção. Veja também nosso serviço de [modelagem 3D](/modelagem-3d).`,
  },
  {
    slug: "quando-vale-a-pena-fabricar-uma-peca-sob-demanda",
    title: "Quando vale a pena fabricar uma peça sob demanda?",
    excerpt: "Reposição, personalização, pequenas séries e protótipos: situações em que a fabricação sob demanda faz mais sentido.",
    published_at: "2026-11-01",
    seo_title: "Quando vale a pena fabricar uma peça sob demanda com impressão 3D",
    seo_description:
      "Descubra em que situações a fabricação sob demanda por impressão 3D é a melhor escolha: reposição, personalização, pequenas séries e protótipos.",
    content: `Fabricar sob demanda significa produzir apenas o que é necessário, quando é necessário, sem moldes e sem estoque. A impressão 3D tornou isso viável para muitas situações do dia a dia.

## Situações em que costuma valer a pena

### Peça de reposição que não existe mais
Aquele suporte, tampa ou engrenagem plástica que quebrou e não é mais vendida. Com medidas ou fotos, é possível modelar e fabricar uma nova.

### Personalização
Objetos com nome, medidas específicas ou adaptados a um espaço. Na produção em série isso seria inviável; sob demanda, cada peça pode ser única.

### Pequenas séries
De uma a algumas dezenas de unidades, a impressão 3D evita o custo de um molde.

### Protótipos e testes
Antes de investir em produção, é possível validar a ideia com peças reais.

### Peças com geometria complexa
Estruturas vazadas, formas orgânicas e encaixes internos que seriam caros ou impossíveis de fabricar por outros métodos.

## Quando talvez não valha

- Grandes volumes de peças idênticas, em que processos como injeção ficam mais econômicos.
- Peças que exigem propriedades de materiais que o filamento não oferece, como resistência a temperaturas muito altas.

## Como decidir

Comece pela pergunta: **qual é o uso da peça e quantas unidades são necessárias?** Com isso, conseguimos indicar se a impressão 3D é o melhor caminho ou se outro processo faz mais sentido.

[Conte sua ideia](/orcamento) e receba uma orientação personalizada.`,
  },
];
