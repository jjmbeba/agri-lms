"use client";

import {
  Background,
  Controls,
  type Edge,
  Handle,
  MiniMap,
  type Node,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import type React from "react";
import { useEffect, useMemo } from "react";
import "@xyflow/react/dist/style.css";
import type { CourseWithDepartment } from "./pathway-editor";

type PathwayVisualizerProps = {
  courses: CourseWithDepartment[];
};

const HORIZONTAL_GAP = 280;
const START_X = 50;
const START_Y = 80;

function PathwayNode({ data }: { data: { label: string; index: number } }) {
  return (
    <div className="min-w-[220px] rounded-md border bg-card px-4 py-3 shadow-xs">
      <div className="text-muted-foreground text-xs">Step {data.index + 1}</div>
      <div className="font-semibold text-card-foreground text-sm leading-snug">
        {data.label}
      </div>
      <Handle position={Position.Left} type="target" />
      <Handle position={Position.Right} type="source" />
    </div>
  );
}

const nodeTypes = { pathway: PathwayNode };

export const PathwayVisualizer: React.FC<PathwayVisualizerProps> = ({
  courses,
}) => {
  const initialNodes: Node[] = useMemo(() => {
    return courses.map((cw, idx) => ({
      id: String(cw.course._id),
      position: { x: START_X + idx * HORIZONTAL_GAP, y: START_Y },
      data: { label: cw.course.title, index: idx },
      draggable: false,
      selectable: false,
      type: "pathway",
    }));
  }, [courses]);

  const initialEdges: Edge[] = useMemo(() => {
    const edgeList: Edge[] = [];
    for (let i = 0; i < courses.length - 1; i++) {
      edgeList.push({
        id: `${courses[i].course._id}->${courses[i + 1].course._id}`,
        source: String(courses[i].course._id),
        target: String(courses[i + 1].course._id),
        animated: false,
        selectable: false,
        type: "smoothstep",
        style: { strokeWidth: 2 },
      });
    }
    return edgeList;
  }, [courses]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (courses.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded border text-muted-foreground">
        No courses to visualize yet.
      </div>
    );
  }

  return (
    <div className="h-[360px] w-full rounded border">
      <ReactFlow
        edges={edges}
        elementsSelectable={false}
        fitView
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        nodeTypes={nodeTypes}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
      >
        <Background />
        <MiniMap pannable zoomable />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export default PathwayVisualizer;
