import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Fetch all tasks on load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  // 1. CREATE Task
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTask }),
      });
      const data = await res.json();
      setTasks([data, ...tasks]);
      setNewTask('');
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  // 2. UPDATE: Toggle Completed Checkbox
  const toggleComplete = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      const updated = await res.json();
      setTasks(tasks.map((task) => (task._id === id ? updated : task)));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Enable Inline Editing Mode
  const startEditing = (task) => {
    setEditingId(task._id);
    setEditingText(task.text);
  };

  // 3. UPDATE: Save Edited Task Text
  const saveEdit = async (id) => {
    if (!editingText.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editingText }),
      });
      const updated = await res.json();
      setTasks(tasks.map((task) => (task._id === id ? updated : task)));
      setEditingId(null);
      setEditingText('');
    } catch (err) {
      console.error('Error updating text:', err);
    }
  };

  // Cancel Editing Mode
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // 4. DELETE Task
  const deleteTask = async (id) => {
    try {
      await fetch(`${API_BASE}/delete/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className="app-container">
      <h1>Task Manager</h1>

      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          placeholder="Enter a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit" className="btn btn-add">Add Task</button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-content">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task._id, task.completed)}
              />

              {editingId === task._id ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
              ) : (
                <span className="task-text">{task.text}</span>
              )}
            </div>

            <div className="task-actions">
              {editingId === task._id ? (
                <>
                  <button onClick={() => saveEdit(task._id)} className="btn btn-save">Save</button>
                  <button onClick={cancelEdit} className="btn btn-cancel">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditing(task)} className="btn btn-edit">Edit</button>
                  <button onClick={() => deleteTask(task._id)} className="btn btn-delete">Delete</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;