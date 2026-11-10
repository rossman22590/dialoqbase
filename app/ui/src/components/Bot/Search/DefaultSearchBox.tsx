import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBoxProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading?: boolean;
}

// The search form from the mock: one input and a primary button.
export default function DefaultSearchBox({
  onSubmit,
  placeholder = "Search sources",
  searchQuery,
  setSearchQuery,
  isLoading,
}: SearchBoxProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(searchQuery);
  };

  return (
    <form role="search" onSubmit={handleSearch} className="flex gap-2">
      <label htmlFor="bot-search" className="sr-only">
        Search sources
      </label>
      <input
        id="bot-search"
        type="search"
        autoFocus
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="ui-input h-11 min-w-0 flex-1 rounded-[10px] px-3.5 text-[15px]"
      />
      <button
        type="submit"
        aria-label="Search"
        disabled={isLoading}
        className="ui-btn-primary h-11 shrink-0 rounded-[10px] px-[18px]"
      >
        <MagnifyingGlassIcon className="sm:hidden" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}
