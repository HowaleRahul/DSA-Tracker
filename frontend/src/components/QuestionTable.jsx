import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, CheckCircle2, AlertCircle, Search, Filter, ExternalLink } from 'lucide-react';
import { calculateNextRevision, needsRevision } from '../utils/dateUtils';

const QuestionTable = ({ questions, onEdit, onDelete, onMarkRevised, onViewMistakes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfidence, setFilterConfidence] = useState('All');
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  const getConfidenceColor = (confidence) => {
    if (confidence <= 2) return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    if (confidence === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesConfidence = filterConfidence === 'All' || q.confidence.toString() === filterConfidence;
      const matchesPlatform = filterPlatform === 'All' || q.platform === filterPlatform;
      const matchesDifficulty = filterDifficulty === 'All' || q.difficulty === filterDifficulty;
      return matchesSearch && matchesConfidence && matchesPlatform && matchesDifficulty;
    }).sort((a, b) => {
      const nextRevA = calculateNextRevision(a.lastRevised, a.confidence);
      const nextRevB = calculateNextRevision(b.lastRevised, b.confidence);
      return nextRevA - nextRevB; // Sort by closest revision date
    });
  }, [questions, searchTerm, filterConfidence, filterPlatform, filterDifficulty]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-8">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search questions or tags..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={filterConfidence} onChange={(e) => setFilterConfidence(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm py-2 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white">
                <option value="All">All Confidences</option>
                {[1,2,3,4,5].map(c => <option key={c} value={c}>Level {c}</option>)}
              </select>
            </div>
            <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm py-2 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white">
              <option value="All">All Platforms</option>
              <option value="LeetCode">LeetCode</option>
              <option value="GFG">GFG</option>
              <option value="Codeforces">Codeforces</option>
              <option value="Other">Other</option>
            </select>
            <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm py-2 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white">
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-6 py-4 rounded-tl-lg">Question</th>
              <th className="px-6 py-4">Tags</th>
              <th className="px-6 py-4 text-center">Confidence</th>
              <th className="px-6 py-4">Revision Dates</th>
              <th className="px-6 py-4 text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No questions found matching your criteria.
                </td>
              </tr>
            ) : filteredQuestions.map((q) => {
              const nextRev = calculateNextRevision(q.lastRevised, q.confidence);
              const isRevisionDue = needsRevision(nextRev);

              return (
                <tr key={q._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {q.url ? (
                        <a href={q.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center gap-1 group">
                          {q.name}
                          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-indigo-500" />
                        </a>
                      ) : (
                        q.name
                      )}
                      {q.mistakes && (
                        <button onClick={() => onViewMistakes(q)} className="text-red-500 hover:text-red-700" title="View Mistakes">
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span>{q.platform}</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className={`${
                        q.difficulty === 'Easy' ? 'text-green-600 dark:text-green-400' : 
                        q.difficulty === 'Hard' ? 'text-red-600 dark:text-red-400' : 
                        'text-yellow-600 dark:text-yellow-400'
                      } font-medium`}>
                        {q.difficulty || 'Medium'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {q.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getConfidenceColor(q.confidence)}`}>
                      Lvl {q.confidence}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <span className="text-gray-400">Last:</span> {format(new Date(q.lastRevised), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs mt-1 flex items-center gap-2">
                      <span className="text-gray-400">Next:</span> 
                      <span className={isRevisionDue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-900 dark:text-white'}>
                        {format(nextRev, 'MMM dd, yyyy')}
                      </span>
                      {isRevisionDue && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold animate-pulse">
                          Revise Now
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      <button onClick={() => onMarkRevised(q)} title="Mark as Revised Today" className="text-green-600 hover:text-green-800 dark:hover:text-green-400 transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => onEdit(q)} title="Edit" className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(q._id)} title="Delete" className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionTable;
