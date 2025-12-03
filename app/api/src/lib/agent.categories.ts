export type Category = {
  id: string;
  label: string;
  description?: string;
};

export const CATEGORIES: readonly Category[] = [
  {
    id: "text-chat",
    label: "Text & Chat",
    description: "Conversational, summarization, writing agents",
  },
  { id: "data-analytics", label: "Data & Analytics" },
  { id: "code-dev", label: "Code & Dev Tools" },
  { id: "automation", label: "Automation" },
  { id: "research", label: "Research" },
  { id: "creative", label: "Creative" },
  { id: "web-scraping", label: "Web / Scraping" },
  { id: "other", label: "Other" },
] as const;

export type AgentCategoryId = (typeof CATEGORIES)[number]["id"];

const CATEGORY_IDS: ReadonlySet<AgentCategoryId> = new Set(
  CATEGORIES.map((c) => c.id)
);

export function assertValidCategory(
  category: string
): asserts category is AgentCategoryId {
  if (!CATEGORY_IDS.has(category as AgentCategoryId)) {
    throw new Error(`Invalid category: ${category}`);
  }
}
