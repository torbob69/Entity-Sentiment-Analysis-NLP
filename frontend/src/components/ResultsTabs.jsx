import TweetList from "./TweetList";
import EntityList from "./EntityList";

const TABS = [
  { key: "tweets", label: "All Tweets" },
  { key: "entities", label: "Entity Group" },
];

export default function ResultsTabs({
  active_tab,
  set_active_tab,
  tweet_entries,
  positive_count,
  negative_count,
  entities,
  on_select_tweet,
}) {
  return (
    <div className="w-full flex flex-col gap-4 pb-12">
      <div className="flex gap-1 border-b border-white/10">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => set_active_tab(key)}
            className={`px-4 py-2 text-sm transition-all duration-200 border-b-2 -mb-px ${active_tab === key ? "text-white border-sky-500" : "text-white/40 border-transparent hover:text-white/70"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {active_tab === "tweets" && (
        <TweetList
          tweet_entries={tweet_entries}
          positive_count={positive_count}
          negative_count={negative_count}
          on_select={on_select_tweet}
        />
      )}
      {active_tab === "entities" && <EntityList entities={entities} />}
    </div>
  );
}
