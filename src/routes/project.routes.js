import { Router } from "express";
import {
  updateMemberRole,
  addMemberToProject,
  deleteMember,
  getProjectMembers,
  getProjectById,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectNotes,
  createProjectNote,
  updateProjectNote,
  deleteProjectNote,
} from "../controllers/project.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userChangeCurrentPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  createProjectValidator,
  addMemberToValidator,
  createProjectNoteValidator,
} from "../validator/index.js";
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT)

router
    .route("/")
    .get(getProjects)
    .post(createProjectValidator(), validate, createProject);

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getProjectById)
    .put(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject
    )
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteProject);

router
    .route("/:projectId/members")
    .get(getProjectMembers)
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        addMemberToValidator(),
        validate,
        addMemberToProject
)

router
    .route("/:projectId/members/:userId")
    .put(validateProjectPermission([UserRolesEnum.ADMIN]),updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteMember)

router
    .route("/:projectId/notes")
    .get(validateProjectPermission(AvailableUserRole), getProjectNotes)
    .post(
        validateProjectPermission(AvailableUserRole),
        createProjectNoteValidator(),
        validate,
        createProjectNote
    );

router
    .route("/:projectId/notes/:noteId")
    .put(
        validateProjectPermission(AvailableUserRole),
        createProjectNoteValidator(),
        validate,
        updateProjectNote
    )
    .delete(
        validateProjectPermission(AvailableUserRole),
        deleteProjectNote
    );
    

export default router;