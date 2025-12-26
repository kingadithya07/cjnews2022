
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import EPaper from './pages/EPaper.tsx';
import ArticleDetails from './pages/ArticleDetails.tsx';
import Dashboard from './pages/Admin/Dashboard.tsx';
import Login from './pages/auth/Login.tsx';
import Register from './pages/auth/Register.tsx';
import ForgotPassword from './pages/auth/ForgotPassword.tsx';
import ProfilePage from './pages/Profile.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/epaper" element={<EPaper />} />
          <Route path="/article/:id" element={<ArticleDetails />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/category/:name" element={<Home />} />
          <Route path="/contact" element={<div className="p-20 text-center"><h1 className="text-3xl font-black mb-4">Contact Us</h1><p>Email: contact@cjnewshub.com</p></div>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
