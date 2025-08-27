import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { searchPlayers } from "@/services/api";
import { PlayerSummary } from "@/services/types";

interface PlayerPickerProps {
  placeholder?: string;
  value?: string;
  onSelect: (player: PlayerSummary) => void;
  disabled?: boolean;
}

export default function PlayerPicker({ 
  placeholder = "Search player...", 
  value = "",
  onSelect,
  disabled = false
}: PlayerPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayValue, setDisplayValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search players query
  const { data: players = [], isLoading, error } = useQuery({
    queryKey: ['searchPlayers', debouncedQuery],
    queryFn: () => searchPlayers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Update display value when value prop changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    setSearchQuery(newValue);
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  // Handle player selection
  const handleSelectPlayer = (player: PlayerSummary) => {
    setDisplayValue(player.name);
    setSearchQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect(player);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || players.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < players.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < players.length) {
          handleSelectPlayer(players[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = isOpen && debouncedQuery.length >= 2;

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (searchQuery.length >= 2) {
            setIsOpen(true);
          }
        }}
        disabled={disabled}
        className="w-full"
        data-testid="player-picker-input"
      />

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          data-testid="player-picker-dropdown"
        >
          {isLoading && (
            <div className="p-3 text-sm text-textDim text-center">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Searching players...
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-500 text-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Error searching players
            </div>
          )}

          {!isLoading && !error && players.length === 0 && (
            <div className="p-3 text-sm text-textDim text-center">
              <i className="fas fa-search mr-2"></i>
              No players found
            </div>
          )}

          {!isLoading && !error && players.length > 0 && (
            <div className="py-1">
              {players.map((player, index) => (
                <button
                  key={player.id}
                  onClick={() => handleSelectPlayer(player)}
                  className={`w-full px-3 py-2 text-left hover:bg-surface-hover flex items-center justify-between transition-colors ${
                    index === selectedIndex ? 'bg-surface-hover' : ''
                  }`}
                  data-testid={`player-option-${player.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium text-text">{player.name}</div>
                      <div className="text-sm text-textDim">
                        {player.pos} • {player.team}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                    {player.pos}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
