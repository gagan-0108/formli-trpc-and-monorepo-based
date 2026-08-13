import {
  Type,
  AlignLeft,
  Mail,
  Hash,
  List,
  ListChecks,
  CheckSquare,
  Star,
  Calendar,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Field Type Registry ──────────────────────────────────────
// Single source of truth for all field types used across the app.

export interface FieldTypeDefinition {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const FIELD_TYPES: FieldTypeDefinition[] = [
  { value: "short_text", label: "Short Text", icon: Type },
  { value: "long_text", label: "Long Text", icon: AlignLeft },
  { value: "email", label: "Email", icon: Mail },
  { value: "number", label: "Number", icon: Hash },
  { value: "single_select", label: "Single Select", icon: List },
  { value: "multi_select", label: "Multi Select", icon: ListChecks },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare },
  { value: "rating", label: "Rating", icon: Star },
  { value: "date", label: "Date", icon: Calendar },
] as const;

export function getFieldType(value: string): FieldTypeDefinition | undefined {
  return FIELD_TYPES.find((t) => t.value === value);
}

// ─── Dashboard Templates ──────────────────────────────────────

export interface Template {
  title: string;
  desc: string;
  icon: string;
}

export const TEMPLATES: Template[] = [
  { title: "Customer Feedback", desc: "Collect product feedback", icon: "💬" },
  { title: "Contact Form", desc: "Let people reach out", icon: "📩" },
  { title: "Event Registration", desc: "Sign up attendees", icon: "🎟️" },
  { title: "Job Application", desc: "Collect resumes & info", icon: "💼" },
  { title: "Quiz", desc: "Test knowledge with questions", icon: "🧠" },
  { title: "Survey", desc: "Gather opinions at scale", icon: "📊" },
] as const;
