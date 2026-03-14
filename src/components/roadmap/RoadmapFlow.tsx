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

const NODE_WIDTH = 180
const NODE_HEIGHT = 56
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

  // Build edge paths with collision avoidance for multi-row spans
  function getEdgePath(start: TopicPosition, end: TopicPosition): string {
    const startY = start.y + NODE_HEIGHT / 2
    const endY = end.y - NODE_HEIGHT / 2
    const rowSpan = end.row - start.row

    if (rowSpan <= 1) {
      const controlY = (startY + endY) / 2
      return `M ${start.x} ${startY} C ${start.x} ${controlY}, ${end.x} ${controlY}, ${end.x} ${endY}`
    }

    // Multi-row span: check for intermediate node collisions
    let offsetX = 0
    const intermediateNodes = Array.from(topicPositions.values())
      .filter((pos) => pos.row > start.row && pos.row < end.row)

    for (const intNode of intermediateNodes) {
      const t = (intNode.row - start.row) / rowSpan
      const lineXAtRow = start.x + (end.x - start.x) * t
      if (Math.abs(intNode.x - lineXAtRow) < NODE_WIDTH * 0.7) {
        // Collision — curve away from the blocking node
        offsetX = intNode.x >= lineXAtRow ? -NODE_WIDTH * 0.8 : NODE_WIDTH * 0.8
        break
      }
    }

    const controlY = (startY + endY) / 2
    return `M ${start.x} ${startY} C ${start.x + offsetX} ${controlY}, ${end.x + offsetX} ${controlY}, ${end.x} ${endY}`
  }

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
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0.5 L0,5.5 L5,3 z" fill="rgba(255,255,255,0.5)" />
            </marker>
          </defs>
          {Object.entries(ROADMAP_EDGES).flatMap(([fromTopicId, toTopicIds]) => {
            const start = topicPositions.get(fromTopicId)
            if (!start) return []

            return toTopicIds.flatMap((toTopicId) => {
              const end = topicPositions.get(toTopicId)
              if (!end) return []

              return (
                <path
                  key={`${fromTopicId}-${toTopicId}`}
                  d={getEdgePath(start, end)}
                  stroke="rgba(255,255,255,0.4)"
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
