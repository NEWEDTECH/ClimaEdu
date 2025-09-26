import { Search, Filter, X } from "lucide-react";
import { InputText } from "@/components/ui/input/input-text";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { container } from "@/_core/shared/container";
import { Register } from "@/_core/shared/container";
import { GlobalSearchUseCase, SearchResultEntity } from "@/_core/modules/search";
import { useProfile } from "@/context/zustand/useProfile";

interface SearchComponentProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onSearchResults?: (results: SearchResultEntity[]) => void;
  onFilter?: () => void;
  disabled?: boolean;
  showFilters?: boolean;
}

export function SearchComponent({ 
  placeholder = "Buscar...", 
  className,
  onSearch,
  onSearchResults,
  onFilter,
  disabled = false,
  showFilters = true
}: SearchComponentProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { infoUser } = useProfile();

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || !infoUser.currentIdInstitution) {
      if (onSearchResults) {
        onSearchResults([]);
      }
      return;
    }

    try {
      setIsSearching(true);
      
      const globalSearchUseCase = container.get<GlobalSearchUseCase>(
        Register.search.useCase.GlobalSearchUseCase
      );

      const result = await globalSearchUseCase.execute({
        query: query.trim(),
        institutionId: infoUser.currentIdInstitution,
        limit: 20
      });

      if (onSearchResults) {
        onSearchResults(result.results);
      }
    } catch (error) {
      console.error('Error performing search:', error);
      if (onSearchResults) {
        onSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, [infoUser.currentIdInstitution, onSearchResults]);

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
    if (onSearchResults) {
      onSearchResults([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled) {
      if (onSearch) {
        onSearch(searchValue);
      }
      performSearch(searchValue);
    }
  };

  const handleSearchClick = () => {
    if (!disabled) {
      performSearch(searchValue);
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

          {/* Search Button */}
          {showFilters && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleSearchClick}
              disabled={disabled || isSearching}
              className={cn(
                "h-12 px-4 !rounded-full border-0 transition-all duration-200 cursor-pointer",
                " hover:bg-white/20 text-white",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              {isSearching ? (
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Filter className="h-5 w-5 text-black dark:text-white" />
              )}
              <span className="hidden sm:inline ml-2 text-black dark:text-white">
                {isSearching ? 'Buscando...' : 'Buscar'}
              </span>
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
