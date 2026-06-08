export default function FilterPanel({ filters, update_filter, today }) {
  return (
    <div className="w-56 rounded-3xl p-4 flex flex-col gap-4 backdrop-blur-sm sticky top-4 border border-white/20">
      <h2 className="text-white text-xl">Filter</h2>
      <label className="flex flex-col gap-1">
        <span className="text-white/40 text-xs">Limit</span>
        <input
          type="number"
          min={50}
          max={999}
          value={filters.limit}
          onChange={(e) => update_filter("limit", Number(e.target.value))}
          className="bg-transparent border border-white/20 rounded-full px-3 py-1.5 text-white text-sm outline-none focus:border-white/50 transition-colors"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-white/40 text-xs">Min Likes</span>
        <input
          type="number"
          min={0}
          value={filters.min_likes}
          onChange={(e) => update_filter("min_likes", Number(e.target.value))}
          className="bg-transparent border border-white/20 rounded-full px-3 py-1.5 text-white text-sm outline-none focus:border-white/50 transition-colors"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-white/40 text-xs">Since</span>
        <input
          type="date"
          value={filters.since}
          max={filters.until}
          onChange={(e) => update_filter("since", e.target.value)}
          className="bg-transparent border border-white/20 rounded-full px-3 py-1.5 text-white text-sm outline-none focus:border-white/50 transition-colors [color-scheme:dark]"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-white/40 text-xs">Until</span>
        <input
          type="date"
          value={filters.until}
          min={filters.since}
          max={today}
          onChange={(e) => update_filter("until", e.target.value)}
          className="bg-transparent border border-white/20 rounded-full px-3 py-1.5 text-white text-sm outline-none focus:border-white/50 transition-colors [color-scheme:dark]"
        />
      </label>
      <div className="flex flex-col gap-1">
        <span className="text-white/40 text-xs">Verified</span>
        <div className="flex flex-col gap-1.5">
          {[{ label: "All", value: false }, { label: "Verified only", value: true }].map(({ label, value }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={filters.verified_only === value}
                onChange={() => update_filter("verified_only", value)}
                className="accent-sky-500 w-3.5 h-3.5"
              />
              <span className="text-white/70 text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
