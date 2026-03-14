"use client";

import { ROADMAP_EDGES, ROADMAP_LAYERS } from "@/lib/constants";
import TopicNode from "./TopicNode";

interface TopicWithProgress {
  id: string;
  title: string;
  slug: string;
  icon: string;
  color: string;
  solved: number;
  total: number;
}

interface RoadmapFlowProps {
  topics: TopicWithProgress[];
}

interface TopicPosition {
  row: number;
  x: number;
  y: number;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 56;
const ROW_GAP = 72;

// Hand-tuned center-X positions for a natural tree-structured layout.
// Children cluster beneath their parents rather than spreading across the full width.
const NODE_X: Record<string, number> = {
  // ── trunk (centered group) ──
  "arrays-hashing": 440,
  "two-pointers": 345,
  stack: 540,
  "binary-search": 240,
  "sliding-window": 440,
  "linked-list": 640,
  trees: 400,
  // ── left subtree ──
  tries: 240,
  "heap-priority-queue": 320,
  intervals: 110,
  greedy: 320,
  "advanced-graphs": 530,
  // ── right subtree ──
  backtracking: 765,
  graphs: 640,
  "1-d-dynamic-programming": 880,
  "2-d-dynamic-programming": 770,
  "bit-manipulation": 990,
  "math-geometry": 810,
};

export default function RoadmapFlow({ topics }: RoadmapFlowProps) {
  const topicMap = new Map(topics.map((topic) => [topic.id, topic]));

  const totalWidth = Math.max(...Object.values(NODE_X)) + NODE_WIDTH / 2;
  const totalHeight =
    ROADMAP_LAYERS.length * NODE_HEIGHT + (ROADMAP_LAYERS.length - 1) * ROW_GAP;

  // Compute final positions from explicit X + layer row index
  const topicPositions = new Map<string, TopicPosition>();
  ROADMAP_LAYERS.forEach((layer, rowIndex) => {
    layer.forEach((topicId) => {
      const x = NODE_X[topicId];
      if (x === undefined) return;
      const y = rowIndex * (NODE_HEIGHT + ROW_GAP) + NODE_HEIGHT / 2;
      topicPositions.set(topicId, { row: rowIndex + 1, x, y });
    });
  });

  // Build edge paths with collision avoidance for multi-row spans
  function getEdgePath(start: TopicPosition, end: TopicPosition): string {
    const startY = start.y + NODE_HEIGHT / 2;
    const endY = end.y - NODE_HEIGHT / 2;
    const rowSpan = end.row - start.row;

    if (rowSpan <= 1) {
      const controlY = (startY + endY) / 2;
      return `M ${start.x} ${startY} C ${start.x} ${controlY}, ${end.x} ${controlY}, ${end.x} ${endY}`;
    }

    // Multi-row span: check for intermediate node collisions
    let offsetX = 0;
    const intermediateNodes = Array.from(topicPositions.values()).filter(
      (pos) => pos.row > start.row && pos.row < end.row,
    );

    for (const intNode of intermediateNodes) {
      const t = (intNode.row - start.row) / rowSpan;
      const lineXAtRow = start.x + (end.x - start.x) * t;
      if (Math.abs(intNode.x - lineXAtRow) < NODE_WIDTH * 0.7) {
        // Collision — curve away from the blocking node
        offsetX =
          intNode.x >= lineXAtRow ? -NODE_WIDTH * 0.8 : NODE_WIDTH * 0.8;
        break;
      }
    }

    const controlY = (startY + endY) / 2;
    return `M ${start.x} ${startY} C ${start.x + offsetX} ${controlY}, ${end.x + offsetX} ${controlY}, ${end.x} ${endY}`;
  }

  return (
    <div className="min-w-160 pb-8">
      <div
        className="relative"
        style={{ width: totalWidth, height: totalHeight }}
      >
        <svg
          className="pointer-events-none absolute left-0 top-0"
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
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
          {Object.entries(ROADMAP_EDGES).flatMap(
            ([fromTopicId, toTopicIds]) => {
              const start = topicPositions.get(fromTopicId);
              if (!start) return [];

              return toTopicIds.flatMap((toTopicId) => {
                const end = topicPositions.get(toTopicId);
                if (!end) return [];

                return (
                  <path
                    key={`${fromTopicId}-${toTopicId}`}
                    d={getEdgePath(start, end)}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#roadmap-arrow)"
                  />
                );
              });
            },
          )}
        </svg>

        {ROADMAP_LAYERS.flatMap((layer) =>
          layer.map((topicId) => {
            const topic = topicMap.get(topicId);
            const pos = topicPositions.get(topicId);
            if (!topic || !pos) return null;

            return (
              <div
                key={topicId}
                className="absolute"
                style={{
                  left: pos.x - NODE_WIDTH / 2,
                  top: pos.y - NODE_HEIGHT / 2,
                  width: NODE_WIDTH,
                  height: NODE_HEIGHT,
                }}
              >
                <TopicNode topic={topic} />
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
