import { Search, Filter, X } from "lucide-react";
import { InputText } from "@/components/ui/input/input-text";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SearchComponentProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  disabled?: boolean;
  showFilters?: boolean;
}

export function SearchComponent({ 
  placeholder = "Buscar...", 
  className,
  onSearch,
  onFilter,
  disabled = false, // Funcionalidade desligada por enquanto
  showFilters = true
}: SearchComponentProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (!disabled && onSearch) {
      onSearch(value);
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    if (!disabled && onSearch) {
      onSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled && onSearch) {
      onSearch(searchValue);
    }
  };

  return (
    <div className={cn("flex items-center justify-center rounded-full border-primary/50", className)}>
      <div className="relative w-full max-w-2xl">
        <div className="flex items-center">
          {/* Search Input Container */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <InputText
              type="text"
              placeholder={placeholder}
              value={searchValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className={cn(
                "pl-12 pr-12 h-12 text-base !rounded-full border-0 transition-all duration-200",
                "focus:ring-2 focus:ring-white/30",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            />
            
            {/* Clear Button */}
            {searchValue && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSearch}
                  disabled={disabled}
                  className="h-6 w-6 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Filter Button */}
          {showFilters && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onFilter}
              disabled={disabled}
              className={cn(
                "h-12 px-4 !rounded-full border-0 transition-all duration-200 cursor-pointer",
                " hover:bg-white/20 text-white",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              <Filter className="h-5 w-5 text-black dark:text-white" />
              <span className="hidden sm:inline ml-2 text-black dark:text-white">Buscar</span>
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
