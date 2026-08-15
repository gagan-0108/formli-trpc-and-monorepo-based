"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface OptionsEditorProps {
  options: Option[];
  onChange: (options: Option[]) => void;
}

export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;

    onChange([
      ...options,
      { label: trimmed, value: trimmed.toLowerCase().replace(/\s+/g, "_") },
    ]);
    setNewOption("");
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs font-medium text-zinc-400">Options</Label>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={opt.label}
              className="h-9 text-sm bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50"
              readOnly
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 shrink-0"
              onClick={() => removeOption(i)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-2">
          <Input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add new option..."
            className="h-9 text-sm bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50"
            onKeyDown={(e) => e.key === "Enter" && addOption()}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-white/[0.06] bg-black/40 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30 shrink-0"
            onClick={addOption}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
