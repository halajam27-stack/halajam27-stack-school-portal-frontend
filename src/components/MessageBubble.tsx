import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageBubbleProps {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
  onEdit?: (id: number, newText: string) => void;
  onDelete?: (id: number) => void;
}

export function MessageBubble({
  id,
  text,
  time,
  isOwn,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);

  const handleSave = () => {
    const trimmed = editedText.trim();
    if (!trimmed) return;
    onEdit?.(id, trimmed);
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleCancel = () => {
    setEditedText(text);
    setIsEditing(false);
    setShowMenu(false);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`relative max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isOwn
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted rounded-tl-none'
        }`}
      >
        {isOwn && !isEditing && (
          <div className="absolute top-2 left-2">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="opacity-70 hover:opacity-100 transition"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <div className="absolute left-0 mt-2 w-32 rounded-xl border bg-background shadow-lg z-20">
                <button
                  className="w-full px-3 py-2 text-right text-sm hover:bg-muted flex items-center justify-between"
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                >
                  <span>تعديل</span>
                  <Pencil size={14} />
                </button>

                <button
                  className="w-full px-3 py-2 text-right text-sm text-destructive hover:bg-muted flex items-center justify-between"
                  onClick={() => {
                    onDelete?.(id);
                    setShowMenu(false);
                  }}
                >
                  <span>حذف</span>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-2 mt-4">
            <Input
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="bg-background text-foreground"
            />

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Check size={14} className="ml-1" />
                حفظ
              </Button>

              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X size={14} className="ml-1" />
                إلغاء
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium leading-relaxed">{text}</p>
            <p
              className={`text-xs mt-1 font-medium ${
                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}
            >
              {time}
            </p>
          </>
        )}
      </div>
    </div>
  );
}