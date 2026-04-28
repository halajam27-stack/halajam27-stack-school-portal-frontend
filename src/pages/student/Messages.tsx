import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from '@/components/MessageBubble';

interface SubjectItem {
  sectionId: number;
  subjectId: number;
  subject: string;
  className: string;
  section: string;
  teacherId: string;
  teacherName: string;
}

interface MessageItem {
  id: number;
  sender: 'teacher' | 'student';
  text: string;
  time: string;
  sentAt: string;
}

type MobileStep = 'subjects' | 'chat';

export default function StudentMessages() {
  const { toast } = useToast();
  const { student } = useAuth();

  const studentId = student?.naturalId || '';
  const semesterId = student?.semesterId || '';

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [mobileStep, setMobileStep] = useState<MobileStep>('subjects');
  const [subjectUnreadMap, setSubjectUnreadMap] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedSubjectData =
    selectedSubjectIndex !== null ? subjects[selectedSubjectIndex] : null;

  const formatDayLabel = (dateString: string) => {
    const msgDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(msgDate, today)) return 'اليوم';
    if (isSameDay(msgDate, yesterday)) return 'أمس';

    return msgDate.toLocaleDateString('ar-SA');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!studentId || !semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/student/messages/subjects/${studentId}/${semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل المواد',
            variant: 'destructive',
          });
          return;
        }

        const formatted: SubjectItem[] = data.map((item: any) => ({
          sectionId: item.SectionID,
          subjectId: item.SubjectID,
          subject: item.SubjectName,
          className: item.ClassName,
          section: item.SectionName,
          teacherId: item.TeacherID,
          teacherName: item.TeacherName,
        }));

        setSubjects(formatted);
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive',
        });
      }
    };

    fetchSubjects();
  }, [studentId, semesterId, toast]);

  useEffect(() => {
    const fetchUnreadSubjects = async () => {
      if (!studentId || !semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/student/messages/unread-subjects/${studentId}/${semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          setSubjectUnreadMap({});
          return;
        }

        const unreadMap: Record<string, number> = {};
        data.forEach((item: any) => {
          unreadMap[`${item.SectionID}-${item.SubjectID}`] = Number(item.UnreadCount) || 0;
        });

        setSubjectUnreadMap(unreadMap);
      } catch {
        setSubjectUnreadMap({});
      }
    };

    fetchUnreadSubjects();
  }, [studentId, semesterId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedSubjectData || !studentId || !semesterId) {
        setMessages([]);
        return;
      }

      const subjectKey = `${selectedSubjectData.sectionId}-${selectedSubjectData.subjectId}`;
      const currentUnread = subjectUnreadMap[subjectKey] || 0;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/student/messages/chat?sectionId=${selectedSubjectData.sectionId}&subjectId=${selectedSubjectData.subjectId}&semesterId=${semesterId}&teacherId=${selectedSubjectData.teacherId}&studentId=${studentId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل المحادثة',
            variant: 'destructive',
          });
          return;
        }

        const formatted: MessageItem[] = data.map((message: any) => ({
          id: message.MessageID,
          sender: message.SenderID === studentId ? 'student' : 'teacher',
          text: message.Body,
          time: new Date(message.SentAt).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          sentAt: message.SentAt,
        }));

        setMessages(formatted);

        if (currentUnread > 0) {
          setSubjectUnreadMap((prev) => ({
            ...prev,
            [subjectKey]: 0,
          }));
        }
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive',
        });
      }
    };

    fetchMessages();
  }, [selectedSubjectData, studentId, semesterId, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!selectedSubjectData || !studentId || !semesterId) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار المادة أولاً',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('https://school-portal-backend-new.onrender.com/student/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSubjectData.sectionId,
          subjectId: selectedSubjectData.subjectId,
          semesterId: Number(semesterId),
          senderId: studentId,
          receiverId: selectedSubjectData.teacherId,
          body: newMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل إرسال الرسالة',
          variant: 'destructive',
        });
        return;
      }

      const now = new Date();

      const newMsg: MessageItem = {
        id: data.messageId || Date.now(),
        sender: 'student',
        text: newMessage.trim(),
        time: now.toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sentAt: now.toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');

      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال الرسالة بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive',
      });
    }
  };

  const handleEditMessage = async (id: number, newText: string) => {
    try {
      const res = await fetch(`https://school-portal-backend-new.onrender.com/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: studentId,
          body: newText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل تعديل الرسالة',
          variant: 'destructive',
        });
        return;
      }

      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, text: newText } : msg))
      );

      toast({
        title: 'تم التعديل',
        description: 'تم تعديل الرسالة بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async (id: number) => {
    try {
      const res = await fetch(`https://school-portal-backend-new.onrender.com/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: studentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل حذف الرسالة',
          variant: 'destructive',
        });
        return;
      }

      setMessages((prev) => prev.filter((msg) => msg.id !== id));

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الرسالة بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive',
      });
    }
  };

  const handleSelectSubject = (index: number) => {
    setSelectedSubjectIndex(index);
    if (window.innerWidth < 1024) {
      setMobileStep('chat');
    }
  };

  const handleMobileBack = () => {
    setSelectedSubjectIndex(null);
    setMobileStep('subjects');
  };

  const renderSubjectsList = () => (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">المواد</CardTitle>
      </CardHeader>

      <CardContent className="p-2 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {subjects.map((subject, index) => {
              const subjectKey = `${subject.sectionId}-${subject.subjectId}`;
              const unreadCount = subjectUnreadMap[subjectKey] || 0;

              return (
                <button
                  key={`${subject.sectionId}-${subject.subjectId}`}
                  onClick={() => handleSelectSubject(index)}
                  className={`w-full p-3 rounded-xl text-right transition-colors ${
                    selectedSubjectIndex === index
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="w-full flex items-center gap-3">
                    <div className="w-6 flex justify-center shrink-0">
                      {unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-red-700 text-white text-xs font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 text-right">
                      <p className="font-medium">{subject.subject}</p>
                      <p
                        className={`text-sm ${
                          selectedSubjectIndex === index
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {subject.teacherName}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {subjects.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                لا توجد مواد لعرضها
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderChatPanel = () => (
    <Card className="flex flex-col overflow-hidden h-full">
      {selectedSubjectData ? (
        <>
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0"
                onClick={handleMobileBack}
              >
                <ArrowRight size={18} />
              </Button>

              <div className="w-10 h-10 rounded-full bg-baby-blue flex items-center justify-center shrink-0">
                <User size={20} className="text-foreground" />
              </div>

              <div className="min-w-0">
                <CardTitle className="text-base truncate">
                  {selectedSubjectData.subject}
                </CardTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedSubjectData.teacherName}
                </p>
              </div>
            </div>
          </CardHeader>

<div className="flex-1 min-h-0 overflow-hidden">
  <ScrollArea className="h-full">
    <div className="space-y-4 p-4 relative">
      {messages.length === 0 ? (
        <div className="py-16 flex items-center justify-center text-muted-foreground">
          لا توجد رسائل بعد
        </div>
      ) : (
        messages.map((msg, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : null;
          const currentDay = new Date(msg.sentAt).toDateString();
          const previousDay = previousMessage
            ? new Date(previousMessage.sentAt).toDateString()
            : null;
          const showDaySeparator = currentDay !== previousDay;

          return (
            <div key={msg.id}>
              {showDaySeparator && (
                <div className="sticky top-4 z-10 flex justify-center py-2 pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-muted/95 text-xs text-muted-foreground shadow-sm border">
                    {formatDayLabel(msg.sentAt)}
                  </span>
                </div>
              )}

              <MessageBubble
                id={msg.id}
                text={msg.text}
                time={msg.time}
                isOwn={msg.sender === 'student'}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  </ScrollArea>
</div>
          <div className="border-t border-border p-4 flex gap-2">
            <Input
              placeholder="اكتب رسالتك..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send size={18} />
            </Button>
          </div>
        </>
      ) : (
        <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>اختر مادة لبدء المحادثة</p>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <DashboardLayout
      title="الرسائل"
      subtitle="التواصل مع المعلمين"
      showBackButton
    >
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
        <div className="col-span-1 min-h-0 overflow-hidden">
          {renderSubjectsList()}
        </div>

        <div className="col-span-2 min-h-0 overflow-hidden">
          {renderChatPanel()}
        </div>
      </div>

      <div className="lg:hidden h-[calc(100vh-250px)] min-h-[400px]">
        {mobileStep === 'subjects' && renderSubjectsList()}
        {mobileStep === 'chat' && renderChatPanel()}
      </div>
    </DashboardLayout>
  );
}