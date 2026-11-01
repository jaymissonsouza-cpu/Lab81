import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // Build autocontido para rodar em VPS (node .next/standalone/server.js)
  output: "standalone",
  poweredByHeader: false,
  // Modelo de cache clássico (revalidate + revalidatePath): previsível para conteúdo vindo do SQLite.
  cacheComponents: false,
  serverExternalPackages: ["better-sqlite3"],
  // Nunca empacotar dados locais (banco, uploads), segredos ou referências no build
  outputFileTracingExcludes: {
    "*": ["storage/**", "docs/**", ".env*", "scripts/**", "*.md", "src/**"],
  },
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    localPatterns: [{ pathname: "/demo/**" }, { pathname: "/brand/**" }, { pathname: "/media/**" }],
  },
  experimental: {
    serverActions: {
      // Upload de imagens no painel administrativo
      bodySizeLimit: "25mb",
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  async redirects() {
    return [
      { source: "/servico", destination: "/servicos", permanent: true },
      { source: "/portfolio", destination: "/projetos", permanent: true },
      { source: "/loja", destination: "/produtos", permanent: true },
      { source: "/orcamentos", destination: "/orcamento", permanent: true },
    ];
  },
};

export default nextConfig;
