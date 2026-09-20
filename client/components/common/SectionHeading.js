export default function SectionHeading({ eyebrow, title, description, action }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>{description && <p className="mt-2 max-w-2xl text-[var(--muted)]">{description}</p>}</div>{action}</div>;
}
