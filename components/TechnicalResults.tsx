import React from 'react';
import { TechnicalAnalysis } from '../types';
import { Factory, Droplets, Cog, AlertOctagon, ArrowRight } from 'lucide-react';

interface TechnicalResultsProps {
  data: TechnicalAnalysis;
}

const SimpleListCard: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    items: string[]; 
    iconColor: string;
}> = ({ title, icon, items, iconColor }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className={iconColor}>{icon}</span>
            <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        </div>
        <div className="p-5 flex-1 bg-slate-50/30">
            {items.length > 0 ? (
                <ul className="space-y-3">
                    {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                             <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-slate-400`}></div>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-400 italic">Bez záznamov.</p>
            )}
        </div>
    </div>
);

export const TechnicalResults: React.FC<TechnicalResultsProps> = ({ data }) => {
  return (
    <div className="space-y-6">
       {/* Attention Card - Prominent */}
       <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="bg-orange-50/50 px-5 py-4 border-b border-orange-100 flex items-center gap-2">
            <AlertOctagon className="text-orange-600" size={18} />
            <h3 className="font-bold text-orange-900 text-sm">Pozor pri povoľovaní</h3>
        </div>
        <div className="divide-y divide-orange-50">
            {data.permitting_attention.length > 0 ? (
                data.permitting_attention.map((item, i) => (
                    <div key={i} className="p-5 hover:bg-orange-50/30 transition-colors">
                        <div className="font-semibold text-slate-900 text-sm mb-1">{item.item}</div>
                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">{item.reason}</p>
                        {item.legislation_reference && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wide font-bold">
                                <ArrowRight size={10} />
                                {item.legislation_reference}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="p-5 text-sm text-slate-400 italic">Neboli identifikované žiadne kritické body.</div>
            )}
        </div>
      </div>

      <SimpleListCard 
        title="Zdroje znečistenia" 
        icon={<Factory size={18} />}
        items={data.pollution_sources}
        iconColor="text-purple-600"
      />
      
      <SimpleListCard 
        title="Vodné stavby" 
        icon={<Droplets size={18} />}
        items={data.water_structures}
        iconColor="text-blue-600"
      />

      <SimpleListCard 
        title="Špecifické prevádzky" 
        icon={<Cog size={18} />}
        items={data.specific_operations}
        iconColor="text-slate-600"
      />
    </div>
  );
};