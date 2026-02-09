import React, { useState } from 'react';
import { useApp } from '../store';
import { ClassName, GroupType, Student } from '../types';
import { Plus, Trash2, Upload, Users } from 'lucide-react';

const SetupPanel: React.FC = () => {
  const { students, addStudent, removeStudent, resetAll } = useApp();
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState<ClassName>(ClassName.BTS1);
  const [newPhoto, setNewPhoto] = useState<string>('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newName) return;
    
    // Auto-determine type based on class name for simplicity in this specific school logic
    let type = GroupType.FILLEUL;
    if ([ClassName.BTS2, ClassName.LP2_AGITEL, ClassName.LP2_UPAF].includes(newClass)) {
        type = GroupType.PARRAIN;
    }

    const student: Student = {
      id: Date.now().toString(),
      name: newName,
      className: newClass,
      type: type,
      photoUrl: newPhoto || `https://picsum.photos/200/300?random=${Date.now()}`,
      isMatched: false,
    };

    addStudent(student);
    setNewName('');
    setNewPhoto('');
  };

  const groupedStudents = students.reduce((acc, s) => {
    if (!acc[s.className]) acc[s.className] = [];
    acc[s.className].push(s);
    return acc;
  }, {} as Record<ClassName, Student[]>);

  return (
    <div className="p-6 bg-slate-900 rounded-lg shadow-xl text-slate-100 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display text-brand-fire">Gestion des Dossiers</h2>
        <button onClick={resetAll} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition">
            Réinitialiser Tout
        </button>
      </div>

      {/* Add Form */}
      <div className="bg-slate-800 p-6 rounded-lg mb-8 border border-slate-700">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-green-400"/> Ajouter un Étudiant</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-slate-400 mb-1">Nom Complet</label>
            <input 
              type="text" 
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 focus:border-brand-purple outline-none"
              placeholder="Ex: Jean Kouassi"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-slate-400 mb-1">Classe / Dossier</label>
            <select 
              value={newClass} 
              onChange={e => setNewClass(e.target.value as ClassName)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 focus:border-brand-purple outline-none"
            >
              {Object.values(ClassName).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-slate-400 mb-1">Photo (Optionnel)</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer flex items-center justify-center gap-2 w-full bg-slate-900 border border-slate-600 rounded p-2 hover:bg-slate-700 transition">
                <Upload className="w-4 h-4" /> {newPhoto ? 'Photo chargée' : 'Choisir une image'}
              </label>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            disabled={!newName}
            className="bg-brand-purple hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-2 rounded font-bold transition"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* List Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(ClassName).map(className => (
          <div key={className} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="font-display text-xl mb-3 text-brand-fire flex justify-between">
                {className} 
                <span className="text-sm font-sans text-slate-400 flex items-center gap-1">
                    <Users className="w-4 h-4"/> {(groupedStudents[className] || []).length}
                </span>
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {groupedStudents[className]?.map(s => (
                <div key={s.id} className={`flex items-center gap-3 p-2 rounded ${s.isMatched ? 'bg-slate-700/50 opacity-50' : 'bg-slate-700'}`}>
                  <img src={s.photoUrl} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-sm truncate">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.isMatched ? 'Parrainé' : 'En attente'}</p>
                  </div>
                  <button onClick={() => removeStudent(s.id)} className="text-slate-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!groupedStudents[className] || groupedStudents[className].length === 0) && (
                <p className="text-slate-500 text-sm italic">Aucun étudiant</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetupPanel;