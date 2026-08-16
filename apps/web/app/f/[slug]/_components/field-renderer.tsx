"use client";

import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Check, Star } from "lucide-react";

// ─── Field Type Props ─────────────────────────────────────────
interface FieldRendererProps {
  field: {
    id: string;
    type: string;
    label: string;
    placeholder?: string | null;
    options?: Array<{ label: string; value: string }> | null;
  };
  value: string;
  onChange: (value: string) => void;
  primaryColor: string;
  textColor: string;
}

const INPUT_CLASS =
  "text-lg border-0 border-b-2 rounded-none bg-transparent focus-visible:ring-0 px-0 h-auto py-2";

// ─── Component ────────────────────────────────────────────────
export function FieldRenderer({
  field,
  value,
  onChange,
  primaryColor,
  textColor,
}: FieldRendererProps) {
  const borderStyle = { borderColor: `${textColor}20` };

  switch (field.type) {
    case "short_text":
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "Type your answer here..."}
          className={INPUT_CLASS}
          style={borderStyle}
          autoFocus
        />
      );

    case "long_text":
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "Type your answer here..."}
          className={`${INPUT_CLASS} resize-none min-h-[100px]`}
          style={borderStyle}
          rows={4}
          autoFocus
        />
      );

    case "email":
      return (
        <Input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "name@example.com"}
          className={INPUT_CLASS}
          style={borderStyle}
          autoFocus
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "0"}
          className={INPUT_CLASS}
          style={borderStyle}
          autoFocus
        />
      );

    case "single_select":
      return (
        <div className="space-y-2">
          {(field.options || []).map((opt, i) => (
            <button
              key={i}
              onClick={() => onChange(opt.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                value === opt.value ? "border-current bg-white/5" : "hover:border-current/30"
              }`}
              style={{ borderColor: value === opt.value ? primaryColor : `${textColor}10` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium"
                  style={{ borderColor: value === opt.value ? primaryColor : `${textColor}30` }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt.label}</span>
              </div>
            </button>
          ))}
        </div>
      );

    case "multi_select": {
      const selectedValues = value ? value.split(",").filter(Boolean) : [];
      return (
        <div className="space-y-2">
          {(field.options || []).map((opt, i) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <button
                key={i}
                onClick={() => {
                  const newValues = isSelected
                    ? selectedValues.filter((v) => v !== opt.value)
                    : [...selectedValues, opt.value];
                  onChange(newValues.join(","));
                }}
                className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all"
                style={{ borderColor: isSelected ? primaryColor : `${textColor}10` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center"
                    style={{
                      borderColor: isSelected ? primaryColor : `${textColor}30`,
                      backgroundColor: isSelected ? primaryColor : "transparent",
                    }}
                  >
                    {isSelected && <Check className="w-3 h-3" style={{ color: "#000" }} />}
                  </div>
                  <span>{opt.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    case "checkbox":
      return (
        <button
          onClick={() => onChange(value === "true" ? "false" : "true")}
          className="px-4 py-3 rounded-xl border-2 transition-all"
          style={{ borderColor: value === "true" ? primaryColor : `${textColor}10` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded border-2 flex items-center justify-center"
              style={{
                borderColor: value === "true" ? primaryColor : `${textColor}30`,
                backgroundColor: value === "true" ? primaryColor : "transparent",
              }}
            >
              {value === "true" && <Check className="w-3 h-3" style={{ color: "#000" }} />}
            </div>
            <span>Yes</span>
          </div>
        </button>
      );

    case "rating": {
      const rating = Number(value) || 0;
      return (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onChange(String(star))}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  star <= rating ? "fill-amber-400 text-amber-400" : "hover:text-amber-300"
                }`}
                style={star > rating ? { color: `${textColor}20` } : undefined}
              />
            </button>
          ))}
        </div>
      );
    }

    case "date":
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT_CLASS}
          style={borderStyle}
        />
      );

    default:
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer..."
          className={INPUT_CLASS}
          style={borderStyle}
          autoFocus
        />
      );
  }
}
