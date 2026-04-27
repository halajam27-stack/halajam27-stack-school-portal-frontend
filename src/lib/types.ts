// User types
export type UserType = 'admin' | 'teacher' | 'student';

// Admin table (separate from Users)
export interface Admin {
  naturalId: string;
  password: string;
}

export interface User {
  naturalId: string;
  semesterId: number;
  password: string;
  type: 'teacher' | 'student';
  createdAt: Date;
}

export interface Employee {
  naturalId: string;
  semesterId: number;
  fullName: string;
  jobTitle?: string;
  hireDate?: Date | string;
  photo?: string;
  phone?: string;
  semesterName?: string;
}

export interface Student {
  naturalId: string;
  semesterId: number;
  fullName: string;
  birthDate?: Date | string;
  address?: string;
  guardianPhone?: string;
  enrollmentDate?: Date | string;
  semesterName?: string;
}

export interface Semester {
  semesterId: number;
  semesterName: string;
}

export interface Class {
  classId: number;
  className: string;
  semesterId: number;
}

export interface Section {
  sectionId: number;
  sectionName: string;
  classId: number;
  semesterId: number;
}

export interface Subject {
  subjectId: number;
  subjectName: string;
  bookPath?: string;
  classId: number;
  semesterId: number;
}

export interface Period {
  periodId: number;
  sectionId: number;
  subjectId: number;
  semesterId: number;
  dayOfWeek: string;
  periodNumber: number;
}

export interface Attendance {
  attendanceId: number;
  sectionId: number;
  subjectId: number;
  semesterId: number;
  naturalId: string;
  periodId: number;
  attendanceDate: Date;
  status: boolean;
}

export interface Task {
  taskId: number;
  sectionId: number;
  subjectId: number;
  semesterId: number;
  taskInfo: string;
  taskDate: Date;
  createdAt: Date;
}

export interface Message {
  messageId: number;
  sectionId: number;
  subjectId: number;
  semesterId: number;
  naturalId: string;
  body: string;
  sentAt: Date;
}

export interface GradeType {
  gradeTypeId: number;
  gradeTypeName: string;
}

export interface GradeScheme {
  schemeId: number;
  semesterId: number;
  gradeTypeId: number;
  maxGrade: number;
}

export interface Grade {
  gradeId: number;
  sectionId: number;
  subjectId: number;
  semesterId: number;
  naturalId: string;
  schemeId: number;
  gradeValue?: number;
  gradeDate: Date;
}

// Auth context
export interface AuthState {
  user: User | null;
  employee?: Employee;
  student?: Student;
  isAuthenticated: boolean;
  isLoading: boolean;
}