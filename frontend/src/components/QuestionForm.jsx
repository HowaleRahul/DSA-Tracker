import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';

const PLATFORMS = ['LeetCode', 'GFG', 'Codeforces', 'Other'];
const COMMON_TAGS = ['Array', 'String', 'Hash Table', 'Math', 'DP', 'Sorting', 'Greedy', 'DFS', 'Database', 'BFS', 'Tree', 'Binary Search', 'Matrix', 'Two Pointers', 'Bit Manipulation', 'Stack', 'Graph', 'Sliding Window'];

const QuestionForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.question || null;
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    platform: 'LeetCode',
    difficulty: 'Medium',
    tags: '',
    approach: '',
    timeComplexity: '',
    confidence: 3,
    lastRevised: format(new Date(), 'yyyy-MM-dd'),
    mistakes: ''
  });
  
  const [platformData, setPlatformData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('/leetcodeData.json').then(res => res.json()),
      fetch('/codeforcesData.json').then(res => res.json())
    ])
    .then(([leetcode, codeforces]) => {
      const lc = leetcode.map(p => ({ ...p, platform: 'LeetCode' }));
      setPlatformData([...lc, ...codeforces]);
    })
    .catch(err => console.error("Error loading platform data:", err));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''),
        lastRevised: initialData.lastRevised ? format(new Date(initialData.lastRevised), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      });
    }
  }, [initialData]);

  const updateSuggestions = (nameVal, platformVal) => {
    if (platformVal !== 'LeetCode' && platformVal !== 'Codeforces') {
      setShowSuggestions(false);
      return;
    }
    const matches = platformData
      .filter(p => p.platform === platformVal && p.name.toLowerCase().includes(nameVal.toLowerCase()))
      .slice(0, 5);
    setSuggestions(matches);
    setShowSuggestions(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'name' && value.length > 1) {
      updateSuggestions(value, formData.platform);
    } else if (name === 'platform' && formData.name.length > 1) {
      updateSuggestions(formData.name, value);
    } else if (name === 'name') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      name: suggestion.name,
      url: suggestion.url,
      difficulty: suggestion.difficulty,
      tags: suggestion.tags ? suggestion.tags.join(', ') : ''
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(t => t !== '') : formData.tags,
      confidence: Number(formData.confidence)
    };
    
    if (initialData) {
      onSubmit(payload, initialData._id);
    } else {
      onSubmit(payload);
    }
    
    navigate('/questions');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        {initialData ? 'Edit Question' : 'Add New Question'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
            <select name="platform" value={formData.platform} onChange={handleChange} 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 border">
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          
          <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} 
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              autoComplete="off"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 border" />
            
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                {suggestions.map((s, idx) => (
                  <li key={idx} onClick={() => handleSuggestionClick(s)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-800 dark:text-gray-200">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
                      <span className={s.difficulty === 'Easy' ? 'text-green-500' : s.difficulty === 'Hard' ? 'text-red-500' : 'text-yellow-500'}>{s.difficulty}</span>
                      {s.tags && s.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate">{s.tags.slice(0,3).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Problem URL</label>
            <input type="url" name="url" placeholder="https://leetcode.com/problems/..." value={formData.url || ''} onChange={handleChange} 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 border" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
            <select name="difficulty" value={formData.difficulty} onChange={handleChange} 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 border">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic Tags (comma separated)</label>
          <input type="text" name="tags" placeholder="e.g. DP, Graph, Sliding Window" value={formData.tags} onChange={handleChange} 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 border" />
          <div className="mt-1 flex flex-wrap gap-1">
            {COMMON_TAGS.slice(0,8).map(tag => (
              <span key={tag} onClick={() => setFormData(prev => ({...prev, tags: prev.tags ? `${prev.tags}, ${tag}` : tag}))}
                className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded cursor-pointer transition-colors">
                +{tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Approach <span className="text-xs text-gray-400 font-normal">(Markdown supported)</span>
          </label>
          <textarea name="approach" rows="2" value={formData.approach} onChange={handleChange} 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 border"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Complexity</label>
            <input type="text" name="timeComplexity" placeholder="O(N)" value={formData.timeComplexity} onChange={handleChange} 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confidence (1-5)</label>
            <select name="confidence" value={formData.confidence} onChange={handleChange} 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 border">
              {[1, 2, 3, 4, 5].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Revised</label>
            <input type="date" name="lastRevised" required value={formData.lastRevised} onChange={handleChange} 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 border" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mistake Notes <span className="text-xs text-gray-400 font-normal">(Markdown supported)</span>
          </label>
          <textarea name="mistakes" rows="2" placeholder="What went wrong during the attempt?" value={formData.mistakes} onChange={handleChange} 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2 border"></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={() => navigate('/questions')} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            {initialData ? 'Update Question' : 'Save Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
