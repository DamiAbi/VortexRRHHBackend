import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, login, updateUser, forgotPassword, resetPassword } from "../controllers/userController";
import validateUser from "../helpers/userValidation";

const router = Router();

router.route("/users").get(getUsers).post(validateUser, login);
router.route("/newUser").post(validateUser, createUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").put(resetPassword);
router.route("/users/:id").get(getUserById).put(validateUser, updateUser).delete(deleteUser);

export default router;
