export interface SubjectIcon {
  id: string;
  emoji: string;
  label: string;
}

export const subjectIcons: SubjectIcon[] = [
  { id: 'book', emoji: '📚', label: 'كتب' },
  { id: 'mosque', emoji: '🕌', label: 'مسجد' },
  { id: 'numbers', emoji: '🔢', label: 'أرقام' },
  { id: 'abc', emoji: '🔤', label: 'حروف' },
  { id: 'microscope', emoji: '🔬', label: 'مجهر' },
  { id: 'building', emoji: '🏛️', label: 'مبنى' },
  { id: 'globe', emoji: '🌍', label: 'كرة أرضية' },
  { id: 'computer', emoji: '💻', label: 'حاسوب' },
  { id: 'art', emoji: '🎨', label: 'فنون' },
  { id: 'music', emoji: '🎵', label: 'موسيقى' },
  { id: 'sports', emoji: '⚽', label: 'رياضة' },
  { id: 'pencil', emoji: '✏️', label: 'قلم' },
  { id: 'calculator', emoji: '🧮', label: 'آلة حاسبة' },
  { id: 'atom', emoji: '⚛️', label: 'ذرة' },
  { id: 'dna', emoji: '🧬', label: 'أحياء' },
  { id: 'earth', emoji: '🌏', label: 'جغرافيا' },
  { id: 'history', emoji: '📜', label: 'تاريخ' },
  { id: 'chemistry', emoji: '🧪', label: 'كيمياء' },
  { id: 'plant', emoji: '🌱', label: 'نبات' },
  { id: 'star', emoji: '⭐', label: 'نجمة' },
  { id: 'lightbulb', emoji: '💡', label: 'فكرة' },
  { id: 'robot', emoji: '🤖', label: 'روبوت' },
  { id: 'palette', emoji: '🖌️', label: 'رسم' },
  { id: 'quran', emoji: '📖', label: 'قرآن' },
];

export const getIconById = (id: string): string => {
  return subjectIcons.find((icon) => icon.id === id)?.emoji || '📚';
};