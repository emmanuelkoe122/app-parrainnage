import React from 'react';
import { useApp } from '../store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText } from 'lucide-react';

const ResultsPanel: React.FC = () => {
  const { matches } = useApp();

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Rapport de Parrainage", 14, 22);
    doc.setFontSize(11);
    doc.text(`Généré le ${new Date().toLocaleDateString()}`, 14, 30);

    const tableData = matches.map(m => [
      m.filleul.className,
      m.filleul.name,
      '->',
      m.parrain.name,
      m.parrain.className
    ]);

    autoTable(doc, {
      head: [['Classe Filleul', 'Nom Filleul', '', 'Nom Parrain', 'Classe Parrain']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237] } // Brand purple
    });

    doc.save('rapport-parrainage.pdf');
  };

  if (matches.length === 0) {
    return (
        <div className="p-8 text-center text-slate-500">
            <p>Aucun parrainage effectué pour le moment.</p>
        </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-900 rounded-lg shadow-xl mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-display text-white">Résultats ({matches.length})</h2>
        <button 
          onClick={exportPDF}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
        >
          <Download className="w-4 h-4" /> Exporter PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-800 uppercase text-xs font-bold text-slate-400">
            <tr>
              <th className="p-4 rounded-tl-lg">Filleul</th>
              <th className="p-4">Classe</th>
              <th className="p-4 text-center">Relation</th>
              <th className="p-4">Parrain</th>
              <th className="p-4 rounded-tr-lg">Classe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {matches.map((match) => (
              <tr key={match.id} className="hover:bg-slate-800/50 transition">
                <td className="p-4 flex items-center gap-3">
                    <img src={match.filleul.photoUrl} className="w-10 h-10 rounded-full object-cover border border-slate-600"/>
                    <span className="font-semibold text-white">{match.filleul.name}</span>
                </td>
                <td className="p-4 text-blue-400">{match.filleul.className}</td>
                <td className="p-4 text-center opacity-50">➜</td>
                <td className="p-4 flex items-center gap-3">
                    <img src={match.parrain.photoUrl} className="w-10 h-10 rounded-full object-cover border border-slate-600"/>
                    <span className="font-semibold text-white">{match.parrain.name}</span>
                </td>
                <td className="p-4 text-green-400">{match.parrain.className}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsPanel;