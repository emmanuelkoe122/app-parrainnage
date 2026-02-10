import React, { useState } from 'react';
import { useApp } from '../store';
import { ClassName, GroupType, Student } from '../types';
import { Plus, Trash2, Upload, FolderInput, FileImage, Users, Image as ImageIcon } from 'lucide-react';

const SetupPanel: React.FC = () => {
  const { students, settings, addStudent, addStudents, removeStudent, resetAll, updateSettings } = useApp();
  
  // Single Add State
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState<ClassName>(ClassName.BTS1);
  const [newPhoto, setNewPhoto] = useState<string>('');

  // Batch Add State
  const [batchClass, setBatchClass] = useState<ClassName>(ClassName.BTS1);
  const [isImporting, setIsImporting] = useState(false);

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
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateSettings({ logoUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newName) return;
    
    // Auto-determine type based on class name
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

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      
      setIsImporting(true);
      const files: File[] = Array.from(e.target.files);
      const processedStudents: Student[] = [];

      // Determine type once for the batch
      let type = GroupType.FILLEUL;
      if ([ClassName.BTS2, ClassName.LP2_AGITEL, ClassName.LP2_UPAF].includes(batchClass)) {
          type = GroupType.PARRAIN;
      }

      for (const file of files) {
          // Skip non-images
          if (!file.type.startsWith('image/')) continue;

          // Create promise to read file
          const studentPromise = new Promise<Student>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                  // Logic to extract name from filename
                  // 1. Remove extension
                  let name = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                  // 2. Replace underscores and hyphens with spaces
                  name = name.replace(/[-_]/g, ' ');
                  // 3. Remove extra spaces
                  name = name.trim();
                  // 4. Capitalize words
                  name = name.replace(/\b\w/g, l => l.toUpperCase());

                  resolve({
                      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                      name: name,
                      photoUrl: reader.result as string,
                      className: batchClass,
                      type: type,
                      isMatched: false
                  });
              };
              reader.readAsDataURL(file);
          });

          const student = await studentPromise;
          processedStudents.push(student);
      }

      addStudents(processedStudents);
      setIsImporting(false);
      e.target.value = ''; // Reset input to allow re-selecting same folder if needed
      alert(`${processedStudents.length} étudiants ont été importés avec succès dans la classe ${batchClass} !`);
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
        <div className="flex gap-4">
             <div className="relative">
                <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <label htmlFor="logo-upload" className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm transition flex items-center gap-2 border border-slate-600 shadow-sm">
                    <ImageIcon className="w-4 h-4" /> {settings.logoUrl ? 'Changer Logo' : 'Ajouter Logo'}
                </label>
            </div>
            <button onClick={resetAll} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition shadow-sm">
                Réinitialiser Tout
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Batch Import Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <FolderInput className="w-24 h-24" />
             </div>
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
                 <FolderInput className="w-5 h-5"/> Importation en Masse
             </h3>
             <p className="text-sm text-slate-400 mb-4">
                 Sélectionnez plusieurs images. Le nom du fichier sera utilisé comme nom de l'étudiant (ex: "jean_dupont.jpg" devient "Jean Dupont").
             </p>
             
             <div className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Classe de destination</label>
                    <select 
                    value={batchClass} 
                    onChange={e => setBatchClass(e.target.value as ClassName)}
                    className="w-full bg-slate-950 border border-slate-600 rounded p-2 focus:border-blue-500 outline-none"
                    >
                    {Object.values(ClassName).map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                    </select>
                </div>

                <div className="relative">
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleBatchUpload}
                        className="hidden"
                        id="batch-upload"
                        disabled={isImporting}
                    />
                    <label 
                        htmlFor="batch-upload" 
                        className={`cursor-pointer flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 hover:bg-slate-800/50 transition ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {isImporting ? (
                            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        ) : (
                            <>
                                <FileImage className="w-8 h-8 text-slate-500" />
                                <span className="text-slate-300 font-medium">Sélectionner des images</span>
                                <span className="text-xs text-slate-500">ou glisser-déposer ici</span>
                            </>
                        )}
                    </label>
                </div>
             </div>
        </div>

        {/* Manual Add Card */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400"><Plus className="w-5 h-5"/> Ajout Manuel</h3>
            <div className="space-y-4">
                <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="block text-sm text-slate-400 mb-1">Nom Complet</label>
                        <input 
                        type="text" 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 focus:border-green-500 outline-none"
                        placeholder="Ex: Jean Kouassi"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-slate-400 mb-1">Classe</label>
                        <select 
                        value={newClass} 
                        onChange={e => setNewClass(e.target.value as ClassName)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 focus:border-green-500 outline-none"
                        >
                        {Object.values(ClassName).map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Photo (Optionnel)</label>
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
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
                        <button 
                            onClick={handleAdd}
                            disabled={!newName}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded font-bold transition h-full"
                        >
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>
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