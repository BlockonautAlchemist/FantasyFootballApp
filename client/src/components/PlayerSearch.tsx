import { useState } from "react";
import { Input } from "@/components/ui/input";

interface PlayerSearchProps {
  placeholder?: string;
  onPlayerSelect?: (playerId: string) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export default function PlayerSearch({ 
  placeholder = "Search player...", 
  onPlayerSelect, 
  value, 
  onChange 
}: PlayerSearchProps) {
  const [searchValue, setSearchValue] = useState(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onChange?.(newValue);
  };

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={searchValue}
      onChange={handleChange}
      className="w-full"
      data-testid="player-search-input"
    />
  );
}
