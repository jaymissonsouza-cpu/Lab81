import { PageHeader } from "@/components/site/PageHeader";
import { getSettings } from "@/lib/repos";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export function generateMetadata() {
  return pageMetadata({
    path: "/politica-de-privacidade",
    title: "Política de privacidade",
    description: "Como a LAB81 Studio coleta, utiliza e protege os dados pessoais enviados pelo site, em conformidade com a LGPD.",
  });
}

export default function PrivacidadePage() {
  const s = getSettings();
  const controller = s.legal_name ? `${s.legal_name}${s.cnpj ? `, CNPJ ${s.cnpj}` : ""}` : "LAB81 Studio";
  return (
    <>
      <PageHeader eyebrow="LGPD" title="Política de privacidade." crumbs={[{ name: "Política de privacidade", path: "/politica-de-privacidade" }]} />
      <div className="container-site">
        {/* REVISAR COM ASSESSORIA JURÍDICA antes da publicação definitiva */}
        <div className="prose-lab max-w-3xl">
          <p>
            Esta política explica como <strong>{controller}</strong> (&quot;LAB81&quot;) trata os dados pessoais enviados por este site, em
            conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
          <h2>Quais dados coletamos</h2>
          <ul>
            <li>
              <strong>Formulário de orçamento:</strong> nome, e-mail, telefone/WhatsApp, cidade, informações do projeto e arquivos
              enviados (modelos 3D, fotos e referências).
            </li>
            <li>
              <strong>Formulário de contato:</strong> nome, e-mail, telefone (opcional) e mensagem.
            </li>
            <li>
              <strong>Mensuração:</strong> somente com o seu consentimento, dados de navegação coletados por ferramentas como Google
              Tag Manager e Google Analytics.
            </li>
          </ul>
          <h2>Para que usamos</h2>
          <ul>
            <li>Analisar sua solicitação, elaborar propostas e executar o serviço contratado.</li>
            <li>Responder mensagens e manter contato sobre o seu pedido.</li>
            <li>Com consentimento, entender o uso do site para melhorá-lo.</li>
          </ul>
          <h2>Arquivos enviados</h2>
          <p>
            Os arquivos anexados ao orçamento são armazenados em ambiente restrito, acessível apenas à equipe da LAB81, e usados
            exclusivamente para avaliar e executar o seu projeto. Não compartilhamos seus arquivos ou projetos com terceiros nem os
            publicamos sem sua autorização.
          </p>
          <h2>Compartilhamento</h2>
          <p>
            Podemos utilizar fornecedores que nos ajudam a operar o site (hospedagem, envio de e-mails e ferramentas de mensuração),
            que tratam os dados conforme nossas instruções.
          </p>
          <h2>Por quanto tempo guardamos</h2>
          <p>Mantemos os dados pelo tempo necessário para atender à solicitação e cumprir obrigações legais.</p>
          <h2>Seus direitos</h2>
          <p>
            Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados e revogar o consentimento a qualquer
            momento
            {s.email ? (
              <>
                {" "}pelo e-mail <a href={`mailto:${s.email}`}>{s.email}</a>
              </>
            ) : (
              " pelos canais informados na página de contato"
            )}
            .
          </p>
          <h2>Cookies</h2>
          <p>
            Cookies de mensuração só são ativados após o seu consentimento. Você pode alterar sua escolha a qualquer momento pelo
            link &quot;Preferências de cookies&quot;, no rodapé do site.
          </p>
          <p className="text-sm text-titanium-600">Última atualização: novembro de 2026.</p>
        </div>
      </div>
    </>
  );
}
