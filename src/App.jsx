import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import RequireAuth from './components/RequireAuth';
import Upload from './pages/Upload';
import PostsList from './pages/PostsList';
import SignInPage from './pages/SignInPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<RequireAuth><PostsList /></RequireAuth>} />
              <Route path="/posts" element={<RequireAuth><PostsList /></RequireAuth>} />
              <Route path="/upload" element={<RequireAuth><Upload /></RequireAuth>} />
              <Route path="/login" element={<SignInPage />} />
              <Route path="/reset" element={<SignInPage />} />
              <Route path="/signup" element={<Navigate to="/login" replace />} />
              <Route path="/forgot" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
