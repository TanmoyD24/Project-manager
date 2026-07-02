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
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projects",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "projects",
              as:"projectmembers",
            },
          },
          {
            $addFields: {
              members:{
                $size: "$projectmembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$project"
    },
    {
      $project: {
        project: {
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          createdBy: 1
        },
        role: 1,
        _id: 0
      }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Project fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const project = await Project.findById(projectId)

  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));

});

const createProject = asyncHandler(async (req, res) => {
  const { name, descrption } = req.body

  await Project.create({
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

  const projectMember = await ProjectMember.findByIdAndUpdate(
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
  const { newRole } = req.body
  
  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, "Invalid Role")
  }

  let projectmember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId)
  })

  if (!projectmember) {
    throw new ApiError(400, "Project member not found");
  }

  const projectMember = await ProjectMember.findByIdAndUpdate(projectmember._id,
    {
      role: newRole
    },
    {new: true}
  )

  if (!projectmember) {
    throw new ApiError(400, "Project member not found");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        projectmember,
        "Project member role updated successfully",
      ),
    );
  
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(req.body)

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const projectMembers = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId)
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        user: {
          $arrayEleAt: ["$user", 0]
        }
      }
    },
    {
      $project: {
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0,
      }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projectMembers, "Project members fetched"));
});

const deleteMember = asyncHandler(async (req, res) => {
   const { projectId, userId } = req.params;

   let projectmember = await ProjectMember.findOne({
     project: new mongoose.Types.ObjectId(projectId),
     user: new mongoose.Types.ObjectId(userId),
   });

   if (!projectmember) {
     throw new ApiError(400, "Project member not found");
   }

   const projectMember = await ProjectMember.findByIdAndDelete(projectmember._id);

   if (!projectmember) {
     throw new ApiError(400, "Project member not found");
   }

   return res
     .status(201)
     .json(
       new ApiResponse(
         201,
         projectmember,
         "Project member rdeleted successfully",
       ),
     );
  
});

export {
  updateMemberRole,
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