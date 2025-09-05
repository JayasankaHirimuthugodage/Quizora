import { useState, useEffect } from 'react';
import { moduleService } from '../../services/moduleService';
import { Search, Plus, Edit, Trash2, BookOpen, Users, Calendar } from 'lucide-react';

const ModuleList = ({ onSelectModule, onCreateModule, onEditModule }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    year: '',
    semester: ''
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchModules();
    fetchStats();
  }, [filters]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await moduleService.getModules(filters);
      setModules(response.modules || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await moduleService.getModuleStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleDeleteModule = async (module) => {
    if (!window.confirm(`Are you sure you want to delete ${module.moduleCode}? This action cannot be undone.`)) {
      return;
    }

    try {
      await moduleService.deleteModule(module._id);
      fetchModules();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Modules</h1>
          <p className="text-sm text-gray-600">Manage your course modules and questions</p>
        </div>
        <button
          onClick={onCreateModule}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Add Module
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Modules</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalModules}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Years</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Set(stats.yearStats?.map(s => s._id.year)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Questions</p>
                <p className="text-lg font-semibold text-gray-900">
                  {modules.reduce((sum, m) => sum + m.questionCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search modules..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
          
          <select
            value={filters.semester}
            onChange={(e) => handleFilterChange('semester', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
            <p className="text-gray-500 mb-4">Create your first module to get started</p>
            <button
              onClick={onCreateModule}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Module
            </button>
          </div>
        ) : (
          modules.map((module) => (
            <div key={module._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {module.moduleCode}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{module.moduleName}</p>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <span>Year {module.moduleYear}</span>
                    <span>•</span>
                    <span>Sem {module.moduleSemester}</span>
                    <span>•</span>
                    <span>{module.credits} Credits</span>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => onEditModule(module)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit Module"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete Module"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {module.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {module.description}
                </p>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Users size={14} className="mr-1" />
                  {module.questionCount} Questions
                </div>
                
                <button
                  onClick={() => onSelectModule(module)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Manage Questions
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModuleList;