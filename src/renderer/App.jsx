import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'

import Students from './pages/Students/Students'
import StudentFormPage from './pages/Students/StudentFormPage'
import StudentDetail from './pages/Students/StudentDetail'

import Teachers from './pages/Teachers/Teachers'
import TeacherFormPage from './pages/Teachers/TeacherFormPage'
import TeacherDetail from './pages/Teachers/TeacherDetail'

import Attendance from './pages/Attendance'
import Exams from './pages/Exams'

// ✅ Fees Module Pages
import FeesDashboard from './pages/Fees/Dashboard'
import AssignFee from './pages/Fees/AssignFee'
import FeeHistory from './pages/Fees/History'
import Receipts from './pages/Fees/Receipts'
import Reports from './pages/Fees/Reports'
import Categories from './pages/Fees/Categories'

import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import NotFound from './pages/NotFound'

import Classes from './pages/Classes/Classes' // ✅ Your new renamed main class list page
import ClassFormPage from './pages/Classes/ClassFormPage'
import ClassDetail from './pages/Classes/ClassDetail'

import Subjects from './pages/Subjects/Subjects';
import SubjectFormPage from './pages/Subjects/SubjectFormPage';

//Other Modules
import TransportPage from './pages/Transport/TransportPage'
import IDCardsPage from './pages/IDCards/IDCardsPage'
import CertificatesPage from './pages/Certificates/CertificatesPage'
import TimetablePage from './pages/Timetable/TimetablePage'
import UserRolesPage from './pages/UserRoles/UserRolesPage'

function App() {
  return (
    <Routes>
      <Route path="" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="forgot-password" element={<ForgotPassword />} />

      <Route path="app" element={<Layout />}>
        <Route index element={<Dashboard />} />

        {/* Students */}
        <Route path="students" element={<Students />} />
        <Route path="students/new" element={<StudentFormPage />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="students/:id/edit" element={<StudentFormPage isEdit />} />

        {/* Teachers */}
        <Route path="teachers" element={<Teachers />} />
        <Route path="teachers/new" element={<TeacherFormPage />} />
        <Route path="teachers/:id" element={<TeacherDetail />} />
        <Route path="teachers/:id/edit" element={<TeacherFormPage isEdit />} />

       

        {/* Subjects */}
          <Route path="subjects" element={<Subjects />} />
          <Route path="subjects/new" element={<SubjectFormPage />} />
          <Route path="subjects/:id/edit" element={<SubjectFormPage isEdit />} />

        <Route path="attendance" element={<Attendance />} />
        <Route path="exams" element={<Exams />} />

        {/* ✅ Fees Module */}
        <Route path="fees">
          <Route index element={<FeesDashboard />} />
          <Route path="assign" element={<AssignFee />} />
          <Route path="history" element={<FeeHistory />} />
          <Route path="receipts" element={<Receipts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="categories" element={<Categories />} />
        </Route>

        {/* Classes */}
        <Route path="classes" element={<Classes />} />
         <Route path="classes/new" element={<ClassFormPage />} />
        <Route path="classes/:id" element={<ClassDetail />} />
        <Route path="classes/:id/edit" element={<ClassFormPage isEdit />} />

        {/* Coming Soon */}

        <Route path="/app/transport" element={<TransportPage />} />
        <Route path="/app/id-cards" element={<IDCardsPage />} />
        <Route path="/app/certificates" element={<CertificatesPage />} />
        <Route path="/app/timetable" element={<TimetablePage />} />
        <Route path="/app/user-roles" element={<UserRolesPage />} />

        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
