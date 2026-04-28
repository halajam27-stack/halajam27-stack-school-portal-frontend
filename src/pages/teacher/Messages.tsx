import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageBubble } from '@/components/MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SubjectItem {
  sectionId: number;
  subjectId: number;
  subject: string;
  className: string;
  section: string;
}

interface StudentItem {
  id: string;
  name: string;
}

interface MessageItem {
  id: number;
  sender: 'teacher' | 'student';
  text: string;
  time: string;
  sentAt: string;
}

type MobileStep = 'subjects' | 'students' | 'chat';

export default function TeacherMessages() {
  const { toast } = useToast();
  const { employee } = useAuth();

  const semesterId = localStorage.getItem('adminSelectedSemester');
  const teacherId = employee?.naturalId || '';

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const [subjectUnreadMap, setSubjectUnreadMap] = useState<Record<string, number>>({});
  const [studentUnreadMap, setStudentUnreadMap] = useState<Record<string, number>>({});

  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [mobileStep, setMobileStep] = useState<MobileStep>('subjects');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedSubjectData =
    selectedSubjectIndex !== null ? subjects[selectedSubjectIndex] : null;

  const selectedStudentData =
    selectedStudentId ? students.find((s) => s.id === selectedStudentId) : null;

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
      if (!teacherId || !semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/teacher/messages/subjects/${teacherId}/${semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل مواد المعلم',
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
  }, [teacherId, semesterId, toast]);

  useEffect(() => {
    const fetchUnreadSubjects = async () => {
      if (!teacherId || !semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/teacher/messages/unread-subjects/${teacherId}/${semesterId}`
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
  }, [teacherId, semesterId]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSubjectData || !semesterId) {
        setStudents([]);
        setSelectedStudentId(null);
        setStudentUnreadMap({});
        return;
      }

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/teacher/messages/students/${selectedSubjectData.sectionId}/${semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل الطلاب',
            variant: 'destructive',
          });
          return;
        }

        const formatted: StudentItem[] = data.map((student: any) => ({
          id: student.NaturalID,
          name: student.FullName,
        }));

        setStudents(formatted);
        setSelectedStudentId(null);
        setMessages([]);

        if (window.innerWidth < 1024) {
          setMobileStep('students');
        }
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive',
        });
      }
    };

    fetchStudents();
  }, [selectedSubjectData, semesterId, toast]);

  useEffect(() => {
    const fetchUnreadStudents = async () => {
      if (!selectedSubjectData || !teacherId || !semesterId) {
        setStudentUnreadMap({});
        return;
      }

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/teacher/messages/unread-students?sectionId=${selectedSubjectData.sectionId}&subjectId=${selectedSubjectData.subjectId}&semesterId=${semesterId}&teacherId=${teacherId}`
        );
        const data = await res.json();

        if (!res.ok) {
          setStudentUnreadMap({});
          return;
        }

        const unreadMap: Record<string, number> = {};
        data.forEach((item: any) => {
          unreadMap[item.NaturalID] = Number(item.UnreadCount) || 0;
        });

        setStudentUnreadMap(unreadMap);
      } catch {
        setStudentUnreadMap({});
      }
    };

    fetchUnreadStudents();
  }, [selectedSubjectData, teacherId, semesterId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedSubjectData || !selectedStudentId || !semesterId || !teacherId) {
        setMessages([]);
        return;
      }

      const currentStudentUnread =
        selectedStudentId ? studentUnreadMap[selectedStudentId] || 0 : 0;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/teacher/messages/chat?sectionId=${selectedSubjectData.sectionId}&subjectId=${selectedSubjectData.subjectId}&semesterId=${semesterId}&teacherId=${teacherId}&studentId=${selectedStudentId}`
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
          sender: message.SenderID === teacherId ? 'teacher' : 'student',
          text: message.Body,
          time: new Date(message.SentAt).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          sentAt: message.SentAt,
        }));

        setMessages(formatted);

        if (selectedSubjectData && selectedStudentId && currentStudentUnread > 0) {
          setStudentUnreadMap((prev) => ({
            ...prev,
            [selectedStudentId]: 0,
          }));

          setSubjectUnreadMap((prev) => {
            const key = `${selectedSubjectData.sectionId}-${selectedSubjectData.subjectId}`;
            return {
              ...prev,
              [key]: Math.max(0, (prev[key] || 0) - currentStudentUnread),
            };
          });
        }

        if (window.innerWidth < 1024) {
          setMobileStep('chat');
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
  }, [selectedSubjectData, selectedStudentId, semesterId, teacherId, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!selectedSubjectData || !selectedStudentId || !semesterId || !teacherId) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار الصف والطالب أولاً',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('https://school-portal-backend-new.onrender.com/teacher/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSubjectData.sectionId,
          subjectId: selectedSubjectData.subjectId,
          semesterId: Number(semesterId),
          senderId: teacherId,
          receiverId: selectedStudentId,
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
        sender: 'teacher',
        text: newMessage.trim(),
        time: now.toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sentAt: now.toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
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
        senderId: teacherId,
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
      prev.map((msg) =>
        msg.id === id ? { ...msg, text: newText } : msg
      )
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
        senderId: teacherId,
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
    setSelectedStudentId(null);

    if (window.innerWidth < 1024) {
      setMobileStep('students');
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);

    if (window.innerWidth < 1024) {
      setMobileStep('chat');
    }
  };

  const handleMobileBack = () => {
    if (mobileStep === 'chat') {
      setSelectedStudentId(null);
      setMobileStep('students');
    } else if (mobileStep === 'students') {
      setSelectedSubjectIndex(null);
      setSelectedStudentId(null);
      setStudents([]);
      setMessages([]);
      setMobileStep('subjects');
    }
  };

  const renderSubjectsList = () => (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">الصفوف</CardTitle>
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
                  <div className="flex items-center gap-3">
                    <div className="w-6 flex justify-center shrink-0">
                      {unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-red-700 text-white text-xs flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 text-right">
                      <span className="font-semibold text-foreground block">
                        {subject.subject}
                      </span>

                      <p className="text-sm text-muted-foreground">
                        {subject.className} - شعبة {subject.section}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {subjects.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                لا توجد مواد مرتبطة بهذا المعلم
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderStudentsList = () => (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">الطلاب</CardTitle>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={handleMobileBack}>
            <ArrowRight size={16} className="ml-1" />
            رجوع
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-2 flex-1 overflow-hidden">
        {selectedSubjectData ? (
          <ScrollArea className="h-full">
            <div className="space-y-1">
              {students.map((student) => {
                const unreadCount = studentUnreadMap[student.id] || 0;

                return (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student.id)}
                    className={`w-full p-3 rounded-xl text-right transition-colors ${
                      selectedStudentId === student.id
                        ? 'bg-baby-blue'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 flex justify-center shrink-0">
                        {unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-red-700 text-white text-xs flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      <span
                        className={`flex-1 font-medium ${
                          unreadCount > 0 && selectedStudentId !== student.id
                            ? 'text-red-600 font-semibold'
                            : ''
                        }`}
                      >
                        {student.name}
                      </span>

                      <div className="w-8 h-8 rounded-full bg-peach flex items-center justify-center shrink-0">
                        <User size={16} className="text-foreground" />
                      </div>
                    </div>
                  </button>
                );
              })}

              {students.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  لا يوجد طلاب في هذه الشعبة
                </p>
              )}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground py-8">اختر صفاً لعرض الطلاب</p>
        )}
      </CardContent>
    </Card>
  );

  const renderChatPanel = () => (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="pb-3 border-b">
        {selectedStudentData ? (
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
              <CardTitle className="text-base truncate">{selectedStudentData.name}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">
                {selectedSubjectData?.subject} - {selectedSubjectData?.className}
              </p>
            </div>
          </div>
        ) : (
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle size={20} />
            المحادثة
          </CardTitle>
        )}
      </CardHeader>

      {selectedStudentData ? (
        <>
          <div className="flex-1 min-h-0 overflow-hidden">
<ScrollArea className="h-full">
  <div className="space-y-4 p-4 relative">
    {messages.length === 0 ? (
      <div className="text-center text-muted-foreground py-8">
        لا توجد رسائل بعد
      </div>
    ) : (
      messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const currentDay = new Date(message.sentAt).toDateString();
        const previousDay = previousMessage
          ? new Date(previousMessage.sentAt).toDateString()
          : null;
        const showDaySeparator = currentDay !== previousDay;

        return (
          <div key={message.id}>
            {showDaySeparator && (
              <div className="sticky top-4 z-10 flex justify-center py-2 pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-muted/95 text-xs text-muted-foreground shadow-sm border">
                  {formatDayLabel(message.sentAt)}
                </span>
              </div>
            )}

            <MessageBubble
              id={message.id}
              text={message.text}
              time={message.time}
              isOwn={message.sender === 'teacher'}
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

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="اكتب رسالتك..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send size={18} />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
          اختر طالباً لبدء المحادثة
        </CardContent>
      )}
    </Card>
  );

  return (
    <DashboardLayout
      title="الرسائل"
      subtitle="التواصل مع الطلاب"
      showBackButton
    >
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
        <div className="lg:col-span-3 min-h-0 overflow-hidden">
          {renderSubjectsList()}
        </div>

        <div className="lg:col-span-3 min-h-0 overflow-hidden">
          {renderStudentsList()}
        </div>

        <div className="lg:col-span-6 min-h-0 overflow-hidden">
          {renderChatPanel()}
        </div>
      </div>

      <div className="lg:hidden h-[calc(100vh-250px)] min-h-[400px]">
        {mobileStep === 'subjects' && renderSubjectsList()}
        {mobileStep === 'students' && renderStudentsList()}
        {mobileStep === 'chat' && renderChatPanel()}
      </div>
    </DashboardLayout>
  );
}