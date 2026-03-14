export const DIFFICULTY = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const

export const STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  ATTEMPTED: 'ATTEMPTED',
  SOLVED: 'SOLVED',
  REVIEW: 'REVIEW',
} as const

export const RESOURCE_TYPE = {
  VIDEO: 'VIDEO',
  ARTICLE: 'ARTICLE',
  COURSE: 'COURSE',
  TOOL: 'TOOL',
} as const

export const DIFFICULTY_COLORS = {
  EASY: '#22c55e',
  MEDIUM: '#eab308',
  HARD: '#ef4444',
} as const

export const STATUS_LABELS = {
  NOT_STARTED: 'Not Started',
  ATTEMPTED: 'Attempted',
  SOLVED: 'Solved',
  REVIEW: 'Review',
} as const

export interface TopicMeta {
  id: string
  title: string
  slug: string
  icon: string
  color: string
  order: number
  description: string
}

export const TOPICS: TopicMeta[] = [
  { id: 'arrays-hashing', title: 'Arrays & Hashing', slug: 'arrays-hashing', icon: '🔢', color: '#3b82f6', order: 1, description: 'Master hash maps, sets, and array manipulation techniques' },
  { id: 'two-pointers', title: 'Two Pointers', slug: 'two-pointers', icon: '👆', color: '#8b5cf6', order: 2, description: 'Solve problems efficiently using two pointer technique' },
  { id: 'sliding-window', title: 'Sliding Window', slug: 'sliding-window', icon: '🪟', color: '#06b6d4', order: 3, description: 'Optimize array/string problems with sliding window approach' },
  { id: 'stack', title: 'Stack', slug: 'stack', icon: '📚', color: '#f59e0b', order: 4, description: 'LIFO data structure for parentheses, monotonic, and bracket problems' },
  { id: 'binary-search', title: 'Binary Search', slug: 'binary-search', icon: '🔍', color: '#10b981', order: 5, description: 'Divide and conquer search in sorted arrays' },
  { id: 'linked-list', title: 'Linked List', slug: 'linked-list', icon: '🔗', color: '#f97316', order: 6, description: 'Pointers, reversals, fast & slow pointer techniques' },
  { id: 'trees', title: 'Trees', slug: 'trees', icon: '🌲', color: '#22c55e', order: 7, description: 'Binary trees, BST, traversals, and tree algorithms' },
  { id: 'tries', title: 'Tries', slug: 'tries', icon: '🌐', color: '#6366f1', order: 8, description: 'Prefix trees for string search and autocomplete' },
  { id: 'heap-priority-queue', title: 'Heap / Priority Queue', slug: 'heap-priority-queue', icon: '⛰️', color: '#ec4899', order: 9, description: 'Min/max heaps for k-th largest, merge k lists, etc.' },
  { id: 'backtracking', title: 'Backtracking', slug: 'backtracking', icon: '↩️', color: '#14b8a6', order: 10, description: 'Recursive exploration with pruning for combinatorics' },
  { id: 'graphs', title: 'Graphs', slug: 'graphs', icon: '🕸️', color: '#a855f7', order: 11, description: 'BFS, DFS, Union-Find, topological sort' },
  { id: 'advanced-graphs', title: 'Advanced Graphs', slug: 'advanced-graphs', icon: '🗺️', color: '#d946ef', order: 12, description: "Dijkstra's, Bellman-Ford, Floyd-Warshall, Prim's" },
  { id: '1-d-dynamic-programming', title: '1-D Dynamic Programming', slug: '1-d-dynamic-programming', icon: '📊', color: '#0ea5e9', order: 13, description: 'Fibonacci, climbing stairs, house robber patterns' },
  { id: '2-d-dynamic-programming', title: '2-D Dynamic Programming', slug: '2-d-dynamic-programming', icon: '📈', color: '#4ade80', order: 14, description: 'Knapsack, edit distance, LCS grid problems' },
  { id: 'greedy', title: 'Greedy', slug: 'greedy', icon: '💰', color: '#fbbf24', order: 15, description: 'Optimal local choices leading to global optimum' },
  { id: 'intervals', title: 'Intervals', slug: 'intervals', icon: '⏱️', color: '#fb7185', order: 16, description: 'Merge intervals, meeting rooms, sweep line' },
  { id: 'math-geometry', title: 'Math & Geometry', slug: 'math-geometry', icon: '📐', color: '#a3e635', order: 17, description: 'Number theory, prime, geometry algorithms' },
  { id: 'bit-manipulation', title: 'Bit Manipulation', slug: 'bit-manipulation', icon: '⚙️', color: '#38bdf8', order: 18, description: 'Bitwise operators, XOR tricks, bit counting' },
]

export const ROADMAP_EDGES: Record<string, string[]> = {
  'arrays-hashing': ['two-pointers', 'stack'],
  'two-pointers': ['sliding-window'],
  'stack': ['binary-search'],
  'sliding-window': ['linked-list'],
  'binary-search': ['linked-list'],
  'linked-list': ['trees'],
  'trees': ['tries', 'heap-priority-queue', 'backtracking'],
  'tries': ['graphs'],
  'heap-priority-queue': ['graphs'],
  'backtracking': ['graphs'],
  'graphs': ['advanced-graphs', '1-d-dynamic-programming'],
  '1-d-dynamic-programming': ['2-d-dynamic-programming'],
  '2-d-dynamic-programming': ['greedy'],
  'greedy': ['intervals'],
  'intervals': ['math-geometry'],
  'math-geometry': ['bit-manipulation'],
}

// Groups of topics by visual row for DAG rendering
export const ROADMAP_LAYERS: string[][] = [
  ['arrays-hashing'],
  ['two-pointers', 'stack'],
  ['sliding-window', 'binary-search'],
  ['linked-list'],
  ['trees'],
  ['tries', 'heap-priority-queue', 'backtracking'],
  ['graphs'],
  ['advanced-graphs', '1-d-dynamic-programming'],
  ['2-d-dynamic-programming'],
  ['greedy'],
  ['intervals'],
  ['math-geometry'],
  ['bit-manipulation'],
]
