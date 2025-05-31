import React from "react";
import { Input } from "./input";

interface TagInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      onChange([...value, inputValue]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md">
      {value.map((tag) => (
        <span
          key={tag}
          className="bg-primary/10 px-2 py-1 rounded-md flex items-center gap-1"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="text-xs hover:text-destructive"
          >
            ×
          </button>
        </span>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="border-0 focus-visible:ring-0"
      />
    </div>
  );
};