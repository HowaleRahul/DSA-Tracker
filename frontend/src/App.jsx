import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Moon, Sun, Code2, Download, Upload } from 'lucide-react';
import { format } from 'date-fns';

import Dashboard from './components/Dashboard';
import QuestionForm from './components/QuestionForm';
import QuestionTable from './components/QuestionTable';
import MistakeModal from './components/MistakeModal';

const API_URL = 'http://localhost:5000/api/questions';

function App() {
  const [questions, setQuestions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewMistakeQuestion, setViewMistakeQuestion] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Check local storage for dark mode preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    
    fetchQuestions();
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
      const res = await axios.get(API_URL);
      setQuestions(res.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleAddQuestion = async (data) => {
    try {
      const res = await axios.post(API_URL, data);
      setQuestions([...questions, res.data]);
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };

  const handleUpdateQuestion = async (data) => {
    try {
      await axios.put(`${API_URL}/${editingQuestion._id}`, data);
      setQuestions(questions.map(q => q._id === editingQuestion._id ? { ...data, _id: editingQuestion._id } : q));
      setEditingQuestion(null);
    } catch (err) {
      console.error('Error updating question:', err);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setQuestions(questions.filter(q => q._id !== id));
      } catch (err) {
        console.error('Error deleting question:', err);
      }
    }
  };

  const handleMarkRevised = async (question) => {
    const updatedData = {
      ...question,
      lastRevised: format(new Date(), 'yyyy-MM-dd')
    };
    try {
      await axios.put(`${API_URL}/${question._id}`, updatedData);
      setQuestions(questions.map(q => q._id === question._id ? { ...updatedData, _id: question._id } : q));
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
        await axios.post(`${API_URL}/bulk`, importedData);
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

  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              DSA Revision Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              accept=".json" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              title="Import Data"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button 
              onClick={handleExport}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              title="Export Data"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard questions={questions} darkMode={darkMode} />
        
        <QuestionForm 
          onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion} 
          initialData={editingQuestion}
          onCancel={editingQuestion ? () => setEditingQuestion(null) : null}
        />

        <QuestionTable 
          questions={questions}
          onEdit={setEditingQuestion}
          onDelete={handleDeleteQuestion}
          onMarkRevised={handleMarkRevised}
          onViewMistakes={setViewMistakeQuestion}
        />
      </main>

      <MistakeModal 
        question={viewMistakeQuestion} 
        onClose={() => setViewMistakeQuestion(null)} 
      />
    </div>
  );
}

export default App;
