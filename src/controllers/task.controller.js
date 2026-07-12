import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { ProjectNote } from "../models/note.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";


const getTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const tasks = await Task.find({
        project: new mongoose.Types.ObjectId(projectId)
    }).populate("assignedTo", "avatar username fullName");

    return res
        .status(200)
        .json(new ApiResponse(200, { tasks }, "Tasks fetched successfully"))
});

const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, status } = req.body
    const { projectId } = req.params;
    const project = await Project.findById(projectId)

    if (!project) {
        throw new ApiError(404, "Project not found")
    }

    const files = req.files || []
    const attachments = files.map((file) => ({
        url: `${process.env.SERVER_URL}/images/${file.originalname}`,
        mimetype: file.mimetype,
        size: file.size
    }))

    const task = await Task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
        status,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments
    });

    return res
        .status(201)
        .json(new ApiResponse(201, { task }, "Task created successfully"))
});

const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task Id format")
    }

    const task = await Task.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(taskId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedTo",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                fullName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "subtasks",
          localField: "_id",
          foreignField: "task",
          as: "subtasks",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      username: 1,
                      fullName: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                createdBy: {
                  $arrayElemAt: ["$createdBy", 0],
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          assignedTo: {
            $arrayElemAt: ["$assignedTo", 0],
          },
        },
      },
    ]);

    if (!task || task.length === 0) {
        throw new ApiError(404, "Task not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, { task: task[0] }, "Task fetched successfully"));
});

const UpdateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID format");
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (status) updateFields.status = status;

  if (assignedTo !== undefined) {
    if (assignedTo === "" || assignedTo === null) {
      updateFields.assignedTo = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        throw new ApiError(400, "Invalid user ID format for assignedTo");
      }
      updateFields.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      $set: updateFields,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("assignedTo", "avatar username fullName");

  if (!updatedTask) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { task: updatedTask }, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID format");
  }

  const deletedTask = await Task.findByIdAndDelete(taskId);

  if (!deletedTask) {
    throw new ApiError(404, "Task not found");
  }

  await SubTask.deleteMany({ task: taskId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID format");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  let assignedToId = undefined;
  if (assignedTo) {
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      throw new ApiError(400, "Invalid user ID format for assignedTo");
    }
    assignedToId = new mongoose.Types.ObjectId(assignedTo);
  }

  const subTask = await SubTask.create({
    title,
    description,
    task: new mongoose.Types.ObjectId(taskId),
    assignedTo: assignedToId,
    status,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subTask, "Subtask created successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
    throw new ApiError(400, "Invalid subtask ID format");
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (status) updateFields.status = status;

  if (assignedTo !== undefined) {
    if (assignedTo === "" || assignedTo === null) {
      updateFields.assignedTo = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        throw new ApiError(400, "Invalid user ID format for assignedTo");
      }
      updateFields.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }
  }

  const updatedSubTask = await SubTask.findByIdAndUpdate(
    subTaskId,
    {
      $set: updateFields,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("assignedTo", "avatar username fullName");

  if (!updatedSubTask) {
    throw new ApiError(404, "Subtask not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSubTask, "Subtask updated successfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
    throw new ApiError(400, "Invalid subtask ID format");
  }

  const deletedSubTask = await SubTask.findByIdAndDelete(subTaskId);

  if (!deletedSubTask) {
    throw new ApiError(404, "Subtask not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subtask deleted successfully"));
});


export {
    createSubTask,
    createTask,
    deleteTask,
    deleteSubTask,
    getTask,
    getTaskById,
    updateSubTask,
    UpdateTask
}