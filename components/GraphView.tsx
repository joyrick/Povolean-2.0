import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Participant, Parcel } from '../types';

interface GraphViewProps {
  mainParcel: Parcel;
  participants: Participant[];
}

export const GraphView: React.FC<GraphViewProps> = ({ mainParcel, participants }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !mainParcel) return;

    const width = 600;
    const height = 400;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const nodes = [
      { id: 'main', label: `Parcela ${mainParcel.parcelNumber}`, type: 'main' },
      ...participants.map((p, i) => ({
        id: `p-${i}`,
        label: p.parcelNumber || p.name,
        type: 'neighbor',
        fullData: p
      }))
    ];

    const links = participants.map((_, i) => ({
      source: 'main',
      target: `p-${i}`
    }));

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .join("g");

    node.append("circle")
      .attr("r", (d) => d.type === 'main' ? 30 : 20)
      .attr("fill", (d) => d.type === 'main' ? "#3b82f6" : "#64748b");

    node.append("text")
      .text((d) => d.label)
      .attr("x", 0)
      .attr("y", (d) => d.type === 'main' ? 45 : 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#1e293b")
      .style("font-size", "12px")
      .style("font-weight", "500");

    node.append("title")
        .text(d => d.type === 'main' ? "Predmetná parcela" : (d as any).fullData?.name);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [mainParcel, participants]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">C3. Mapa vzťahov a účastníkov</h3>
      <div className="bg-slate-50 rounded-lg overflow-hidden flex justify-center border border-slate-100">
        <svg ref={svgRef} width={600} height={400} viewBox="0 0 600 400" className="w-full h-auto max-w-full" />
      </div>
      <p className="text-sm text-slate-500 mt-2 italic">
        *Grafická vizualizácia založená na identifikovaných susedných parcelách.
      </p>
    </div>
  );
};
