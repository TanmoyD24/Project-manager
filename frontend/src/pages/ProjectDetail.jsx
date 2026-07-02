import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectAPI, taskAPI } from "../api/apiClient";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { Loading } from "../components/ui/Loading";
import Alert from "../components/ui/Alert";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  ClockIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const TASK_STATUSES = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const USER_ROLES = [
  { value: "member", label: "Member" },
  { value: "project_admin", label: "Project Admin" },
  { value: "admin", label: "Admin" },
];

function SubtaskItem({ subtask, onToggle, onDelete }) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <input
        type="checkbox"
        checked={subtask.isCompleted}
        onChange={(e) => onToggle(subtask._id, e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <span className={subtask.isCompleted ? "line-through text-gray-400" : "text-gray-900"} flex-1>
        {subtask.title}
      </span>
      <button
        onClick={() => onDelete(subtask)}
        className="text-gray-400 hover:text-red-600 p-1"
        title="Delete"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

function TaskCard({ task, onUpdate, onDelete, onClick }) {
  const statusColors = {
    todo: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    done: "bg-green-100 text-green-800",
  };

  return (
    <Card hover onClick={onClick} className="cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
          )}
          <div className="mt-2 flex items-center space-x-3 text-sm text-gray-500">
            {task.assignedTo && (
              <span className="flex items-center space-x-1">
                <UserIcon className="h-4 w-4" />
                <span>{task.assignedTo.username || task.assignedTo.email}</span>
              </span>
            )}
            <Badge
              variant={
                task.status === "done" ? "success" : task.status === "in_progress" ? "primary" : "default"
              }
            >
              {task.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(task); }}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", status: "todo", assignedTo: "" });
  const [taskError, setTaskError] = useState("");
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState({ email: "", role: "member" });
  const [memberError, setMemberError] = useState("");
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const [projectRes, tasksRes, membersRes] = await Promise.all([
        projectAPI.getById(projectId),
        taskAPI.getByProject(projectId),
        projectAPI.getMembers(projectId),
      ]);
      setProject(projectRes.data.data.project);
      setTasks(tasksRes.data.data.tasks || []);
      setMembers(membersRes.data.data.members || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleUpdateTask = async (data) => {
    try {
      if (editingTask) {
        const response = await taskAPI.update(editingTask._id, data);
        setTasks(tasks.map((t) => (t._id === editingTask._id ? response.data.data.task : t)));
      } else {
        const response = await taskAPI.create(projectId, data);
        setTasks([...tasks, response.data.data.task]);
      }
      setShowTaskModal(false);
      setEditingTask(null);
      setTaskForm({ title: "", description: "", status: "todo", assignedTo: "" });
      setTaskError("");
    } catch (err) {
      setTaskError(err.response?.data?.message || "Failed to save task");
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await taskAPI.delete(task._id);
      setTasks(tasks.filter((t) => t._id !== task._id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError("");
    setMemberSubmitting(true);
    try {
      await projectAPI.addMember(projectId, memberForm);
      setShowMemberModal(false);
      setMemberForm({ email: "", role: "member" });
      fetchProject();
    } catch (err) {
      setMemberError(err.response?.data?.message || "Failed to add member");
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleUpdateMemberRole = async (userId, role) => {
    try {
      await projectAPI.updateMemberRole(projectId, userId, role);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await projectAPI.removeMember(projectId, userId);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  const openCreateTaskModal = () => {
    setEditingTask(null);
    setTaskForm({ title: "", description: "", status: "todo", assignedTo: "" });
    setTaskError("");
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      assignedTo: task.assignedTo?._id || "",
    });
    setTaskError("");
    setShowTaskModal(true);
  };

  const availableMembers = members.filter((m) => m.user?._id).map((m) => ({
    value: m.user._id,
    label: m.user.username || m.user.email,
  }));

  if (loading) return <Loading message="Loading project..." />;

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <Alert type="error" message={error || "Project not found"} />
        <Button variant="secondary" onClick={() => navigate("/dashboard")} className="mt-4">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-gray-500">{project.description}</p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => { setShowMemberModal(true); setMemberError(""); }}>
            <UsersIcon className="h-5 w-5 mr-2" />
            Members ({members.length})
          </Button>
          <Button onClick={openCreateTaskModal}>
            <PlusIcon className="h-5 w-5 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-6 lg:grid-cols-3">
        <KanbanColumn
          title="To Do"
          count={todoTasks.length}
          tasks={todoTasks}
          onTaskClick={openEditTaskModal}
          onTaskDelete={handleDeleteTask}
        />
        <KanbanColumn
          title="In Progress"
          count={inProgressTasks.length}
          tasks={inProgressTasks}
          onTaskClick={openEditTaskModal}
          onTaskDelete={handleDeleteTask}
        />
        <KanbanColumn
          title="Done"
          count={doneTasks.length}
          tasks={doneTasks}
          onTaskClick={openEditTaskModal}
          onTaskDelete={handleDeleteTask}
        />
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); setTaskForm({ title: "", description: "", status: "todo", assignedTo: "" }); setTaskError(""); }}
        title={editingTask ? "Edit Task" : "Create Task"}
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleUpdateTask(taskForm); }} className="space-y-4">
          {taskError && <Alert type="error" message={taskError} />}
          <Input
            label="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
            required
            placeholder="Task title"
          />
          <Input
            label="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Task description (optional)"
            as="textarea"
            rows={3}
          />
          <Select
            label="Status"
            value={taskForm.status}
            onChange={(e) => setTaskForm((p) => ({ ...p, status: e.target.value }))}
            options={TASK_STATUSES}
          />
          <Select
            label="Assignee (Optional)"
            value={taskForm.assignedTo}
            onChange={(e) => setTaskForm((p) => ({ ...p, assignedTo: e.target.value }))}
            options={availableMembers}
            placeholder="Unassigned"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setShowTaskModal(false); setEditingTask(null); setTaskForm({ title: "", description: "", status: "todo", assignedTo: "" }); }}>
              Cancel
            </Button>
            <Button type="submit" loading={taskSubmitting}>
              {editingTask ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Member Modal */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => { setShowMemberModal(false); setMemberForm({ email: "", role: "member" }); setMemberError(""); }}
        title="Add Member"
        size="sm"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          {memberError && <Alert type="error" message={memberError} />}
          <Input
            label="Email"
            type="email"
            value={memberForm.email}
            onChange={(e) => setMemberForm((p) => ({ ...p, email: e.target.value }))}
            required
            placeholder="member@example.com"
          />
          <Select
            label="Role"
            value={memberForm.role}
            onChange={(e) => setMemberForm((p) => ({ ...p, role: e.target.value }))}
            options={USER_ROLES}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setShowMemberModal(false); setMemberForm({ email: "", role: "member" }); }}>
              Cancel
            </Button>
            <Button type="submit" loading={memberSubmitting}>
              Add Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function KanbanColumn({ title, count, tasks, onTaskClick, onTaskDelete }) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Badge variant="default">{count}</Badge>
      </div>
      <div className="space-y-3 min-h-[400px]">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">No tasks</div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onUpdate={onTaskClick}
              onDelete={onTaskDelete}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;