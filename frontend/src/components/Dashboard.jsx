import React from 'react';
import { Target, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivityCalendar } from 'react-activity-calendar';
import { format, subDays } from 'date-fns';

const Dashboard = ({ questions, darkMode }) => {
  const total = questions.length;
  const weak = questions.filter(q => q.confidence <= 2).length;
  const strong = questions.filter(q => q.confidence >= 4).length;

  // Calculate most frequent weak topic
  const weakTopics = {};
  questions.filter(q => q.confidence <= 2).forEach(q => {
    q.tags.forEach(tag => {
      weakTopics[tag] = (weakTopics[tag] || 0) + 1;
    });
  });

  let mostFrequentWeakTopic = 'N/A';
  let maxCount = 0;
  for (const [topic, count] of Object.entries(weakTopics)) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentWeakTopic = topic;
    }
  }

  const statCards = [
    { title: 'Total Solved', value: total, icon: Target, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { title: 'Strong Questions', value: strong, icon: CheckCircle, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { title: 'Weak Questions', value: weak, icon: AlertTriangle, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    { title: 'Focus Topic', value: mostFrequentWeakTopic, icon: TrendingUp, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  ];

  // Prepare difficulty data for Pie Chart
  const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
  questions.forEach(q => {
    difficultyCounts[q.difficulty || 'Medium'] += 1;
  });
  const pieData = Object.keys(difficultyCounts)
    .filter(key => difficultyCounts[key] > 0)
    .map(key => ({ name: key, value: difficultyCounts[key] }));
  
  const COLORS = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' };

  // Prepare topic data for Bar Chart (top 5 topics)
  const allTopics = {};
  questions.forEach(q => {
    q.tags.forEach(tag => {
      allTopics[tag] = (allTopics[tag] || 0) + 1;
    });
  });
  const barData = Object.keys(allTopics)
    .map(key => ({ name: key, count: allTopics[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Prepare GitHub style Activity Calendar data
  const activityMap = {};
  questions.forEach(q => {
    const createdDate = q.createdAt ? format(new Date(q.createdAt), 'yyyy-MM-dd') : format(new Date(q.lastRevised), 'yyyy-MM-dd');
    const revisedDate = format(new Date(q.lastRevised), 'yyyy-MM-dd');
    
    activityMap[createdDate] = (activityMap[createdDate] || 0) + 1;
    if (createdDate !== revisedDate) {
      activityMap[revisedDate] = (activityMap[revisedDate] || 0) + 1;
    }
  });

  const today = new Date();
  const calendarData = [];
  for (let i = 365; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const count = activityMap[dateStr] || 0;
    let level = 0;
    if (count > 0) level = 1;
    if (count >= 2) level = 2;
    if (count >= 4) level = 3;
    if (count >= 6) level = 4;
    calendarData.push({ date: dateStr, count, level });
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-all hover:shadow-md">
          <div className={`p-3 rounded-full ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>

      {questions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Difficulty Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {Object.keys(COLORS).map(key => (
                <div key={key} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[key] }}></div>
                  {key}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Top Topics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6', borderRadius: '0.5rem' }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-6 overflow-hidden">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Contribution Activity</h3>
        <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
          <div className="min-w-[800px]">
            <ActivityCalendar 
              data={calendarData} 
              theme={{
                light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
              }}
              colorScheme={darkMode ? 'dark' : 'light'}
              labels={{
                totalCount: '{{count}} contributions in the last year',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
