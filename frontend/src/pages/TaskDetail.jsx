import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskAPI } from "../api/apiClient";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import { Loading } from "../components/ui/Loading";
import Alert from "../components/ui/Alert";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const TASK_STATUSES = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
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
        title="Delete subtask"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [subtaskForm, setSubtaskForm] = useState({ title: "" });
  const [subtaskError, setSubtaskError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getById(taskId);
      setTask(response.data.data.task);
      setSubtasks(response.data.data.task?.subtasks || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const handleUpdateTask = async (data) => {
    try {
      const response = await taskAPI.update(taskId, data);
      setTask(response.data.data.task);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task");
    }
  };

  const handleSubtaskSubmit = async (e) => {
    e.preventDefault();
    setSubtaskError("");
    setSubmitting(true);

    try {
      if (editingSubtask) {
        await taskAPI.updateSubTask(editingSubtask._id, subtaskForm);
      } else {
        await taskAPI.createSubTask(taskId, subtaskForm);
      }
      setShowSubtaskModal(false);
      setEditingSubtask(null);
      setSubtaskForm({ title: "" });
      fetchTask();
    } catch (err) {
      setSubtaskError(err.response?.data?.message || "Failed to save subtask");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubtask = async (subtask) => {
    if (!window.confirm(`Delete "${subtask.title}"?`)) return;

    try {
      await taskAPI.deleteSubTask(subtask._id);
      fetchTask();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete subtask");
    }
  };

  const handleToggleSubtask = async (subtaskId, isCompleted) => {
    try {
      await taskAPI.updateSubTask(subtaskId, { isCompleted });
      fetchTask();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update subtask");
    }
  };

  const openCreateSubtaskModal = () => {
    setEditingSubtask(null);
    setSubtaskForm({ title: "" });
    setSubtaskError("");
    setShowSubtaskModal(true);
  };

  if (loading) return <Loading message="Loading task..." />;

  if (error || !task) {
    return (
      <div className="text-center py-12">
        <Alert type="error" message={error || "Task not found"} />
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <Select
              value={task.status}
              onChange={(e) => handleUpdateTask({ status: e.target.value })}
              options={TASK_STATUSES}
              className="w-40"
            />
          </div>
          {task.description && <p className="mt-2 text-gray-500">{task.description}</p>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Subtasks"
              action={
                <Button size="sm" onClick={openCreateSubtaskModal}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Subtask
                </Button>
              }
            />
            <CardContent>
              {subtasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No subtasks yet. Click "Add Subtask" to create one.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <SubtaskItem
                      key={subtask._id}
                      subtask={subtask}
                      onToggle={handleToggleSubtask}
                      onDelete={handleDeleteSubtask}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader title="Details" />
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <Badge
                      variant={
                        task.status === "done"
                          ? "success"
                          : task.status === "in_progress"
                          ? "primary"
                          : "default"
                      }
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </dd>
                </div>
                {task.assignedTo && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Assignee</dt>
                    <dd className="mt-1 flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <span>{task.assignedTo.username || task.assignedTo.email}</span>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Updated</dt>
                  <dd className="mt-1 flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showSubtaskModal}
        onClose={() => { setShowSubtaskModal(false); setEditingSubtask(null); setSubtaskForm({ title: "" }); setSubtaskError(""); }}
        title={editingSubtask ? "Edit Subtask" : "Create Subtask"}
        size="sm"
      >
        <form onSubmit={handleSubtaskSubmit} className="space-y-4">
          {subtaskError && <Alert type="error" message={subtaskError} />}
          <Input
            label="Title"
            value={subtaskForm.title}
            onChange={(e) => setSubtaskForm((p) => ({ ...p, title: e.target.value }))}
            required
            placeholder="Enter subtask title"
            autoFocus
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setShowSubtaskModal(false); setEditingSubtask(null); setSubtaskForm({ title: "" }); }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingSubtask ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TaskDetail;