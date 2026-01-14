import React from 'react';
import { ComplianceAnalysis, ComplianceItem } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, FileText, ChevronRight } from 'lucide-react';

interface ComplianceResultsProps {
  data: ComplianceAnalysis;
}

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const styles = {
    HIGH: "bg-red-50 text-red-700 border-red-200",
    MEDIUM: "bg-orange-50 text-orange-700 border-orange-200",
    LOW: "bg-yellow-50 text-yellow-700 border-yellow-200",
    INFO: "bg-blue-50 text-blue-700 border-blue-200"
  };
  
  const labels = {
    HIGH: "Vysoká priorita",
    MEDIUM: "Stredná priorita",
    LOW: "Nízka priorita",
    INFO: "Informácia"
  };

  const style = styles[severity as keyof typeof styles] || styles.INFO;
  const label = labels[severity as keyof typeof labels] || "Info";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {label}
    </span>
  );
};

const ResultCard: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    items: ComplianceItem[]; 
    type: 'discrepancy' | 'missing' | 'match' 
}> = ({ title, icon, items, type }) => {
    
    if (items.length === 0) return null;

    const bgColors = {
        discrepancy: "bg-white",
        missing: "bg-white",
        match: "bg-white"
    };

    const headerColors = {
        discrepancy: "text-red-600 bg-red-50",
        missing: "text-orange-600 bg-orange-50",
        match: "text-green-600 bg-green-50"
    };

    return (
        <div className={`rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${bgColors[type]}`}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${headerColors[type]}`}>
                        {icon}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">
                    {items.length}
                </span>
            </div>
            <div className="divide-y divide-slate-50">
                {items.map((item, i) => (
                    <div key={i} className="p-5 hover:bg-slate-50 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-slate-400" />
                                <span className="text-sm font-semibold text-slate-700">{item.source_document}</span>
                            </div>
                            <SeverityBadge severity={item.severity} />
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {item.description}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                            {item.status_detail}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ComplianceResults: React.FC<ComplianceResultsProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Celkové zhrnutie</h3>
        <p className="text-lg text-slate-800 leading-relaxed font-medium relative z-10">{data.summary}</p>
      </div>

      <ResultCard 
        title="Rozpory a konflikty" 
        icon={<AlertCircle size={20} />} 
        items={data.discrepancies} 
        type="discrepancy" 
      />

      <ResultCard 
        title="Chýbajúce požiadavky" 
        icon={<AlertTriangle size={20} />} 
        items={data.missing_requirements} 
        type="missing" 
      />

      <ResultCard 
        title="Potvrdený súlad" 
        icon={<CheckCircle2 size={20} />} 
        items={data.matches} 
        type="match" 
      />
    </div>
  );
};