import { ExternalLink } from "lucide-react";

const is_positive = (s) => s?.toLowerCase().includes("pos");

export default function TweetCard({ url, tweet, on_double_click }) {
  const pos = is_positive(tweet.result.overall_sentiment);
  return (
    <div
      onDoubleClick={on_double_click}
      className="flex flex-col gap-2 px-4 py-4 border-y border-white/20 hover:bg-white/5 transition-colors cursor-pointer select-none"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={`https://unavatar.io/twitter/${tweet.author_handle}`}
            alt={tweet.author_name}
            className="w-8 h-8 rounded-full bg-white/10 shrink-0 object-cover"
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
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${pos ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
          >
            {pos ? "Positive" : "Negative"}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-white/20 hover:text-white/60 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
      <p className="text-white/70 text-sm leading-relaxed pl-10">{tweet.text}</p>
    </div>
  );
}
