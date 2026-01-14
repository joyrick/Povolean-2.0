import React from 'react';
import { DiscussionReportData } from '../types';
import { FileText, Check, ChevronRight, Download, Users, AlertCircle, PenTool } from 'lucide-react';

interface DiscussionReportGeneratorProps {
  data: DiscussionReportData;
  onContinue: () => void;
}

export const DiscussionReportGenerator: React.FC<DiscussionReportGeneratorProps> = ({ data, onContinue }) => {
  
  // Create a blob for downloading the JSON (or formatted text)
  const downloadReport = () => {
    const reportText = JSON.stringify(data, null, 2);
    const blob = new Blob([reportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sprava_o_prerokovani_navrh.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Návrh Správy o prerokovaní</h2>
            <p className="text-sm text-slate-500 mt-1">Podľa prílohy č. 16 vyhl. 60/2025 Z. z.</p>
          </div>
          <button 
            onClick={downloadReport}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Download size={16} />
            Stiahnuť JSON
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 font-sans text-slate-800 leading-relaxed">
            
            {/* Title Section */}
            <div className="text-center border-b-2 border-slate-100 pb-6">
                <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Správa o prerokovaní stavebného zámeru</h1>
                <p className="text-slate-500 italic">Príloha k žiadosti o rozhodnutie o stavebnom zámere</p>
            </div>

            {/* A. List of Authorities */}
            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded flex items-center justify-center text-xs">A</span>
                    Zoznam dotknutých orgánov
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.A_authorities_list.map((auth, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <Users size={16} className="text-slate-400" />
                            <div>
                                <div className="font-semibold text-sm">{auth.name}</div>
                                <div className="text-xs text-slate-500">Oslovené: {auth.date_contacted}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* B. Opinions */}
            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded flex items-center justify-center text-xs">B</span>
                    Doručené stanoviská
                </h3>
                <div className="space-y-4">
                    {data.B_delivered_opinions.map((op, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-blue-900">{op.authority_name}</div>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                    {op.delivery_date}
                                </span>
                            </div>
                            <p className="text-sm text-slate-700 mb-3">{op.content_summary}</p>
                            {op.conditions.length > 0 && (
                                <div className="bg-yellow-50/50 p-3 rounded text-sm">
                                    <span className="font-semibold text-yellow-800 text-xs uppercase tracking-wide">Podmienky:</span>
                                    <ul className="list-disc list-inside mt-1 text-slate-700 space-y-1">
                                        {op.conditions.map((c, i) => (
                                            <li key={i}>{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

             {/* C. Silent Authorities */}
             {data.C_silent_authorities.length > 0 && (
                <section>
                     <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded flex items-center justify-center text-xs">C</span>
                        Orgány s fikciou súhlasu
                    </h3>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                         <ul className="space-y-2">
                            {data.C_silent_authorities.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-slate-600">
                                    <AlertCircle size={16} className="text-slate-400" />
                                    {item}
                                </li>
                            ))}
                         </ul>
                    </div>
                </section>
             )}

            {/* D & E Evaluation & Summary */}
            <div className="grid md:grid-cols-2 gap-8">
                <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded flex items-center justify-center text-xs">D</span>
                        Vyhodnotenie projektantom
                    </h3>
                    <p className="text-sm text-justify text-slate-700 leading-relaxed">
                        {data.D_projection_evaluation}
                    </p>
                </section>
                <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded flex items-center justify-center text-xs">E</span>
                        Zhrnutie súladu
                    </h3>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-sm font-medium text-green-900 flex items-start gap-2">
                            <Check size={16} className="mt-1 flex-shrink-0" />
                            {data.E_compliance_summary}
                        </p>
                    </div>
                </section>
            </div>

             {/* F. Signatures */}
             <section className="pt-8 border-t border-slate-100">
                 <div className="flex items-center gap-2 text-slate-400 mb-4">
                     <PenTool size={16} />
                     <span className="text-xs uppercase tracking-widest font-semibold">Podpisová doložka</span>
                 </div>
                 <div className="flex justify-between items-end mt-12 px-8">
                     <div className="text-center">
                         <div className="border-t border-slate-300 w-48 mb-2"></div>
                         <div className="text-sm font-semibold">Hlavný projektant</div>
                     </div>
                     <div className="text-center">
                         <div className="border-t border-slate-300 w-48 mb-2"></div>
                         <div className="text-sm font-semibold">Stavebník</div>
                     </div>
                 </div>
             </section>
        </div>

        {/* Footer Action */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
             <div className="text-sm text-slate-500">
                Skontrolujte údaje a pokračujte na hĺbkovú analýzu.
             </div>
             <button
                onClick={onContinue}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
             >
                Použiť pre analýzu
                <ChevronRight size={18} />
             </button>
        </div>
      </div>
    </div>
  );
};