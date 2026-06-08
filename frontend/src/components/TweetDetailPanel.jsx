import { X } from "lucide-react";

const is_positive = (s) => s?.toLowerCase().includes("pos");

export default function TweetDetailPanel({ url, tweet, on_close }) {
  const pos = is_positive(tweet.result.overall_sentiment);

  return (
    <div className="w-72 rounded-3xl p-4 flex flex-col gap-4 backdrop-blur-sm sticky top-4 border border-white/20">
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs uppercase tracking-widest">Detail</span>
        <button
          onClick={on_close}
          className="text-white/30 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Author */}
      <div className="flex items-center gap-2">
        <img
          src={`https://unavatar.io/twitter/${tweet.author_handle}`}
          alt={tweet.author_name}
          className="w-9 h-9 rounded-full bg-white/10 shrink-0 object-cover"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-white text-sm font-medium truncate">
            {tweet.author_name ?? "Unknown"}
          </span>
          <span className="text-white/40 text-xs truncate">
            {tweet.author_handle ? `@${tweet.author_handle}` : ""}
          </span>
        </div>
      </div>

      {/* Tweet text */}
      <p className="text-white/70 text-sm leading-relaxed">{tweet.text}</p>

      {/* Overall sentiment */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-white/40 text-xs">Overall Sentiment</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${pos ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
        >
          {pos ? "Positive" : "Negative"}
        </span>
      </div>

      {/* Entities */}
      <div className="flex flex-col gap-2">
        <span className="text-white/40 text-xs">
          {tweet.result.entities.length === 0
            ? "No entities detected"
            : `${tweet.result.entities.length} ${tweet.result.entities.length === 1 ? "Entity" : "Entities"} Detected`}
        </span>
        {tweet.result.entities.map((e, i) => {
          const epos = is_positive(e.sentiment);
          return (
            <div key={i} className="flex flex-col gap-1 rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white text-sm font-medium truncate">{e.entity}</span>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${epos ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {epos ? "Positive" : "Negative"}
                </span>
              </div>
              {e.action && (
                <p className="text-white/40 text-xs leading-relaxed">{e.action}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Link */}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-sky-400/70 hover:text-sky-400 text-xs transition-colors"
      >
        View on X →
      </a>
    </div>
  );
}
