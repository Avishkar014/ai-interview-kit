export default function IconMark({ children, tone = "green" }) {
  return <span className={`icon-mark icon-mark-${tone}`} aria-hidden="true">{children}</span>;
}
