"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from "lucide-react";

type FileNode = {
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
};

// Mock file hierarchy based on the image
const mockFileHierarchy: FileNode[] = [
  {
    name: "2.1 Nuppu10 - SO215AB",
    type: "folder",
    children: [
      {
        name: "1_IC_Inzinierska_cinnost",
        type: "folder",
        children: [
          {
            name: "IC3_Stavebne_povolenie",
            type: "folder",
            children: [
              {
                name: "ZSPD",
                type: "folder",
                children: [
                  {
                    name: "EIA",
                    type: "folder",
                    children: [
                      { name: "01_Oznamenie_SO215AB_final.pdf", type: "file" },
                      { name: "02_Rozhodnutie_EIA.pdf", type: "file" },
                      { name: "03_Stanovisko_MZP.pdf", type: "file" },
                    ],
                  },
                  { name: "Technicka_sprava.pdf", type: "file" },
                  { name: "Situacia_stavby.dwg", type: "file" },
                ],
              },
              { name: "Stavebny_zamer.pdf", type: "file" },
              { name: "Projektova_dokumentacia.zip", type: "file" },
            ],
          },
          {
            name: "IC2_Uzemne_rozhodnutie",
            type: "folder",
            children: [
              { name: "Uzemne_rozhodnutie.pdf", type: "file" },
              { name: "Situacia.pdf", type: "file" },
            ],
          },
        ],
      },
      {
        name: "2_Podklady",
        type: "folder",
        children: [
          { name: "Kataster_mapa.pdf", type: "file" },
          { name: "Geodeticky_zameranie.dwg", type: "file" },
          { name: "Vlastnicke_listy.pdf", type: "file" },
        ],
      },
      {
        name: "3_Stanoviska",
        type: "folder",
        children: [
          { name: "Stanovisko_OR_HaZZ.pdf", type: "file" },
          { name: "Stanovisko_KPU.pdf", type: "file" },
          { name: "Stanovisko_SPP.pdf", type: "file" },
          { name: "Stanovisko_ZSE.pdf", type: "file" },
        ],
      },
    ],
  },
];

function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }): ReactElement {
  const [isOpen, setIsOpen] = useState(depth < 2); // Auto-expand first 2 levels

  const isFolder = node.type === "folder";
  const hasChildren = isFolder && node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors ${
          depth === 0 ? "font-medium" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isFolder && setIsOpen(!isOpen)}
      >
        {/* Chevron for folders */}
        {isFolder ? (
          <span className="w-4 h-4 flex items-center justify-center text-slate-400">
            {hasChildren ? (
              isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : null}
          </span>
        ) : (
          <span className="w-4 h-4" />
        )}

        {/* Icon */}
        {isFolder ? (
          isOpen ? (
            <FolderOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
          ) : (
            <Folder className="w-5 h-5 text-amber-500 flex-shrink-0" />
          )
        ) : (
          <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}

        {/* Name */}
        <span className={`text-sm ${isFolder ? "text-slate-800" : "text-slate-600"} truncate`}>
          {node.name}
        </span>

        {/* Badge for folders */}
        {isFolder && hasChildren && (
          <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            {node.children!.length}
          </span>
        )}
      </div>

      {/* Children */}
      {isFolder && isOpen && hasChildren && (
        <div>
          {node.children!.map((child, index) => (
            <FileTreeNode key={`${child.name}-${index}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileHierarchyPanel(): ReactElement {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-900">Hierarchia súborov</h3>
          <p className="text-sm text-slate-500">Štruktúra projektových súborov</p>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
          Nuppu
        </span>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto -mx-2">
        {mockFileHierarchy.map((node, index) => (
          <FileTreeNode key={`${node.name}-${index}`} node={node} depth={0} />
        ))}
      </div>

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span>Celkom: 15 súborov</span>
          <span>Posledná aktualizácia: 14.01.2026</span>
        </div>
      </div>
    </div>
  );
}
