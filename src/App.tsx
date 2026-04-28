import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Student Pages
import StudentSubjects from "./pages/student/Subjects";
import StudentSchedule from "./pages/student/Schedule";
import StudentTasks from "./pages/student/Tasks";
import StudentGrades from "./pages/student/Grades";
import StudentMessages from "./pages/student/Messages";
import StudentAttendance from "./pages/student/Attendance";

// Teacher Pages
import TeacherSubjects from "./pages/teacher/Subjects";
import TeacherClassManagement from "./pages/teacher/ClassManagement";
import TeacherAttendanceEntry from "./pages/teacher/AttendanceEntry";
import TeacherStudents from "./pages/teacher/Students";
import TeacherTasks from "./pages/teacher/Tasks";
import TeacherGrades from "./pages/teacher/Grades";
import TeacherBookUpload from "./pages/teacher/BookUpload";
import TeacherMessages from "./pages/teacher/Messages";

// Admin Pages
import AdminClasses from "./pages/admin/Classes";
import AdminSections from "./pages/admin/Sections";
import AdminSubjects from "./pages/admin/Subjects";
import AdminPeriods from "./pages/admin/Periods";
import AdminGradeScheme from "./pages/admin/GradeScheme";
import AdminTeachers from "./pages/admin/Teachers";
import AdminStudents from "./pages/admin/Students";
import AdminRelations from "./pages/admin/Relations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Student Routes */}
            <Route path="/student/subjects" element={
              <ProtectedRoute allowedTypes={['student']}>
                <StudentSubjects />
              </ProtectedRoute>
            } />
            <Route path="/student/schedule" element={
              <ProtectedRoute allowedTypes={['student']}>
                <StudentSchedule />
              </ProtectedRoute>
            } />
            <Route path="/student/tasks" element={
              <ProtectedRoute allowedTypes={['student']}>
                <StudentTasks />
              </ProtectedRoute>
            } />
            <Route path="/student/grades" element={
              <ProtectedRoute allowedTypes={['student']}>
                <StudentGrades />
              </ProtectedRoute>
            } />
            <Route path="/student/messages" element={
              <ProtectedRoute allowedTypes={['student']}>
                <StudentMessages />
              </ProtectedRoute>
            } />
            <Route path="/student/attendance" element={
              <ProtectedRoute allowedTypes={['student']}>
                <StudentAttendance />
              </ProtectedRoute>
            } />
            
            {/* Teacher Routes */}
            <Route path="/teacher/subjects" element={
              <ProtectedRoute allowedTypes={['teacher']}>
                <TeacherSubjects />
              </ProtectedRoute>
            } />
           <Route path="/teacher/class/:sectionId/:subjectId" element={
  <ProtectedRoute allowedTypes={['teacher']}>
    <TeacherClassManagement />
  </ProtectedRoute>
} />
<Route path="/teacher/class/:sectionId/:subjectId/students" element={
  <ProtectedRoute allowedTypes={['teacher']}>
    <TeacherStudents />
  </ProtectedRoute>
} />
<Route path="/teacher/class/:sectionId/:subjectId/attendance" element={
  <ProtectedRoute allowedTypes={['teacher']}>
    <TeacherAttendanceEntry />
  </ProtectedRoute>
} />
<Route path="/teacher/class/:sectionId/:subjectId/tasks" element={
  <ProtectedRoute allowedTypes={['teacher']}>
    <TeacherTasks />
  </ProtectedRoute>
} />
<Route path="/teacher/class/:sectionId/:subjectId/grades" element={
  <ProtectedRoute allowedTypes={['teacher']}>
    <TeacherGrades />
  </ProtectedRoute>
} />
<Route path="/teacher/class/:sectionId/:subjectId/book" element={
  <ProtectedRoute allowedTypes={['teacher']}>
    <TeacherBookUpload />
  </ProtectedRoute>
} />
            <Route path="/teacher/messages" element={
              <ProtectedRoute allowedTypes={['teacher']}>
                <TeacherMessages />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/classes" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminClasses />
              </ProtectedRoute>
            } />
            <Route path="/admin/sections" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminSections />
              </ProtectedRoute>
            } />
            <Route path="/admin/subjects" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminSubjects />
              </ProtectedRoute>
            } />
            <Route path="/admin/periods" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminPeriods />
              </ProtectedRoute>
            } />
            <Route path="/admin/gradeScheme" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminGradeScheme />
              </ProtectedRoute>
            } />
            <Route path="/admin/teachers" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminTeachers />
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminStudents />
              </ProtectedRoute>
            } />
            <Route path="/admin/relations" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminRelations />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
