import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Download, Upload } from 'lucide-react';
import { format } from 'date-fns';

import Dashboard from './components/Dashboard';
import QuestionForm from './components/QuestionForm';
import QuestionTable from './components/QuestionTable';
import MistakeModal from './components/MistakeModal';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProtectedRoute = ({ children, authData }) => {
  if (!authData.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [questions, setQuestions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMistakeQuestion, setViewMistakeQuestion] = useState(null);
  const [authData, setAuthData] = useState({ token: null, user: null });
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get(`${API_URL}/auth/me`);
          setAuthData({ token, user: res.data });
        } catch (err) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (authData.token) {
      fetchQuestions();
    } else {
      setQuestions([]);
    }
  }, [authData.token]);

  useEffect(() => {
    // Check local storage for dark mode preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API_URL}/questions`);
      setQuestions(res.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleAddQuestion = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/questions`, data);
      setQuestions([...questions, res.data]);
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };

  const handleUpdateQuestion = async (data, id) => {
    try {
      await axios.put(`${API_URL}/questions/${id}`, data);
      setQuestions(questions.map(q => q._id === id ? { ...data, _id: id } : q));
    } catch (err) {
      console.error('Error updating question:', err);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.delete(`${API_URL}/questions/${id}`);
        setQuestions(questions.filter(q => q._id !== id));
      } catch (err) {
        console.error('Error deleting question:', err);
      }
    }
  };

  const handleMarkRevised = async (question) => {
    const updated = { ...question, lastRevised: format(new Date(), 'yyyy-MM-dd') };
    try {
      await axios.put(`${API_URL}/questions/${question._id}`, updated);
      setQuestions(questions.map(q => q._id === question._id ? updated : q));
    } catch (err) {
      console.error('Error updating revision date:', err);
    }
  };

  const handleExport = () => {
    const dataToExport = questions.map(q => {
      const { _id, createdAt, updatedAt, __v, ...rest } = q;
      return rest;
    });
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dsa-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        await axios.post(`${API_URL}/questions/bulk`, importedData);
        fetchQuestions();
        alert('Data imported successfully!');
      } catch (err) {
        console.error('Error importing data:', err);
        alert('Failed to import data. Please ensure it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
    // Reset file input so the same file can be selected again
    e.target.value = null;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setAuthData({ token: null, user: null });
  };

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar user={authData.user} logout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        <Routes>
          <Route path="/login" element={<Login setAuthData={setAuthData} />} />
          <Route path="/register" element={<Register setAuthData={setAuthData} />} />
          <Route path="/" element={
            <ProtectedRoute authData={authData}>
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Dashboard questions={questions} darkMode={darkMode} />
              </main>
            </ProtectedRoute>
          } />
          
          <Route path="/questions" element={
            <ProtectedRoute authData={authData}>
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Questions</h2>
                  <div className="flex items-center gap-3">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImport} 
                      accept=".json" 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                      <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Import</span>
                    </button>
                    <button 
                      onClick={handleExport}
                      className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
                    </button>
                    <Link to="/add" className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm ml-2">
                      + Add Question
                    </Link>
                  </div>
                </div>
                
                <QuestionTable 
                  questions={questions} 
                  onDelete={handleDeleteQuestion}
                  onMarkRevised={handleMarkRevised}
                  onViewMistakes={setViewMistakeQuestion}
                />
              </main>
            </ProtectedRoute>
          } />

          <Route path="/add" element={
            <ProtectedRoute authData={authData}>
              <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <QuestionForm 
                  onSubmit={handleAddQuestion} 
                />
              </main>
            </ProtectedRoute>
          } />

          <Route path="/edit" element={
            <ProtectedRoute authData={authData}>
              <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <QuestionForm 
                  onSubmit={handleUpdateQuestion} 
                />
              </main>
            </ProtectedRoute>
          } />
        </Routes>

        <MistakeModal 
          question={viewMistakeQuestion} 
          onClose={() => setViewMistakeQuestion(null)} 
        />
      </div>
    </Router>
  );
};

export default App;
