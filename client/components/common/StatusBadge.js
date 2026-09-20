export default function StatusBadge({ status }) {
  const style = status === "completed" ? "bg-[#e2f3e9] text-[#236243]" : status === "failed" ? "bg-[#fde8e7] text-[#a33835]" : "bg-[#fff1cf] text-[#8a5a00]";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${style}`}>{status || "processing"}</span>;
}