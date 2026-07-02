import { Router } from "express";
import {
  createSubTask,
  createTask,
  deleteTask,
  deleteSubTask,
  getTask,
  getTaskById,
  updateSubTask,
  UpdateTask,
} from "../controllers/task.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createTaskValidator,
  updateTaskValidator,
  createSubTaskValidator,
  updateSubTaskValidator,
} from "../validator/index.js";
import {
  verifyJWT,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/project/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getTask)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createTaskValidator(),
    validate,
    createTask,
  );

router
  .route("/:taskId")
  .get(getTaskById)
  .put(updateTaskValidator(), validate, UpdateTask)
  .delete(deleteTask);

router
  .route("/:taskId/subtasks")
  .post(createSubTaskValidator(), validate, createSubTask);

router
  .route("/subtasks/:subTaskId")
  .put(updateSubTaskValidator(), validate, updateSubTask)
  .delete(deleteSubTask);

export default router;
