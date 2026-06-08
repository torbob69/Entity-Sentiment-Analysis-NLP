export default function EntityList({ entities }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col">
        <p className="text-white/40 text-xs">Showing detected entities</p>
        <h2 className="text-white text-2xl font-bold">
          {entities.length} {entities.length === 1 ? "Entity" : "Entities"} Found
        </h2>
      </div>
      {entities.length === 0 && (
        <p className="text-white/40 text-sm text-center py-8">No entities found.</p>
      )}
      {entities.map((e) => {
        const pos_pct = Math.round((e.positive / e.total) * 100);
        const neg_pct = 100 - pos_pct;
        return (
          <div
            key={e.name}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-white font-medium text-sm">{e.name}</p>
              <p className="text-white/40 text-xs">
                {e.total} mention{e.total !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
              <div
                className="h-full bg-green-500 transition-all duration-700"
                style={{ width: `${pos_pct}%` }}
              />
              <div
                className="h-full bg-red-500 transition-all duration-700"
                style={{ width: `${neg_pct}%` }}
              />
            </div>
            <div className="flex gap-3 text-xs text-white/40">
              <span className="text-green-400/70">{e.positive} positive</span>
              <span className="text-red-400/70">{e.negative} negative</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
