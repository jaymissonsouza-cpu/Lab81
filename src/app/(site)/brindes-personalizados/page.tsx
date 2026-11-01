import { ServicePageView } from "@/components/site/ServicePageView";
import { SERVICE_PAGES } from "@/content/services";
import { pageMetadata } from "@/lib/seo";

const page = SERVICE_PAGES["brindes-personalizados"];

export function generateMetadata() {
  return pageMetadata({ path: page.path, title: page.metaTitle, description: page.metaDescription, image: page.image.src });
}

export default function Page() {
  return <ServicePageView page={page} name="Brindes e chaveiros personalizados" />;
}
