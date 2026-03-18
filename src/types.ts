export type Gender = 'male' | 'female';

export interface FamilyMember {
  id: string;
  name: string;
  gender: Gender;
  parentId?: string;
  birthDate?: string;
  notes?: string;
}
