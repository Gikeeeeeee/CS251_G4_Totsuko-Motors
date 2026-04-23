import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';
import GuestPage from './pages/GuestPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/clerk"
          element={
            <ProtectedRoute allowedRoles={['clerk']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRoles={['technician']}>
              <UserPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <GuestPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;