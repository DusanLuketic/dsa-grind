'use client'

import { ROADMAP_EDGES, ROADMAP_LAYERS } from '@/lib/constants'
import TopicNode from './TopicNode'

interface TopicWithProgress {
  id: string
  title: string
  slug: string
  icon: string
  color: string
  solved: number
  total: number
}

interface RoadmapFlowProps {
  topics: TopicWithProgress[]
}

interface TopicPosition {
  col: number
  row: number
  x: number
  y: number
}

const NODE_WIDTH = 160
const NODE_HEIGHT = 104
const COL_GAP = 48
const ROW_GAP = 72

function getCenteredColumn(layerSize: number, index: number, maxColumns: number): number {
  if (layerSize <= 1) return Math.ceil(maxColumns / 2)
  const spread = (index * (maxColumns - 1)) / (layerSize - 1)
  return Math.round(spread) + 1
}

export default function RoadmapFlow({ topics }: RoadmapFlowProps) {
  const topicMap = new Map(topics.map((topic) => [topic.id, topic]))
  const maxColumns = Math.max(...ROADMAP_LAYERS.map((layer) => layer.length))

  const gridWidth = maxColumns * NODE_WIDTH + (maxColumns - 1) * COL_GAP
  const gridHeight = ROADMAP_LAYERS.length * NODE_HEIGHT + (ROADMAP_LAYERS.length - 1) * ROW_GAP

  const topicPositions = new Map<string, TopicPosition>()
  ROADMAP_LAYERS.forEach((layer, rowIndex) => {
    layer.forEach((topicId, layerIndex) => {
      const col = getCenteredColumn(layer.length, layerIndex, maxColumns)
      const x = (col - 1) * (NODE_WIDTH + COL_GAP) + NODE_WIDTH / 2
      const y = rowIndex * (NODE_HEIGHT + ROW_GAP) + NODE_HEIGHT / 2
      topicPositions.set(topicId, { col, row: rowIndex + 1, x, y })
    })
  })

  return (
    <div className="min-w-[640px] pb-8">
      <div className="relative" style={{ width: gridWidth, height: gridHeight }}>
        <svg
          className="pointer-events-none absolute left-0 top-0"
          width={gridWidth}
          height={gridHeight}
          viewBox={`0 0 ${gridWidth} ${gridHeight}`}
          aria-hidden="true"
        >
          <defs>
            <marker
              id="roadmap-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L6,3 z" className="fill-muted-foreground/60" />
            </marker>
          </defs>
          {Object.entries(ROADMAP_EDGES).flatMap(([fromTopicId, toTopicIds]) => {
            const start = topicPositions.get(fromTopicId)
            if (!start) return []

            return toTopicIds.flatMap((toTopicId) => {
              const end = topicPositions.get(toTopicId)
              if (!end) return []

              const startY = start.y + NODE_HEIGHT / 2 - 8
              const endY = end.y - NODE_HEIGHT / 2 + 8
              const controlY = (startY + endY) / 2

              return (
                <path
                  key={`${fromTopicId}-${toTopicId}`}
                  d={`M ${start.x} ${startY} C ${start.x} ${controlY}, ${end.x} ${controlY}, ${end.x} ${endY}`}
                  className="stroke-muted-foreground/45"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#roadmap-arrow)"
                />
              )
            })
          })}
        </svg>

        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `repeat(${maxColumns}, ${NODE_WIDTH}px)`,
            gridAutoRows: `${NODE_HEIGHT}px`,
            columnGap: `${COL_GAP}px`,
            rowGap: `${ROW_GAP}px`,
          }}
        >
          {ROADMAP_LAYERS.flatMap((layer, rowIndex) =>
            layer.map((topicId, layerIndex) => {
              const topic = topicMap.get(topicId)
              if (!topic) return null

              return (
                <div
                  key={topicId}
                  style={{
                    gridColumnStart: getCenteredColumn(layer.length, layerIndex, maxColumns),
                    gridRowStart: rowIndex + 1,
                  }}
                >
                  <TopicNode topic={topic} />
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
