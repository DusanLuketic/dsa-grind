'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAppStore } from '@/store/useAppStore'
import { PROBLEM_SETS, CORE_SKILLS_CATEGORIES } from '@/lib/constants'
import QuickStats from './QuickStats'
import ProgressOverview from './ProgressOverview'
import StreakTracker from './StreakTracker'
import RecommendedProblems from './RecommendedProblems'

interface TopicDisplay {
  id: string
  title: string
  slug: string
  icon: string
  color: string
  category?: string
}

interface TopicProgress {
  topicId: string
  solved: number
  total: number
}

interface StatsData {
  totalSolved: number
  solvedByDifficulty: { easy: number; medium: number; hard: number }
  averageTime: number
  totalProblems: number
}

interface RecommendedProblem {
  id: number
  title: string
  slug: string
  difficulty: string
  topicId: string
  topic: { title: string }
}

export interface ProblemSetData {
  id: string
  label: string
  icon: string
  stats: StatsData
  topicProgress: TopicProgress[]
  topics: TopicDisplay[]
  recommendedProblems: RecommendedProblem[]
}

interface DashboardClientProps {
  problemSets: ProblemSetData[]
  streakData: { currentStreak: number; totalActiveDays: number }
  todaySolved: { id: number; title: string; slug: string }[]
}

export default function DashboardClient({
  problemSets,
  streakData,
  todaySolved,
}: DashboardClientProps) {
  const activeProblemSet = useAppStore((s) => s.activeProblemSet)
  const setActiveProblemSet = useAppStore((s) => s.setActiveProblemSet)
  const [activeCategory, setActiveCategory] = useState('all')

  // Find active set index for base-ui tabs (0-indexed)
  const activeIndex = PROBLEM_SETS.findIndex((s) => s.id === activeProblemSet)
  const validIndex = activeIndex >= 0 ? activeIndex : 1 // default NC150

  const activeSetData = problemSets.find((s) => s.id === activeProblemSet) ?? problemSets[1]

  // Filter topics by category for Core Skills
  const filteredTopics =
    activeProblemSet === 'core-skills' && activeCategory !== 'all'
      ? activeSetData.topics.filter((t) => t.category === activeCategory)
      : activeSetData.topics

  // Filter topic progress to match filtered topics
  const filteredTopicIds = new Set(filteredTopics.map((t) => t.id))
  const filteredTopicProgress = activeSetData.topicProgress.filter((tp) =>
    filteredTopicIds.has(tp.topicId)
  )

  return (
    <div className="space-y-6">
      {/* Problem Set Tabs */}
      <Tabs
        defaultValue={validIndex}
        value={validIndex}
        onValueChange={(value) => {
          const idx = value as number
          const set = PROBLEM_SETS[idx]
          if (set) {
            setActiveProblemSet(set.id)
            setActiveCategory('all')
          }
        }}
      >
        <TabsList className="h-10">
          {PROBLEM_SETS.map((set) => (
            <TabsTrigger key={set.id} value={PROBLEM_SETS.indexOf(set)} className="gap-1.5 px-3">
              <span>{set.icon}</span>
              <span>{set.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {PROBLEM_SETS.map((set, idx) => {
          const setData = problemSets.find((s) => s.id === set.id)
          if (!setData) return null
          return (
            <TabsContent key={set.id} value={idx}>
              <div className="space-y-6 pt-2">
                {/* Difficulty summary line */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    <span className="text-green-500 font-medium">Easy</span>{' '}
                    {setData.stats.solvedByDifficulty.easy}
                  </span>
                  <span>
                    <span className="text-yellow-500 font-medium">Med</span>{' '}
                    {setData.stats.solvedByDifficulty.medium}
                  </span>
                  <span>
                    <span className="text-red-500 font-medium">Hard</span>{' '}
                    {setData.stats.solvedByDifficulty.hard}
                  </span>
                  <span className="ml-auto font-medium text-foreground">
                    {setData.stats.totalSolved}/{setData.stats.totalProblems} Solved
                  </span>
                </div>

                {/* Core Skills category sub-tabs */}
                {set.id === 'core-skills' && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveCategory('all')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        activeCategory === 'all'
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      }`}
                    >
                      All
                    </button>
                    {CORE_SKILLS_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          activeCategory === cat.id
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}

                <QuickStats stats={set.id === activeProblemSet ? { ...activeSetData.stats } : setData.stats} />

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-base">Topic Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProgressOverview
                        topics={set.id === activeProblemSet ? filteredTopics : setData.topics}
                        topicProgress={set.id === activeProblemSet ? filteredTopicProgress : setData.topicProgress}
                      />
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-base">Study Streak</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <StreakTracker
                          streakData={streakData}
                          todaySolved={todaySolved}
                        />
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-base">Recommended Next</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RecommendedProblems problems={setData.recommendedProblems} />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
