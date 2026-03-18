/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  UserPlus, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  X,
  Users,
  Heart,
  Printer
} from 'lucide-react';
import { FamilyMember, Gender } from './types';

const INITIAL_DATA: FamilyMember[] = [
  { id: '1', name: 'الجد الأكبر', gender: 'male' },
];

export default function App() {
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined);

  const addMember = (name: string, gender: Gender, parentId?: string) => {
    const newMember: FamilyMember = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      gender,
      parentId,
    };
    setMembers([...members, newMember]);
    setIsModalOpen(false);
  };

  const deleteMember = (id: string) => {
    // Recursive delete: delete member and all descendants
    const getDescendantIds = (parentId: string): string[] => {
      const children = members.filter(m => m.parentId === parentId);
      return [parentId, ...children.flatMap(c => getDescendantIds(c.id))];
    };

    const idsToDelete = getDescendantIds(id);
    setMembers(members.filter(m => !idsToDelete.includes(m.id)));
  };

  const treeData = useMemo(() => {
    const memberMap = new Map<string, FamilyMember & { children: any[] }>();
    members.forEach(m => memberMap.set(m.id, { ...m, children: [] }));
    
    const roots: any[] = [];
    memberMap.forEach(m => {
      if (m.parentId && memberMap.has(m.parentId)) {
        memberMap.get(m.parentId)!.children.push(m);
      } else {
        roots.push(m);
      }
    });
    return roots;
  }, [members]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans" dir="rtl">
      <header className="max-w-6xl mx-auto mb-12 text-center no-print">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1"></div>
          <div className="flex-1 flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-4"
            >
              <Users className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">شجرة العائلة</h1>
            <p className="text-slate-500">قم ببناء وتوثيق تاريخ عائلتك العريق</p>
          </div>
          <div className="flex-1 flex justify-end">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600 font-medium"
            >
              <Printer className="w-5 h-5" />
              طباعة الشجرة
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-10 overflow-x-auto border border-slate-100 print:shadow-none print:border-none">
          <div className="flex justify-center min-w-max">
            {treeData.map(root => (
              <TreeNode 
                key={root.id} 
                member={root} 
                onAddChild={(id) => {
                  setSelectedParentId(id);
                  setIsModalOpen(true);
                }}
                onDelete={deleteMember}
              />
            ))}
          </div>
          
          {members.length === 0 && (
            <div className="text-center py-20 no-print">
              <p className="text-slate-400 mb-4">لا يوجد أفراد في الشجرة حالياً</p>
              <button 
                onClick={() => {
                  setSelectedParentId(undefined);
                  setIsModalOpen(true);
                }}
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                إضافة فرد جديد
              </button>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <AddMemberModal 
            onClose={() => setIsModalOpen(false)}
            onAdd={addMember}
            parentId={selectedParentId}
            parentName={members.find(m => m.id === selectedParentId)?.name}
          />
        )}
      </AnimatePresence>

      <footer className="mt-12 text-center text-slate-400 text-sm no-print">
        تم التطوير بكل ❤️ لتوثيق الروابط العائلية
      </footer>
    </div>
  );
}

interface TreeNodeProps {
  member: any;
  onAddChild: (id: string) => void;
  onDelete: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ member, onAddChild, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = member.children && member.children.length > 0;
  const childrenCount = member.children ? member.children.length : 0;

  return (
    <div className="flex flex-col items-center relative px-4">
      <motion.div 
        layout
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          relative z-10 p-4 rounded-2xl border-2 transition-all duration-300 w-48
          ${member.gender === 'male' 
            ? 'bg-blue-50 border-blue-200 text-blue-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'}
          hover:shadow-lg hover:-translate-y-1 group
        `}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className={`p-2 rounded-xl ${member.gender === 'male' ? 'bg-blue-100' : 'bg-rose-100'}`}>
            <User className={`w-5 h-5 ${member.gender === 'male' ? 'text-blue-600' : 'text-rose-600'}`} />
          </div>
          <span className="font-bold truncate text-lg">{member.name}</span>
        </div>

        {childrenCount > 0 && (
          <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>عدد الأبناء: {childrenCount}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity no-print">
          <button 
            onClick={() => onAddChild(member.id)}
            className="p-1.5 bg-white rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-colors"
            title="إضافة ابن"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => {
              if (confirm(`هل أنت متأكد من حذف ${member.name} وجميع فروعه؟`)) {
                onDelete(member.id);
              }
            }}
            className="p-1.5 bg-white rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {hasChildren && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full p-0.5 shadow-sm hover:bg-slate-50 no-print"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </motion.div>

      {hasChildren && isExpanded && (
        <div className="flex mt-12 relative">
          {/* Vertical line from parent to horizontal line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300 -translate-y-6" />
          
          {/* Horizontal line connecting children */}
          {member.children.length > 1 && (
            <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-slate-300" />
          )}

          {member.children.map((child: any) => (
            <div key={child.id} className="relative pt-6">
              {/* Vertical line from horizontal line to child */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300" />
              <TreeNode 
                key={child.id}
                member={child} 
                onAddChild={onAddChild} 
                onDelete={onDelete} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function AddMemberModal({ onClose, onAdd, parentId, parentName }: { 
  onClose: () => void, 
  onAdd: (name: string, gender: Gender, parentId?: string) => void,
  parentId?: string,
  parentName?: string
}) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), gender, parentId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {parentId ? `إضافة ابن لـ ${parentName}` : 'إضافة فرد جديد'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">الاسم</label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="أدخل الاسم الكامل"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">الجنس</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  gender === 'male' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <User className="w-5 h-5" />
                ذكر
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  gender === 'female' 
                    ? 'bg-rose-50 border-rose-500 text-rose-700' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <User className="w-5 h-5" />
                أنثى
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            إضافة إلى الشجرة
          </button>
        </form>
      </motion.div>
    </div>
  );
}
