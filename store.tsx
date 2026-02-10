import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Match, INITIAL_STUDENTS, ClassName, GroupType, PAIRING_RULES } from './types';

interface AppSettings {
  logoUrl: string | null;
}

interface AppContextType {
  students: Student[];
  matches: Match[];
  settings: AppSettings;
  addStudent: (student: Student) => void;
  addStudents: (newStudents: Student[]) => void;
  removeStudent: (id: string) => void;
  createMatch: (filleulId: string, parrainId: string) => void;
  resetAll: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  getAvailableFilleuls: (className: ClassName) => Student[];
  getAvailableParrains: (className: ClassName) => Student[];
  getPossiblePairing: () => { ruleIndex: number, source: ClassName, target: ClassName, available: boolean } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or use initial
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('pa_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('pa_matches');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('pa_settings');
    return saved ? JSON.parse(saved) : { logoUrl: null };
  });

  useEffect(() => {
    localStorage.setItem('pa_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('pa_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('pa_settings', JSON.stringify(settings));
  }, [settings]);

  const addStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const addStudents = (newStudents: Student[]) => {
    setStudents(prev => [...prev, ...newStudents]);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const createMatch = (filleulId: string, parrainId: string) => {
    const filleul = students.find(s => s.id === filleulId);
    const parrain = students.find(s => s.id === parrainId);

    if (filleul && parrain) {
      const newMatch: Match = {
        id: Date.now().toString(),
        filleul,
        parrain,
        timestamp: Date.now(),
      };
      
      setMatches(prev => [...prev, newMatch]);
      setStudents(prev => prev.map(s => {
        if (s.id === filleulId || s.id === parrainId) {
          return { ...s, isMatched: true };
        }
        return s;
      }));
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
      setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetAll = () => {
    if (window.confirm("Voulez-vous vraiment tout réinitialiser ? Cela effacera tous les parrainages et les paramètres.")) {
       setStudents(INITIAL_STUDENTS);
       setMatches([]);
       setSettings({ logoUrl: null });
       localStorage.removeItem('pa_students');
       localStorage.removeItem('pa_matches');
       localStorage.removeItem('pa_settings');
    }
  };

  const getAvailableFilleuls = (className: ClassName) => {
    return students.filter(s => s.className === className && s.type === GroupType.FILLEUL && !s.isMatched);
  };

  const getAvailableParrains = (className: ClassName) => {
    return students.filter(s => s.className === className && s.type === GroupType.PARRAIN && !s.isMatched);
  };

  const getPossiblePairing = () => {
    // Determine which rule has available students
    for (let i = 0; i < PAIRING_RULES.length; i++) {
        const rule = PAIRING_RULES[i];
        const filleuls = getAvailableFilleuls(rule.source);
        const parrains = getAvailableParrains(rule.target);
        if (filleuls.length > 0 && parrains.length > 0) {
            return { ruleIndex: i, source: rule.source, target: rule.target, available: true };
        }
    }
    return null;
  };

  return (
    <AppContext.Provider value={{ 
      students, 
      matches, 
      settings,
      addStudent,
      addStudents,
      removeStudent, 
      createMatch, 
      resetAll,
      updateSettings,
      getAvailableFilleuls,
      getAvailableParrains,
      getPossiblePairing
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};