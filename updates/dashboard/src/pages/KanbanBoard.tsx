import { KanbanSquare, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

interface ChecklistItem {
  text: string;
  completed: boolean;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  assignedTo?: string;
  dueDate?: string;
  attachment?: string;
  checklist?: ChecklistItem[];
  priority?: string;
  progress?: string;
}

function KanbanBoard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    attachment: string;
    checklist: ChecklistItem[];
    priority: string;
    status: string;
    progress: string;
  }>({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    attachment: '',
    checklist: [],
    priority: 'Medium',
    status: 'pending',
    progress: 'pending',
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [checklistInput, setChecklistInput] = useState('');
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editChecklistInput, setEditChecklistInput] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        console.log('Fetched tasks:', data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          assignedTo: newTask.assignedTo,
          dueDate: newTask.dueDate,
          attachment: newTask.attachment,
          checklist: newTask.checklist,
          priority: newTask.priority,
          progress: newTask.progress,
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewTask({
          title: '',
          description: '',
          assignedTo: '',
          dueDate: '',
          attachment: '',
          checklist: [],
          priority: 'Medium',
          status: 'pending',
          progress: 'pending',
        });
        setChecklistInput('');
        fetchTasks(); // Refresh the task list
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      if (status === 'pending') return task.status === 'pending';
      if (status === 'in-progress') return task.status === 'in-progress';
      if (status === 'completed') return task.status === 'completed';
      return false;
    });
  };

  const columns = [
    {
      title: "Pending",
      tasks: getTasksByStatus('pending'),
      bgColor: "bg-gray-100 dark:bg-gray-800",
      borderColor: "border-gray-300 dark:border-gray-700"
    },
    {
      title: "In Progress",
      tasks: getTasksByStatus('in-progress'),
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Completed",
      tasks: getTasksByStatus('completed'),
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800"
    }
  ];

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    // Find the task
    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;
    // Determine new status
    let newStatus = 'pending';
    if (destination.droppableId === 'in-progress') newStatus = 'in-progress';
    if (destination.droppableId === 'completed') newStatus = 'completed';
    // Update backend
    try {
      await fetch(`http://localhost:3001/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!editTask) return;
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${editTask._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTask.title,
          description: editTask.description,
          status: editTask.status,
          assignedTo: editTask.assignedTo,
          dueDate: editTask.dueDate,
          attachment: editTask.attachment,
          checklist: editTask.checklist,
          priority: editTask.priority,
          progress: editTask.progress,
        }),
      });
      if (response.ok) {
        setEditTask(null);
        setEditChecklistInput('');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="h-full p-6 bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your tasks efficiently</p>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {columns.map((column, index) => (
            <Droppable droppableId={
              column.title === 'Pending' ? 'pending' :
              column.title === 'In Progress' ? 'in-progress' :
              'completed'
            } key={column.title}>
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`${column.bgColor} ${column.borderColor} rounded-lg border p-4 h-full`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {column.title}
                    </h2>
                    {column.title === "Pending" && (
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    )}
                  </div>
                  <div className="h-full overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                      </div>
                    ) : column.tasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
                        <KanbanSquare className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No tasks in {column.title.toLowerCase()}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {column.tasks.map((task, idx) => (
                          <Draggable draggableId={task._id} index={idx} key={task._id}>
                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                              const checklistTotal = task.checklist ? task.checklist.length : 0;
                              const checklistCompleted = task.checklist ? task.checklist.filter(item => item.completed).length : 0;
                              let priorityColor = 'bg-green-100 text-green-800';
                              if (task.priority === 'High') priorityColor = 'bg-red-100 text-red-800';
                              else if (task.priority === 'Medium') priorityColor = 'bg-yellow-100 text-yellow-800';
                              // Calculate progress as percent of checklist completed
                              const progress = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;
                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`relative bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                                  onClick={() => setEditTask(task)}
                                >
                                  {/* Delete button (optional) */}
                                  <button
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    title="Delete Task"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await fetch(`http://localhost:3001/api/tasks/${task._id}`, { method: 'DELETE' });
                                      fetchTasks();
                                    }}
                                  >
                                    ×
                                  </button>
                                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{task.title}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{task.description}</p>
                                  <div className="flex flex-wrap gap-2 mb-2 text-xs">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Assigned to: {task.assignedTo && task.assignedTo.trim() ? task.assignedTo : '-'}</span>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Due: {task.dueDate && task.dueDate.trim() ? task.dueDate : '-'}</span>
                                    <span className={`px-2 py-0.5 rounded font-semibold ${priorityColor}`}>{task.priority || 'Medium'}</span>
                                  </div>
                                  {(task.checklist && task.checklist.length > 0) ? (
                                    <div className="mb-2">
                                      <div className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">
                                        Checklist ({checklistCompleted}/{checklistTotal})
                                      </div>
                                      <ul className="space-y-1">
                                        {task.checklist.map((item, idx) => (
                                          <li key={idx} className="flex items-center gap-2">
                                            <input type="checkbox" checked={item.completed} readOnly className="accent-blue-500" />
                                            <span className={item.completed ? 'line-through text-green-600' : ''}>{item.text}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : (
                                    <div className="mb-2 text-xs text-gray-400">No checklist</div>
                                  )}
                                </div>
                              );
                            }}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add New Task</h3>
            <input
              type="text"
              placeholder="Task Title"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              placeholder="Task Description"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <input
              type="text"
              placeholder="Assigned To"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
            />
            <input
              type="date"
              placeholder="Due Date"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            {/* Attachment (as URL for now) */}
            <input
              type="text"
              placeholder="Attachment URL"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newTask.attachment}
              onChange={(e) => setNewTask({ ...newTask, attachment: e.target.value })}
            />
            {/* Checklist */}
            <div className="mb-3">
              <div className="flex mb-2">
                <input
                  type="text"
                  placeholder="Add checklist item"
                  className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                />
                <button
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-md"
                  onClick={() => {
                    if (checklistInput.trim()) {
                      setNewTask({
                        ...newTask,
                        checklist: [...newTask.checklist, { text: checklistInput, completed: false }]
                      });
                      setChecklistInput('');
                    }
                  }}
                  type="button"
                >
                  Add
                </button>
              </div>
              <ul className="list-disc pl-5">
                {newTask.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span>{item.text}</span>
                    <button
                      className="text-red-500 ml-2"
                      onClick={() => {
                        setNewTask({
                          ...newTask,
                          checklist: newTask.checklist.filter((_, i) => i !== idx)
                        });
                      }}
                      type="button"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Priority */}
            <select
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            {/* Status */}
            <select
              className="w-full mb-4 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            {/* Progress */}
            <select
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newTask.progress}
              onChange={e => setNewTask({ ...newTask, progress: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {editTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Task</h3>
            <input
              type="text"
              placeholder="Task Title"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={editTask.title}
              onChange={e => setEditTask({ ...editTask, title: e.target.value })}
            />
            <textarea
              placeholder="Task Description"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={editTask.description}
              onChange={e => setEditTask({ ...editTask, description: e.target.value })}
            />
            <input
              type="text"
              placeholder="Assigned To"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={editTask.assignedTo || ''}
              onChange={e => setEditTask({ ...editTask, assignedTo: e.target.value })}
            />
            <input
              type="date"
              placeholder="Due Date"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={editTask.dueDate ? String(editTask.dueDate).slice(0, 10) : ''}
              onChange={e => setEditTask({ ...editTask, dueDate: e.target.value })}
            />
            <input
              type="text"
              placeholder="Attachment URL"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={editTask.attachment || ''}
              onChange={e => setEditTask({ ...editTask, attachment: e.target.value })}
            />
            {/* Checklist */}
            <div className="mb-3">
              <div className="flex mb-2">
                <input
                  type="text"
                  placeholder="Add checklist item"
                  className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editChecklistInput}
                  onChange={e => setEditChecklistInput(e.target.value)}
                />
                <button
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-md"
                  onClick={() => {
                    if (editChecklistInput.trim()) {
                      setEditTask({
                        ...editTask,
                        checklist: [
                          ...(editTask.checklist || []),
                          { text: editChecklistInput, completed: false }
                        ]
                      });
                      setEditChecklistInput('');
                    }
                  }}
                  type="button"
                >
                  Add
                </button>
              </div>
              <ul className="list-disc pl-5">
                {(editTask.checklist || []).map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {
                          setEditTask({
                            ...editTask,
                            checklist: editTask.checklist!.map((c, i) =>
                              i === idx ? { ...c, completed: !c.completed } : c
                            )
                          });
                        }}
                      />
                      <span className={item.completed ? 'line-through text-green-600' : ''}>{item.text}</span>
                    </label>
                    <button
                      className="text-red-500"
                      onClick={() => {
                        setEditTask({
                          ...editTask,
                          checklist: editTask.checklist!.filter((_, i) => i !== idx)
                        });
                      }}
                      type="button"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Priority */}
            <select
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={editTask.priority || 'Medium'}
              onChange={e => setEditTask({ ...editTask, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            {/* Status */}
            <select
              className="w-full mb-4 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={editTask.status}
              onChange={e => setEditTask({ ...editTask, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            {/* Progress */}
            <select
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={editTask.progress || 'pending'}
              onChange={e => setEditTask({ ...editTask, progress: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditTask(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KanbanBoard;
