import { forwardRef } from "react";
import { Search } from "lucide-react";

const SearchBar = forwardRef(function SearchBar(
  { query, set_query, on_search, placeholder },
  ref
) {
  return (
    <div ref={ref} className="w-full opacity-0 transition-all duration-1000">
      <div className="relative flex items-center w-full">
        <Search className="absolute left-4 text-white/50 w-4 h-4" />
        <input
          value={query}
          onChange={(e) => set_query(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && on_search()}
          placeholder={placeholder}
          className="text-white placeholder:text-white/50 placeholder:text-sm text-sm bg-transparent outline-none rounded-full border-2 border-white/20 w-full py-2 pl-10 pr-4 focus:border-sky-500 focus:border-2"
        />
      </div>
    </div>
  );
});

export default SearchBar;
