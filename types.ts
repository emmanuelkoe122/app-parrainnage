export enum GroupType {
  FILLEUL = 'FILLEUL',
  PARRAIN = 'PARRAIN'
}

export enum ClassName {
  BTS1 = 'BTS 1',
  BTS2 = 'BTS 2',
  LP1_AGITEL = 'LP 1 AGITEL',
  LP2_AGITEL = 'LP 2 AGITEL',
  LP1_UPAF = 'LP 1 UPAF',
  LP2_UPAF = 'LP 2 UPAF'
}

export interface Student {
  id: string;
  name: string;
  photoUrl: string; // Base64 or URL
  className: ClassName;
  type: GroupType;
  isMatched: boolean;
}

export interface PairingRule {
  source: ClassName;
  target: ClassName;
}

export interface Match {
  id: string;
  filleul: Student;
  parrain: Student;
  timestamp: number;
}

export const PAIRING_RULES: PairingRule[] = [
  { source: ClassName.BTS1, target: ClassName.BTS2 },
  { source: ClassName.LP1_AGITEL, target: ClassName.LP2_AGITEL },
  { source: ClassName.LP1_UPAF, target: ClassName.LP2_UPAF },
];

export const INITIAL_STUDENTS: Student[] = [
  // Mocks for BTS 1
  { id: 'f1', name: 'Alice Dupont', photoUrl: 'https://picsum.photos/200/300?random=1', className: ClassName.BTS1, type: GroupType.FILLEUL, isMatched: false },
  { id: 'f2', name: 'Jean Kofi', photoUrl: 'https://picsum.photos/200/300?random=2', className: ClassName.BTS1, type: GroupType.FILLEUL, isMatched: false },
  { id: 'f3', name: 'Sarah Koné', photoUrl: 'https://picsum.photos/200/300?random=3', className: ClassName.BTS1, type: GroupType.FILLEUL, isMatched: false },
  
  // Mocks for BTS 2
  { id: 'p1', name: 'Marc Yao', photoUrl: 'https://picsum.photos/200/300?random=4', className: ClassName.BTS2, type: GroupType.PARRAIN, isMatched: false },
  { id: 'p2', name: 'Julie Kouadio', photoUrl: 'https://picsum.photos/200/300?random=5', className: ClassName.BTS2, type: GroupType.PARRAIN, isMatched: false },
  { id: 'p3', name: 'Paul Digbeu', photoUrl: 'https://picsum.photos/200/300?random=6', className: ClassName.BTS2, type: GroupType.PARRAIN, isMatched: false },

  // Mocks for LP 1 AGITEL
  { id: 'f4', name: 'Awa Touré', photoUrl: 'https://picsum.photos/200/300?random=7', className: ClassName.LP1_AGITEL, type: GroupType.FILLEUL, isMatched: false },
  { id: 'f5', name: 'Moussa Diop', photoUrl: 'https://picsum.photos/200/300?random=8', className: ClassName.LP1_AGITEL, type: GroupType.FILLEUL, isMatched: false },

  // Mocks for LP 2 AGITEL
  { id: 'p4', name: 'Fatou Sylla', photoUrl: 'https://picsum.photos/200/300?random=9', className: ClassName.LP2_AGITEL, type: GroupType.PARRAIN, isMatched: false },
  { id: 'p5', name: 'Oumar Cissé', photoUrl: 'https://picsum.photos/200/300?random=10', className: ClassName.LP2_AGITEL, type: GroupType.PARRAIN, isMatched: false },

  // Mocks for LP 1 UPAF
  { id: 'f6', name: 'Grace N’Guessan', photoUrl: 'https://picsum.photos/200/300?random=11', className: ClassName.LP1_UPAF, type: GroupType.FILLEUL, isMatched: false },

  // Mocks for LP 2 UPAF
  { id: 'p6', name: 'Hervé Banny', photoUrl: 'https://picsum.photos/200/300?random=12', className: ClassName.LP2_UPAF, type: GroupType.PARRAIN, isMatched: false },
];