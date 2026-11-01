export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
  align = "left",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  id?: string;
  align?: "left" | "center";
  as?: "h2" | "h3";
}) {
  const endsWithPunct = /[.?!]$/.test(title);
  return (
    <div className={`reveal ${align === "center" ? "mx-auto text-center" : ""} max-w-3xl`}>
      {eyebrow && <p className={`eyebrow ${align === "center" ? "" : "eyebrow--lead"}`}>{eyebrow}</p>}
      <Tag id={id} className="mt-4 text-h2">
        {endsWithPunct ? title.slice(0, -1) : title}
        <span className="dot">{endsWithPunct ? title.slice(-1) : "."}</span>
      </Tag>
      {lead && <p className="mt-5 text-lead text-titanium">{lead}</p>}
    </div>
  );
}
