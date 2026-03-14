import "dotenv/config"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { TOPICS } from "../src/lib/constants"

const require = createRequire(import.meta.url)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { DatabaseSync } = require("node:sqlite") as { DatabaseSync: new (path: string) => any }

interface NeetCodeProblem {
  neetcode150: boolean
  problem: string
  link: string
  video?: string
  difficulty: string
  pattern: string
}

const patternToTopicId: Record<string, string> = {
  "Arrays & Hashing": "arrays-hashing",
  "Two Pointers": "two-pointers",
  "Sliding Window": "sliding-window",
  Stack: "stack",
  "Binary Search": "binary-search",
  "Linked List": "linked-list",
  Trees: "trees",
  Tries: "tries",
  "Heap / Priority Queue": "heap-priority-queue",
  Backtracking: "backtracking",
  Graphs: "graphs",
  "Advanced Graphs": "advanced-graphs",
  "1-D Dynamic Programming": "1-d-dynamic-programming",
  "2-D Dynamic Programming": "2-d-dynamic-programming",
  Greedy: "greedy",
  Intervals: "intervals",
  "Math & Geometry": "math-geometry",
  "Bit Manipulation": "bit-manipulation",
}

const resources = [
  { title: "NeetCode", url: "https://www.youtube.com/@NeetCode", type: "VIDEO", source: "YouTube", description: "Clear explanations of LeetCode problems with optimal solutions" },
  { title: "Back To Back SWE", url: "https://www.youtube.com/@BackToBackSWE", type: "VIDEO", source: "YouTube", description: "In-depth algorithm explanations with whiteboard walkthroughs" },
  { title: "Errichto Algorithms", url: "https://www.youtube.com/@Errichto", type: "VIDEO", source: "YouTube", description: "Competitive programming and algorithm tutorials" },
  { title: "WilliamFiset", url: "https://www.youtube.com/@WilliamFiset-videos", type: "VIDEO", source: "YouTube", description: "Graph algorithms and data structures playlist" },
  { title: "Abdul Bari", url: "https://www.youtube.com/@abdul_bari", type: "VIDEO", source: "YouTube", description: "Comprehensive algorithms course from basics to advanced" },
  { title: "NeetCode.io", url: "https://neetcode.io/courses", type: "COURSE", source: "NeetCode", description: "Structured DSA courses with video + practice problems" },
  { title: "Algorithms, Part I — Coursera", url: "https://www.coursera.org/learn/algorithms-part1", type: "COURSE", source: "Coursera", description: "Princeton University's algorithms course (free audit)" },
  { title: "MIT 6.006 Introduction to Algorithms", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", type: "COURSE", source: "MIT OCW", description: "MIT's foundational algorithms course with lecture notes" },
  { title: "Grokking the Coding Interview", url: "https://www.designgurus.io/course/grokking-the-coding-interview", type: "COURSE", source: "DesignGurus", description: "Pattern-based approach to coding interviews" },
  { title: "LeetCode", url: "https://leetcode.com", type: "TOOL", source: "LeetCode", description: "The premier platform for coding interview practice" },
  { title: "Visualgo", url: "https://visualgo.net", type: "TOOL", source: "Visualgo", description: "Visual animations for data structures and algorithms" },
  { title: "Big-O Cheatsheet", url: "https://www.bigocheatsheet.com", type: "TOOL", source: "bigocheatsheet.com", description: "Time and space complexity reference for common algorithms" },
  { title: "CS50 Duck Debugger", url: "https://cs50.ai", type: "TOOL", source: "Harvard CS50", description: "AI-powered debugging assistant for learning programmers" },
  { title: "Cracking the Coding Interview", url: "https://www.crackingthecodinginterview.com", type: "ARTICLE", source: "Book", description: "The classic 189 programming interview questions and answers" },
  { title: "Introduction to Algorithms (CLRS)", url: "https://mitpress.mit.edu/9780262046305/", type: "ARTICLE", source: "Book", description: "The definitive reference textbook for algorithms" },
  { title: "The Algorithm Design Manual", url: "https://www.algorist.com", type: "ARTICLE", source: "Book", description: "Practical algorithm design with real-world applications" },
  { title: "Competitive Programmer's Handbook", url: "https://cses.fi/book/book.pdf", type: "ARTICLE", source: "Book", description: "Free comprehensive guide to competitive programming" },
]

function normalizeSlug(link: string): string {
  return link.replace(/^\/+|\/+$/g, "")
}

function resolveDbPath(): string {
  const rawUrl = process.env.DATABASE_URL
  if (!rawUrl?.startsWith("file:")) {
    throw new Error("DATABASE_URL must be a Prisma SQLite file URL")
  }

  return path.resolve(process.cwd(), rawUrl.replace(/^file:/, ""))
}

function placeholders(count: number): string {
  return Array.from({ length: count }, () => "?").join(",")
}

async function main() {
  console.log("Seeding database...")

  const dataPath = path.resolve(process.cwd(), "prisma", "data", "neetcode150.json")
  const rawData = fs.readFileSync(dataPath, "utf-8")
  const allProblems: NeetCodeProblem[] = JSON.parse(rawData)
  const neetcode150 = allProblems.filter((problem) => problem.neetcode150)

  console.log(`Found ${neetcode150.length} NeetCode 150 problems`)
  if (neetcode150.length !== 150) {
    throw new Error(`Expected 150 NeetCode problems in snapshot, found ${neetcode150.length}`)
  }

  const db = new DatabaseSync(resolveDbPath())
  db.exec("PRAGMA foreign_keys = ON")
  db.exec("BEGIN")

  try {
    const upsertTopic = db.prepare(`
      INSERT INTO "Topic" (id, title, slug, icon, color, "order", description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        slug = excluded.slug,
        icon = excluded.icon,
        color = excluded.color,
        "order" = excluded."order",
        description = excluded.description
    `)

    for (const topic of TOPICS) {
      upsertTopic.run(topic.id, topic.title, topic.slug, topic.icon, topic.color, topic.order, topic.description)
    }

    const topicIds = TOPICS.map((topic) => topic.id)
    const topicIdPlaceholders = placeholders(topicIds.length)
    db.prepare(`UPDATE "StudySession" SET "topicId" = NULL WHERE "topicId" IS NOT NULL AND "topicId" NOT IN (${topicIdPlaceholders})`).run(...topicIds)
    db.prepare(`DELETE FROM "Topic" WHERE id NOT IN (${topicIdPlaceholders})`).run(...topicIds)

    db.exec("DELETE FROM \"Progress\"")
    db.exec("DELETE FROM \"Problem\"")

    const insertProblem = db.prepare(`
      INSERT INTO "Problem" (title, slug, difficulty, "leetcodeUrl", "youtubeUrl", "topicId", pattern, "order")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const topicOrderCounters: Record<string, number> = {}
    for (const problem of neetcode150) {
      const topicId = patternToTopicId[problem.pattern] ?? "arrays-hashing"
      const slug = normalizeSlug(problem.link)
      topicOrderCounters[topicId] = (topicOrderCounters[topicId] ?? 0) + 1

      const youtubeUrl = problem.video
        ? `https://www.youtube.com/watch?v=${problem.video}`
        : `https://www.youtube.com/results?search_query=neetcode+${encodeURIComponent(problem.problem)}`

      insertProblem.run(
        problem.problem,
        slug,
        problem.difficulty.toUpperCase(),
        `https://leetcode.com/problems/${slug}/`,
        youtubeUrl,
        topicId,
        problem.pattern,
        topicOrderCounters[topicId],
      )
    }

    db.exec("DELETE FROM \"Resource\"")
    const insertResource = db.prepare(`
      INSERT INTO "Resource" (title, url, type, source, description)
      VALUES (?, ?, ?, ?, ?)
    `)

    for (const resource of resources) {
      insertResource.run(resource.title, resource.url, resource.type, resource.source, resource.description)
    }

    const topics = Number(db.prepare('SELECT COUNT(*) AS count FROM "Topic"').get().count)
    const problems = Number(db.prepare('SELECT COUNT(*) AS count FROM "Problem"').get().count)
    const seededResources = Number(db.prepare('SELECT COUNT(*) AS count FROM "Resource"').get().count)
    const emptyYoutube = Number(db.prepare("SELECT COUNT(*) AS count FROM \"Problem\" WHERE \"youtubeUrl\" = ''").get().count)

    console.log(`Topics: ${topics} (expected: 18)`)
    console.log(`Problems: ${problems} (expected: 150)`)
    console.log(`Resources: ${seededResources} (expected: 17)`)
    console.log(`Problems with empty youtubeUrl: ${emptyYoutube} (expected: 0)`)

    if (topics !== 18) throw new Error(`Expected 18 topics, got ${topics}`)
    if (problems !== 150) throw new Error(`Expected 150 problems, got ${problems}`)
    if (seededResources !== 17) throw new Error(`Expected 17 resources, got ${seededResources}`)
    if (emptyYoutube !== 0) throw new Error(`Expected 0 empty youtubeUrl values, got ${emptyYoutube}`)

    db.exec("COMMIT")
    console.log("All seed checks passed")
  } catch (error) {
    db.exec("ROLLBACK")
    throw error
  } finally {
    db.close()
  }
}

main().catch((error) => {
  console.error("Seed failed:", error)
  process.exit(1)
})
