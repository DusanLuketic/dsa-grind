export const DIFFICULTY = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

export const STATUS = {
  NOT_STARTED: "NOT_STARTED",
  ATTEMPTED: "ATTEMPTED",
  SOLVED: "SOLVED",
  REVIEW: "REVIEW",
} as const;

export const RESOURCE_TYPE = {
  VIDEO: "VIDEO",
  ARTICLE: "ARTICLE",
  COURSE: "COURSE",
  TOOL: "TOOL",
} as const;

export const DIFFICULTY_COLORS = {
  EASY: "#22c55e",
  MEDIUM: "#eab308",
  HARD: "#ef4444",
} as const;

export const STATUS_LABELS = {
  NOT_STARTED: "Not Started",
  ATTEMPTED: "Attempted",
  SOLVED: "Solved",
  REVIEW: "Review",
} as const;

export interface TopicMeta {
  id: string;
  title: string;
  slug: string;
  icon: string;
  color: string;
  order: number;
  description: string;
  problemSet: string;
  category?: string;
}

export const TOPICS: TopicMeta[] = [
  {
    id: "arrays-hashing",
    title: "Arrays & Hashing",
    slug: "arrays-hashing",
    icon: "🔢",
    color: "#3b82f6",
    order: 1,
    description: "Master hash maps, sets, and array manipulation techniques",
    problemSet: "neetcode-150",
  },
  {
    id: "two-pointers",
    title: "Two Pointers",
    slug: "two-pointers",
    icon: "👆",
    color: "#8b5cf6",
    order: 2,
    description: "Solve problems efficiently using two pointer technique",
    problemSet: "neetcode-150",
  },
  {
    id: "sliding-window",
    title: "Sliding Window",
    slug: "sliding-window",
    icon: "🪟",
    color: "#06b6d4",
    order: 3,
    description: "Optimize array/string problems with sliding window approach",
    problemSet: "neetcode-150",
  },
  {
    id: "stack",
    title: "Stack",
    slug: "stack",
    icon: "📚",
    color: "#f59e0b",
    order: 4,
    description:
      "LIFO data structure for parentheses, monotonic, and bracket problems",
    problemSet: "neetcode-150",
  },
  {
    id: "binary-search",
    title: "Binary Search",
    slug: "binary-search",
    icon: "🔍",
    color: "#10b981",
    order: 5,
    description: "Divide and conquer search in sorted arrays",
    problemSet: "neetcode-150",
  },
  {
    id: "linked-list",
    title: "Linked List",
    slug: "linked-list",
    icon: "🔗",
    color: "#f97316",
    order: 6,
    description: "Pointers, reversals, fast & slow pointer techniques",
    problemSet: "neetcode-150",
  },
  {
    id: "trees",
    title: "Trees",
    slug: "trees",
    icon: "🌲",
    color: "#22c55e",
    order: 7,
    description: "Binary trees, BST, traversals, and tree algorithms",
    problemSet: "neetcode-150",
  },
  {
    id: "tries",
    title: "Tries",
    slug: "tries",
    icon: "🌐",
    color: "#6366f1",
    order: 8,
    description: "Prefix trees for string search and autocomplete",
    problemSet: "neetcode-150",
  },
  {
    id: "heap-priority-queue",
    title: "Heap / Priority Queue",
    slug: "heap-priority-queue",
    icon: "⛰️",
    color: "#ec4899",
    order: 9,
    description: "Min/max heaps for k-th largest, merge k lists, etc.",
    problemSet: "neetcode-150",
  },
  {
    id: "backtracking",
    title: "Backtracking",
    slug: "backtracking",
    icon: "↩️",
    color: "#14b8a6",
    order: 10,
    description: "Recursive exploration with pruning for combinatorics",
    problemSet: "neetcode-150",
  },
  {
    id: "graphs",
    title: "Graphs",
    slug: "graphs",
    icon: "🕸️",
    color: "#a855f7",
    order: 11,
    description: "BFS, DFS, Union-Find, topological sort",
    problemSet: "neetcode-150",
  },
  {
    id: "advanced-graphs",
    title: "Advanced Graphs",
    slug: "advanced-graphs",
    icon: "🗺️",
    color: "#d946ef",
    order: 12,
    description: "Dijkstra's, Bellman-Ford, Floyd-Warshall, Prim's",
    problemSet: "neetcode-150",
  },
  {
    id: "1-d-dynamic-programming",
    title: "1-D Dynamic Programming",
    slug: "1-d-dynamic-programming",
    icon: "📊",
    color: "#0ea5e9",
    order: 13,
    description: "Fibonacci, climbing stairs, house robber patterns",
    problemSet: "neetcode-150",
  },
  {
    id: "2-d-dynamic-programming",
    title: "2-D Dynamic Programming",
    slug: "2-d-dynamic-programming",
    icon: "📈",
    color: "#4ade80",
    order: 14,
    description: "Knapsack, edit distance, LCS grid problems",
    problemSet: "neetcode-150",
  },
  {
    id: "greedy",
    title: "Greedy",
    slug: "greedy",
    icon: "💰",
    color: "#fbbf24",
    order: 15,
    description: "Optimal local choices leading to global optimum",
    problemSet: "neetcode-150",
  },
  {
    id: "intervals",
    title: "Intervals",
    slug: "intervals",
    icon: "⏱️",
    color: "#fb7185",
    order: 16,
    description: "Merge intervals, meeting rooms, sweep line",
    problemSet: "neetcode-150",
  },
  {
    id: "math-geometry",
    title: "Math & Geometry",
    slug: "math-geometry",
    icon: "📐",
    color: "#a3e635",
    order: 17,
    description: "Number theory, prime, geometry algorithms",
    problemSet: "neetcode-150",
  },
  {
    id: "bit-manipulation",
    title: "Bit Manipulation",
    slug: "bit-manipulation",
    icon: "⚙️",
    color: "#38bdf8",
    order: 18,
    description: "Bitwise operators, XOR tricks, bit counting",
    problemSet: "neetcode-150",
  },
  {
    id: "cs-implement-data-structures",
    title: "Implement Data Structures",
    slug: "cs-implement-data-structures",
    icon: "🏗️",
    color: "#f472b6",
    order: 1,
    description: "Build fundamental data structures from scratch",
    problemSet: "core-skills",
    category: "algorithms",
  },
  {
    id: "cs-sorting",
    title: "Sorting",
    slug: "cs-sorting",
    icon: "🔄",
    color: "#c084fc",
    order: 2,
    description: "Implement and understand sorting algorithms",
    problemSet: "core-skills",
    category: "algorithms",
  },
  {
    id: "cs-graphs",
    title: "Graphs",
    slug: "cs-graphs",
    icon: "🔀",
    color: "#34d399",
    order: 3,
    description: "Graph traversal and shortest path algorithms",
    problemSet: "core-skills",
    category: "algorithms",
  },
  {
    id: "cs-dynamic-programming",
    title: "Dynamic Programming",
    slug: "cs-dynamic-programming",
    icon: "📦",
    color: "#60a5fa",
    order: 4,
    description: "Classic DP patterns and optimization problems",
    problemSet: "core-skills",
    category: "algorithms",
  },
  {
    id: "cs-design-patterns",
    title: "Design Patterns",
    slug: "cs-design-patterns",
    icon: "🧩",
    color: "#fbbf24",
    order: 5,
    description: "Creational, structural, and behavioral design patterns",
    problemSet: "core-skills",
    category: "design-patterns",
  },
  {
    id: "cs-sql",
    title: "SQL",
    slug: "cs-sql",
    icon: "🗃️",
    color: "#2dd4bf",
    order: 6,
    description: "SQL query writing and database problem solving",
    problemSet: "core-skills",
    category: "sql",
  },
  {
    id: "cs-machine-learning",
    title: "Machine Learning",
    slug: "cs-machine-learning",
    icon: "🤖",
    color: "#818cf8",
    order: 7,
    description: "Fundamental machine learning algorithms and concepts",
    problemSet: "core-skills",
    category: "machine-learning",
  },
  {
    id: "sd-interview-questions",
    title: "Interview Questions",
    slug: "sd-interview-questions",
    icon: "🏢",
    color: "#fb923c",
    order: 1,
    description: "System design interview preparation questions",
    problemSet: "system-design",
  },
];

export const PROBLEM_SETS = [
  { id: "core-skills", label: "Core Skills", icon: "📚" },
  { id: "neetcode-150", label: "NeetCode 150", icon: "🚀" },
  { id: "system-design", label: "System Design", icon: "🌸" },
] as const

export type ProblemSetId = typeof PROBLEM_SETS[number]["id"]

export const CORE_SKILLS_CATEGORIES = [
  { id: "algorithms", label: "Algorithms" },
  { id: "design-patterns", label: "Design Patterns" },
  { id: "sql", label: "SQL" },
  { id: "machine-learning", label: "Machine Learning" },
] as const

export function getTopicsByProblemSet(problemSet: string): TopicMeta[] {
  return TOPICS.filter(t => t.problemSet === problemSet)
}

export function getTopicsByCategory(problemSet: string, category: string): TopicMeta[] {
  return TOPICS.filter(t => t.problemSet === problemSet && t.category === category)
}

export const ROADMAP_EDGES: Record<string, string[]> = {
  "arrays-hashing": ["two-pointers", "stack"],
  "two-pointers": ["binary-search", "sliding-window", "linked-list"],
  stack: [],
  "binary-search": ["trees"],
  "sliding-window": [],
  "linked-list": ["trees"],
  trees: ["tries", "heap-priority-queue", "backtracking"],
  tries: ["heap-priority-queue"],
  "heap-priority-queue": ["intervals", "greedy", "advanced-graphs"],
  backtracking: ["graphs", "1-d-dynamic-programming"],
  graphs: ["advanced-graphs", "2-d-dynamic-programming", "math-geometry"],
  "1-d-dynamic-programming": ["2-d-dynamic-programming", "bit-manipulation"],
  "2-d-dynamic-programming": ["math-geometry"],
  "bit-manipulation": ["math-geometry"],
};

// Groups of topics by visual row for DAG rendering
export const ROADMAP_LAYERS: string[][] = [
  ["arrays-hashing"],
  ["two-pointers", "stack"],
  ["binary-search", "sliding-window", "linked-list"],
  ["trees"],
  ["tries", "backtracking"],
  ["heap-priority-queue", "graphs", "1-d-dynamic-programming"],
  [
    "intervals",
    "greedy",
    "advanced-graphs",
    "2-d-dynamic-programming",
    "bit-manipulation",
  ],
  ["math-geometry"],
];
