// src/components/TableRow.jsx
export default function TableRow({ columns = [], row = {} }) {
  return (
    <div className="grid grid-cols-[repeat(7,1fr)] text-[0.8rem] text-[var(--color-text)] px-[12px] py-[10px] border-b border-[var(--color-border)] hover:bg-[var(--color-hover-bg)] transition">
      {columns.map((col) => (
        <div key={col.key} className="truncate pr-[8px]">
          {row[col.key] ?? '-'}
        </div>
      ))}
    </div>
  )
}
