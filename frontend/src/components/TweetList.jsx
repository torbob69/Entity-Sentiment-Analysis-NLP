import TweetCard from "./TweetCard";

export default function TweetList({ tweet_entries, positive_count, negative_count, on_select }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col">
        <p className="text-white/40 text-xs">Showing tweets for</p>
        <h2 className="text-white text-2xl font-bold">
          {positive_count} Positives and {negative_count} Negatives
        </h2>
      </div>
      <div className="flex flex-col gap-0 border-x border-white/20">
        {tweet_entries.map(([url, tweet]) => (
          <TweetCard key={url} url={url} tweet={tweet} on_double_click={() => on_select(url, tweet)} />
        ))}
      </div>
    </div>
  );
}
