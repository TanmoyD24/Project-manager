import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { projectAPI } from "../api/apiClient";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { Loading } from "../components/ui/Loading";
import Alert from "../components/ui/Alert";
import {
  PlusIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

function ProjectCard({ project, onEdit, onDelete, onViewMembers }) {
  const memberCount = project.members?.length || 0;
  const taskCount = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((t) => t.status === "done").length || 0;

  return (
    <Card hover className="group">
      <div className="flex items-start justify-between">
        <Link to={`/projects/${project._id}`} className="flex-1 min-w-0 block hover:opacity-85 transition-opacity">
          <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">{project.name}</h3>
          {project.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <UsersIcon className="h-4 w-4" />
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {taskCount} task{taskCount !== 1 ? "s" : ""}
              {taskCount > 0 && (
                <Badge variant="success" className="ml-1">
                  {completedTasks}/{taskCount}
                </Badge>
              )}
            </span>
            <span className="text-xs">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </Link>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(project); }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit project"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project); }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete project"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewMembers(project); }}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Manage members"
          >
            <UsersIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectAPI.getAll();
      const projectList = (response.data.data.projects || []).map((p) => ({
        ...p.project,
        role: p.role,
      }));
      setProjects(projectList);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (editingProject) {
        await projectAPI.update(editingProject._id, formData);
      } else {
        await projectAPI.create(formData);
      }
      setShowCreateModal(false);
      setEditingProject(null);
      setFormData({ name: "", description: "" });
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) return;

    try {
      await projectAPI.delete(project._id);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({ name: "", description: "" });
    setFormError("");
    setShowCreateModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || "" });
    setFormError("");
    setShowCreateModal(true);
  };

  if (loading) {
    return <Loading message="Loading projects..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage and organize your projects</p>
        </div>
        <Button onClick={openCreateModal} icon={<PlusIcon className="h-5 w-5" />}>
          New Project
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} dismissible onClose={() => setError("")} />
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start organizing your work."
          action={
            <Button onClick={openCreateModal} icon={<PlusIcon className="h-5 w-5" />}>
              Create Project
            </Button>
          }
          icon={FolderIcon}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onViewMembers={(project) => navigate(`/projects/${project._id}`)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProject(null);
          setFormData({ name: "", description: "" });
          setFormError("");
        }}
        title={editingProject ? "Edit Project" : "Create Project"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}
          <Input
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Enter project name"
            autoFocus
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter project description"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setEditingProject(null);
                setFormData({ name: "", description: "" });
                setFormError("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingProject ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Dashboard;