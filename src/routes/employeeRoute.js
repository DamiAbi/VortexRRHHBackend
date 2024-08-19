import { Router } from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController";
import validateEmployee from "../helpers/validateEmployee";

const router = Router();

router.route("/employees")
  .get(getAllEmployees)
  .post(validateEmployee, createEmployee);

router.route("/employees/:id")
  .get(getEmployeeById)
  .put(validateEmployee, updateEmployee)
  .delete(deleteEmployee);

export default router;
