
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import EPaper from './pages/EPaper';
import ArticleDetails from './pages/ArticleDetails';
import Dashboard from './pages/Admin/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ProfilePage from './pages/Profile';

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
