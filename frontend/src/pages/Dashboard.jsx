import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Plus, Trash2, CheckCircle, Circle, LogOut } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('/api/tasks', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTasks();
  }, [user.token]);



  const addTask = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      const res = await axios.post(
        '/api/tasks',
        { title, description },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTasks([res.data, ...tasks]);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'DONE' ? 'OPEN' : 'DONE';
    try {
      const res = await axios.put(
        `/api/tasks/${task.id}`,
        { ...task, status: newStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTasks(tasks.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Task Manager</h1>
        <button
          onClick={logout}
          className="flex items-center text-gray-600 hover:text-red-500 transition"
        >
          <LogOut size={20} className="mr-2" /> Logout
        </button>
      </nav>

      <div className="container mx-auto p-6 max-w-4xl">
        <form onSubmit={addTask} className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Task Title"
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center transition"
            >
              <Plus size={20} className="mr-2" /> Add
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white p-4 rounded-xl shadow-sm flex items-center justify-between transition ${task.status === 'DONE' ? 'opacity-60 bg-gray-50' : ''
                }`}
            >
              <div className="flex items-center">
                <button
                  onClick={() => toggleStatus(task)}
                  className={`mr-4 transition ${task.status === 'DONE' ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
                    }`}
                >
                  {task.status === 'DONE' ? <CheckCircle size={24} /> : <Circle size={24} />}
                </button>
                <div>
                  <h3
                    className={`text-lg font-medium ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && <p className="text-gray-500 text-sm">{task.description}</p>}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-center text-gray-500 mt-8">No tasks found. Start by adding one!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
