import React, { useEffect, useState } from "react";
import { fetchMockMapParcels } from "./services/mockRegistry";
import { MapParcelData } from "@/types/types";
import { MapPin, Check } from "lucide-react";

interface ParcelMapProps {
  onConfirmSelection: (selectedNumbers: string[]) => void;
}

export const ParcelMap: React.FC<ParcelMapProps> = ({ onConfirmSelection }) => {
  const [parcels, setParcels] = useState<MapParcelData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMockMapParcels().then(setParcels);
  }, []);

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleConfirm = () => {
    const selectedNumbers = parcels
      .filter((p) => selectedIds.has(p.id))
      .map((p) => p.number);

    if (selectedNumbers.length > 0) {
      onConfirmSelection(selectedNumbers);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Výber parciel z mapy
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Kliknutím na mapu označte parcely, ktoré sú predmetom konania.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {selectedIds.size}{" "}
              {selectedIds.size === 1
                ? "vybraná"
                : selectedIds.size >= 2 && selectedIds.size <= 4
                ? "vybrané"
                : "vybraných"}
            </span>
          </div>
        </div>

        <div className="p-8 bg-slate-100 flex justify-center overflow-auto">
          {/* Mock Cadastral Map SVG */}
          <svg
            width="550"
            height="400"
            viewBox="0 0 550 400"
            className="bg-white shadow-lg border border-slate-300"
          >
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {parcels.map((parcel) => {
              const isSelected = selectedIds.has(parcel.id);
              return (
                <g
                  key={parcel.id}
                  onClick={() => toggleSelection(parcel.id)}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                >
                  <path
                    d={parcel.d}
                    fill={isSelected ? "#3b82f6" : "#ffffff"}
                    fillOpacity={isSelected ? 0.2 : 1}
                    stroke={isSelected ? "#2563eb" : "#64748b"}
                    strokeWidth={isSelected ? 3 : 1}
                    className="hover:fill-blue-50"
                  />
                  <text
                    x={parcel.cx}
                    y={parcel.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-xs font-medium select-none pointer-events-none ${
                      isSelected ? "fill-blue-800 font-bold" : "fill-slate-600"
                    }`}
                  >
                    {parcel.number}
                  </text>
                  {isSelected && (
                    <circle
                      cx={parcel.cx}
                      cy={parcel.cy - 15}
                      r="4"
                      fill="#2563eb"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
          <button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center shadow-sm"
          >
            <Check className="w-5 h-5 mr-2" />
            Potvrdiť výber a pokračovať
          </button>
        </div>
      </div>
    </div>
  );
};
