import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/repos";
import { AdminForm } from "@/components/admin/AdminForm";
import { Field, Section, TextArea } from "@/components/admin/Fields";
import { saveSettingsAction } from "../../actions";

export const metadata = { title: "Configurações" };

export default async function SettingsPage() {
  await requireAdmin();
  const s = getSettings();
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold">Configurações</h1>
      <p className="mt-2 text-titanium">Somente informações verdadeiras: campos vazios simplesmente não aparecem no site.</p>
      <AdminForm action={saveSettingsAction} className="mt-8">
        <Section title="Contato">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="WhatsApp" name="whatsapp" defaultValue={s.whatsapp} placeholder="(81) 9 0000-0000" hint="Ativa o botão flutuante e os links de WhatsApp." />
            <Field label="Telefone" name="phone" defaultValue={s.phone} />
            <Field label="E-mail comercial" name="email" type="email" defaultValue={s.email} />
            <Field label="Instagram" name="instagram" defaultValue={s.instagram} placeholder="@lab81studio" />
          </div>
        </Section>
        <Section title="Localização e atendimento" description="O endereço só é publicado (e usado em dados estruturados LocalBusiness) se preenchido. Deixe vazio se não houver atendimento presencial.">
          <Field label="Endereço" name="address" defaultValue={s.address} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Cidade" name="city" defaultValue={s.city} />
            <Field label="UF" name="region" defaultValue={s.region} />
          </div>
          <TextArea label="Área de atendimento" name="service_area" defaultValue={s.service_area} rows={2} />
          <Field label="Horário de atendimento" name="business_hours" defaultValue={s.business_hours} placeholder="Seg. a sex., 9h às 18h" />
        </Section>
        <Section title="Dados legais">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Razão social" name="legal_name" defaultValue={s.legal_name} />
            <Field label="CNPJ" name="cnpj" defaultValue={s.cnpj} />
          </div>
        </Section>
        <Section title="Formulário de orçamento">
          <Field label="Materiais disponíveis" name="materials" defaultValue={s.materials.join(", ")} hint="Separados por vírgula." />
          <Field label="Cores disponíveis" name="colors" defaultValue={s.colors.join(", ")} hint="Separadas por vírgula. Vazio = campo de texto livre no formulário." />
          <Field label="Tamanho máximo por arquivo 3D (MB)" name="max_model_mb" type="number" defaultValue={s.max_model_mb} hint="Entre 5 e 100. Ajuste também o limite do proxy (Nginx client_max_body_size)." />
        </Section>
      </AdminForm>
    </div>
  );
}
