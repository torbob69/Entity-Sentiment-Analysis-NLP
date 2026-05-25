import { useEffect, useState, useRef } from "react";
import { Search, SlidersHorizontal, X, LogOut } from "lucide-react";
import Logo from "../components/logo";
import { useNavigate } from "react-router-dom";
import backend_url from "../../constants";

const today = new Date().toISOString().split("T")[0];
const jan1 = `${new Date().getFullYear()}-01-01`;

const is_positive = (sentiment) => sentiment?.toLowerCase().includes("pos");

function group_entities(results) {
  const groups = {};
  Object.values(results).forEach((tweet) => {
    tweet.result.entities.forEach((e) => {
      const key = e.entity.toLowerCase().trim();
      if (!groups[key]) {
        groups[key] = { name: key, positive: 0, negative: 0, total: 0 };
      }
      groups[key].total++;
      if (is_positive(e.sentiment)) groups[key].positive++;
      else groups[key].negative++;
    });
  });
  return Object.values(groups).sort((a, b) => b.total - a.total);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [curr_greeting, set_greeting] = useState("");
  const [centered, set_centered] = useState(true);
  const [searched, set_searched] = useState(false);
  const [filters_open, set_filters_open] = useState(false);
  const [loading, set_loading] = useState(false);
  const [results, set_results] = useState(null);
  const [active_tab, set_active_tab] = useState("tweets");
  const [error, set_error] = useState(null);

  const [query, set_query] = useState("");
  const [filters, set_filters] = useState({
    limit: 50,
    min_likes: 0,
    verified_only: false,
    since: jan1,
    until: today,
  });

  const greeting_element = useRef();
  const logo_element = useRef();
  const search_element = useRef();
  const placeholder = "find your topic or people to be analyzed..";

  const greetings = [
    "Hi, welcome",
    "Let's explore our sentiment analysis tool",
    "Analyze things, events, entities, and more.",
  ];

  const update_filter = (key, value) =>
    set_filters((prev) => ({ ...prev, [key]: value }));

  const handle_search = async () => {
    if (!query.trim()) return;
    set_searched(true);
    set_filters_open(false);
    set_loading(true);
    set_results(null);
    set_error(null);

    try {
      const res = await fetch(`${backend_url}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Access-Token": sessionStorage.getItem("access_token") || "",
          "X-Access-Token-Secret": sessionStorage.getItem("access_token_secret") || "",
        },
        body: JSON.stringify({ search_query: query, language: "en", ...filters }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Something went wrong");
      }
      const data = await res.json();
      set_results(data);
    } catch (e) {
      set_error(e.message);
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    const secret = params.get("access_token_secret");
    if (token && secret) {
      sessionStorage.setItem("access_token", token);
      sessionStorage.setItem("access_token_secret", secret);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const timers = [];
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); };

    let greetings_end = 1000 + (greetings.length - 1) * 3000 + 3000;
    if (localStorage.getItem("greeted")) {
      greetings_end = 1500;
    } else {
      greetings.forEach((g, i) => {
        later(() => {
          const el = greeting_element.current;
          if (!el) return;
          el.classList.remove("opacity-100");
          el.classList.add("opacity-0");
          later(() => {
            if (!greeting_element.current) return;
            set_greeting(g);
            greeting_element.current.classList.remove("opacity-0");
            greeting_element.current.classList.add("opacity-100");
          }, 1000);
        }, 1000 + i * 3000);
      });
    }

    later(() => {
      const el = greeting_element.current;
      if (!el) return;
      el.classList.remove("opacity-100");
      el.classList.add("opacity-0");
      later(() => {
        if (!greeting_element.current) return;
        set_greeting("Search");
        greeting_element.current.classList.remove("opacity-0");
        greeting_element.current.classList.add("opacity-100");
        localStorage.setItem("greeted", "1");
      }, 1000);
    }, greetings_end);

    later(() => {
      set_centered(false);
      if (logo_element.current) {
        logo_element.current.classList.remove("opacity-0");
        logo_element.current.classList.add("opacity-100");
      }
    }, greetings_end + 1000);

    later(() => {
      if (search_element.current) {
        search_element.current.classList.remove("opacity-0");
        search_element.current.classList.add("opacity-100");
      }
    }, greetings_end + 1400);

    return () => timers.forEach(clearTimeout);
  }, []);

  const handle_logout = async () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token_secret");
    await fetch(`${backend_url}/logout`, { method: "POST" });
    navigate("/");
  };

  const tweet_entries = results ? Object.entries(results) : [];
  const positive_count = tweet_entries.filter(([, t]) => is_positive(t.result.overall_sentiment)).length;
  const negative_count = tweet_entries.length - positive_count;
  const entities = results ? group_entities(results) : [];

  return (
    <div className="flex flex-col items-center h-screen overflow-y-auto">
      <div ref={logo_element} className="flex w-3xl mb-12 opacity-0 transition-all duration-1000 py-4 shrink-0 justify-between items-center">
        <Logo className="h-8" />
        <button onClick={handle_logout} title="Logout"
          className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-xs">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className={`flex justify-center items-start w-3xl px-md transition-[padding] duration-700 ${searched ? "pt-4" : "pt-[35vh]"}`}>
        <div className={`flex flex-col gap-4 w-full ${centered ? "items-center" : "items-start"}`}>

          <p ref={greeting_element} className="text-white text-xl font-sans text-center transition-all duration-1000 scale-100">
            {curr_greeting}
          </p>

          {/* Search bar */}
          <div ref={search_element} className="w-full opacity-0 transition-all duration-1000">
            <div className="relative flex items-center w-full">
              <Search className="absolute left-4 text-white/50 w-4 h-4" />
              <input
                value={query}
                onChange={(e) => set_query(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handle_search()}
                placeholder={placeholder}
                className="text-white placeholder:text-white/50 placeholder:text-sm text-sm bg-transparent outline-none rounded-full border-2 border-white/70 w-full py-2 pl-10 pr-12"
              />
              <button
                onClick={() => set_filters_open((o) => !o)}
                className={`absolute right-3 p-1 rounded-full transition-all duration-200 ${filters_open ? "text-white bg-white/20" : "text-white/50 hover:text-white"}`}
              >
                {filters_open ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
              </button>
            </div>

            {/* Filter panel */}
            <div className={`overflow-hidden transition-all duration-500 ${filters_open ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
              <div className="rounded-2xl p-4 flex flex-col gap-4 bg-white/10 backdrop-blur-sm">
                <div className="flex gap-3">
                  <label className="flex flex-col gap-1 flex-1">
                    <span className="text-white/40 text-xs">Limit</span>
                    <input type="number" min={50} max={999} value={filters.limit}
                      onChange={(e) => update_filter("limit", Number(e.target.value))}
                      className="bg-transparent border border-white/20 rounded-full px-3 py-1.5 text-white text-sm outline-none focus:border-white/50 transition-colors" />
                  </label>
                  <label className="flex flex-col gap-1 flex-1">
                    <span className="text-white/40 text-xs">Min Likes</span>
                    <input type="number" min={0} value={filters.min_likes}
                      onChange={(e) => update_filter("min_likes", Number(e.target.value))}
                      className="bg-transparent border border-white/20 rounded-full px-3 py-1.5 text-white text-sm outline-none focus:border-white/50 transition-colors" />
                  </label>
                </div>
                <div className="flex gap-3">
                  <label className="flex flex-col gap-1 flex-1">
                    <span className="text-white/40 text-xs">Since</span>
                    <input type="date" value={filters.since} max={filters.until}
                      onChange={(e) => update_filter("since", e.target.value)}
                      className="bg-transparent border border-white/20 rounded-full px-3 py-1.5 text-white text-sm outline-none focus:border-white/50 transition-colors [color-scheme:dark]" />
                  </label>
                  <label className="flex flex-col gap-1 flex-1">
                    <span className="text-white/40 text-xs">Until</span>
                    <input type="date" value={filters.until} min={filters.since} max={today}
                      onChange={(e) => update_filter("until", e.target.value)}
                      className="bg-transparent border border-white/20 rounded-full px-3 py-1.5 text-white text-sm outline-none focus:border-white/50 transition-colors [color-scheme:dark]" />
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">Verified only</span>
                  <button onClick={() => update_filter("verified_only", !filters.verified_only)}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${filters.verified_only ? "bg-sky-500" : "bg-white/20"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${filters.verified_only ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm w-full text-center py-4">{error}</p>
          )}

          {/* Results */}
          {results && (
            <div className="w-full flex flex-col gap-4 pb-12">

              {/* Tabs */}
              <div className="flex gap-1 border-b border-white/10">
                {["tweets", "entities"].map((tab) => (
                  <button key={tab} onClick={() => set_active_tab(tab)}
                    className={`px-4 py-2 text-sm transition-all duration-200 border-b-2 -mb-px ${active_tab === tab ? "text-white border-sky-500" : "text-white/40 border-transparent hover:text-white/70"}`}>
                    {tab === "tweets" ? "All Tweets" : "Entity Group"}
                  </button>
                ))}
              </div>

              {/* All Tweets tab */}
              {active_tab === "tweets" && (
                <div className="flex flex-col gap-3">
                  {/* Summary */}
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
                      <p className="text-green-400 text-xs mb-1">Positive</p>
                      <p className="text-white text-2xl font-semibold">{positive_count}</p>
                    </div>
                    <div className="flex-1 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                      <p className="text-red-400 text-xs mb-1">Negative</p>
                      <p className="text-white text-2xl font-semibold">{negative_count}</p>
                    </div>
                  </div>

                  {/* Tweet list */}
                  {tweet_entries.map(([url, tweet]) => {
                    const pos = is_positive(tweet.result.overall_sentiment);
                    return (
                      <a key={url} href={url} target="_blank" rel="noreferrer"
                        className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-white/80 text-sm leading-relaxed">{tweet.text}</p>
                          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${pos ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {pos ? "Positive" : "Negative"}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Entity Group tab */}
              {active_tab === "entities" && (
                <div className="flex flex-col gap-3">
                  {entities.length === 0 && (
                    <p className="text-white/40 text-sm text-center py-8">No entities found.</p>
                  )}
                  {entities.map((e) => {
                    const pos_pct = Math.round((e.positive / e.total) * 100);
                    const neg_pct = 100 - pos_pct;
                    return (
                      <div key={e.name} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium text-sm">{e.name}</p>
                          <p className="text-white/40 text-xs">{e.total} mention{e.total !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
                          <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${pos_pct}%` }} />
                          <div className="h-full bg-red-500 transition-all duration-700" style={{ width: `${neg_pct}%` }} />
                        </div>
                        <div className="flex gap-3 text-xs text-white/40">
                          <span className="text-green-400/70">{e.positive} positive</span>
                          <span className="text-red-400/70">{e.negative} negative</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
