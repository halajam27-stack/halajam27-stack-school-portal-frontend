import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Admin, User, Employee, Student, UserType } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  employee: Employee | null;
  student: Student | null;
  isAuthenticated: boolean;
  userType: UserType | null;
  login: (naturalId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  const userType: UserType | null = admin ? 'admin' : user?.type || null;

  const login = async (
    naturalId: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const adminRes = await fetch("https://school-portal-backend-new.onrender.com/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naturalId, password })
      });

      const adminData = await adminRes.json();

      if (adminRes.ok && adminData.success && adminData.admin) {
        setAdmin(adminData.admin);
        setUser(null);
        setEmployee(null);
        setStudent(null);

        localStorage.removeItem("adminSelectedSemester");
        return { success: true };
      }

      const userRes = await fetch("https://school-portal-backend-new.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naturalId, password })
      });

      const userData = await userRes.json();

      if (!userRes.ok || !userData.success || !userData.user) {
        return {
          success: false,
          error: userData.error || "اسم المستخدم أو كلمة المرور غير صحيحة"
        };
      }

      setUser(userData.user);
      setAdmin(null);

      if (userData.user.type === 'teacher') {
        setEmployee(userData.employee || null);
        setStudent(null);
      } else if (userData.user.type === 'student') {
        setStudent(userData.student || null);
        setEmployee(null);
      } else {
        setEmployee(null);
        setStudent(null);
      }

      // مهم جداً: نخزن السمستر الحالي
      localStorage.setItem("adminSelectedSemester", String(userData.user.semesterId));

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "خطأ في السيرفر" };
    }
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    setEmployee(null);
    setStudent(null);
    localStorage.removeItem("adminSelectedSemester");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        employee,
        student,
        isAuthenticated: !!user || !!admin,
        userType,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}