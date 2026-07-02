import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { ProjectNote } from "../models/note.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  const projectMembers = await ProjectMember.find({
    user: new mongoose.Types.ObjectId(req.user._id),
  }).populate({
    path: "project",
    select: "name description createdBy createdAt"
  });

  const projects = projectMembers.map((pm) => ({
    project: pm.project,
    role: pm.role,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, { projects }, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const project = await Project.findById(projectId)

  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { project }, "Project fetched successfully"));

});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  await ProjectMember.create(
    {
      user: new mongoose.Types.ObjectId(req.user._id),
      project: new mongoose.Types.ObjectId(project._id),
      role: UserRolesEnum.ADMIN
    }
  )

  return res
    .status(201)
    .json(new ApiResponse(201, project, 'Project created successfully'));

});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body
  const { projectId } = req.params
  
  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description
    },
    { new: true }
  );

  if (!project) {
    throw new ApiError(404, "PROJECT NOT FOUND")
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        project,
        "Project updated successfully"
      )
    )
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  
  const project = await Project.findByIdAndDelete(projectId)
  if (!project) {
    throw new ApiError(404, "PROJECT NOT FOUND");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project deleted successfully"));
});

const addMemberToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body
  const { projectId } = req.params
  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(404, "User does not exists")
  }

  const projectMember = await ProjectMember.findOneAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role: role
    },
    {
      new: true,
      upsert: true
    }
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, projectMember, "Project member added successfully"),
    );
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params
  const { role } = req.body

  if (!AvailableUserRole.includes(role)) {
    throw new ApiError(400, "Invalid Role")
  }

  let projectmember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId)
  })

  if (!projectmember) {
    throw new ApiError(400, "Project member not found");
  }

  projectmember = await ProjectMember.findByIdAndUpdate(projectmember._id,
    {
      role
    },
    {new: true}
  )

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectmember,
        "Project member role updated successfully",
      ),
    );

});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const projectMembers = await ProjectMember.find({
    project: new mongoose.Types.ObjectId(projectId)
  }).populate("user", "username email fullName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, { members: projectMembers }, "Project members fetched"));
});

const deleteMember = asyncHandler(async (req, res) => {
   const { projectId, userId } = req.params;

   const projectmember = await ProjectMember.findOneAndDelete({
     project: new mongoose.Types.ObjectId(projectId),
     user: new mongoose.Types.ObjectId(userId),
   });

   if (!projectmember) {
     throw new ApiError(404, "Project member not found");
   }

   return res
     .status(200)
     .json(
       new ApiResponse(
         200,
         projectmember,
         "Project member removed successfully",
       ),
     );

});

export {
  addMemberToProject,
  deleteMember,
  getProjectMembers,
  getProjectById,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  updateMemberRole,
};