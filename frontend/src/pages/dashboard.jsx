import { useEffect, useState, useRef } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/logo";
import FilterPanel from "../components/FilterPanel";
import SearchBar from "../components/SearchBar";
import ResultsTabs from "../components/ResultsTabs";
import TweetDetailPanel from "../components/TweetDetailPanel";
import backend_url from "../../constants";

const today = new Date().toISOString().split("T")[0];
const jan1 = `${new Date().getFullYear()}-01-01`;
const is_positive = (s) => s?.toLowerCase().includes("pos");

function group_entities(results) {
  const groups = {};
  Object.values(results).forEach((tweet) => {
    tweet.result.entities.forEach((e) => {
      const key = e.entity.toLowerCase().trim();
      if (!groups[key]) groups[key] = { name: key, positive: 0, negative: 0, total: 0 };
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

  const [loading, set_loading] = useState(false);
  const [results, set_results] = useState(null);
  const [active_tab, set_active_tab] = useState("tweets");
  const [selected_tweet, set_selected_tweet] = useState(null);
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
  const filter_element = useRef();

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
      set_results(await res.json());
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
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    let greetings_end = 1000 + (greetings.length - 1) * 3000 + 3000;
    if (localStorage.getItem("greeted")) {
      greetings_end = 1500;
    } else {
      greetings.forEach((g, i) => {
        later(() => {
          const el = greeting_element.current;
          if (!el) return;
          el.classList.replace("opacity-100", "opacity-0");
          later(() => {
            if (!greeting_element.current) return;
            set_greeting(g);
            greeting_element.current.classList.replace("opacity-0", "opacity-100");
          }, 1000);
        }, 1000 + i * 3000);
      });
    }

    later(() => {
      const el = greeting_element.current;
      if (!el) return;
      el.classList.replace("opacity-100", "opacity-0");
      later(() => {
        if (!greeting_element.current) return;
        set_greeting("Search");
        greeting_element.current.classList.replace("opacity-0", "opacity-100");
        localStorage.setItem("greeted", "1");
      }, 1000);
    }, greetings_end);

    later(() => {
      set_centered(false);
      logo_element.current?.classList.replace("opacity-0", "opacity-100");
    }, greetings_end + 1000);

    later(() => {
      search_element.current?.classList.replace("opacity-0", "opacity-100");
    }, greetings_end + 1400);

    later(() => {
      filter_element.current?.classList.replace("opacity-0", "opacity-100");
    }, greetings_end + 1800);

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
      {/* Logo bar */}
      <div
        ref={logo_element}
        className="flex w-3xl mb-12 opacity-0 transition-all duration-1000 py-4 shrink-0 justify-between items-center"
      >
        <Logo className="h-8" />
        <button
          onClick={handle_logout}
          title="Logout"
          className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-xs"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* 3-column layout */}
      <div
        className={`flex items-start w-full transition-[padding] duration-700 ${searched ? "pt-4" : "pt-[35vh]"}`}
      >
        {/* Left column — filter panel */}
        <div className="flex-1 flex justify-end pr-6">
          <div
            ref={filter_element}
            className="opacity-0 transition-opacity duration-1000"
          >
            <FilterPanel filters={filters} update_filter={update_filter} today={today} />
          </div>
        </div>

        {/* Middle column — main content */}
        <div className={`w-3xl flex flex-col gap-4 ${centered ? "items-center" : "items-start"}`}>
          <p
            ref={greeting_element}
            className="text-white text-xl font-sans text-center transition-all duration-1000 opacity-100"
          >
            {curr_greeting}
          </p>

          <SearchBar
            ref={search_element}
            query={query}
            set_query={set_query}
            on_search={handle_search}
            placeholder="find your topic or people to be analyzed.."
          />

          {loading && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin" />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm w-full text-center py-4">{error}</p>
          )}

          {results && (
            <ResultsTabs
              active_tab={active_tab}
              set_active_tab={set_active_tab}
              tweet_entries={tweet_entries}
              positive_count={positive_count}
              negative_count={negative_count}
              entities={entities}
              on_select_tweet={(url, tweet) => set_selected_tweet({ url, tweet })}
            />
          )}
        </div>

        {/* Right column — tweet detail panel */}
        <div className="flex-1 flex justify-start pl-6">
          <div
            className={`overflow-hidden transition-all duration-500 ${selected_tweet ? "w-72 opacity-100" : "w-0 opacity-0"}`}
          >
            {selected_tweet && (
              <TweetDetailPanel
                url={selected_tweet.url}
                tweet={selected_tweet.tweet}
                on_close={() => set_selected_tweet(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
