import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function relativeTime(iso: string | Date | null | undefined): string {
  if (!iso) return "just now";
  const date = new Date(iso);
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffSec < 45) return "just now";
  if (diffSec < 90) return "1 min ago";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 45) return `${diffMin} mins ago`;
  if (diffMin < 90) return "1 hour ago";

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffHr < 36) return "1 day ago";

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const formatDueDate = formatDate;

export function formatPriority(p: string | null | undefined): string {
  if (!p) return "Medium";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export function getPriorityColor(p: string | null | undefined): string {
  switch (p) {
    case "urgent":
      return "text-red-600 bg-red-50 border-red-200";
    case "high":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "medium":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "low":
    default:
      return "text-slate-600 bg-slate-50 border-slate-200";
  }
}

export function initials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function colorFromId(id: string | null | undefined): string {
  if (!id) return "#6366f1";
  const colors = ["#2f8159", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function columnAccent(index: number): string {
  const accents = [
    "bg-brand-500",
    "bg-amber-500",
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-purple-500",
  ];
  return accents[index % accents.length];
}

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function priorityMeta(p: string | null | undefined): { label: string; style: string } {
  const meta: Record<string, { label: string; style: string }> = {
    urgent: { label: "Urgent", style: "bg-red-50 text-red-600 border-red-200" },
    high: { label: "High", style: "bg-orange-50 text-orange-600 border-orange-200" },
    medium: { label: "Medium", style: "bg-amber-50 text-amber-600 border-amber-200" },
    low: { label: "Low", style: "bg-slate-50 text-slate-600 border-slate-200" },
  };
  return meta[p || "medium"] || meta.medium;
}
