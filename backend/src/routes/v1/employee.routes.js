const express = require("express");
const router = express.Router();
const Employee = require("../../models/Employee");
const { authenticate, authorizeRoles } = require("../../middlewares/auth");
const { ApiResponse } = require("../../utils/ApiResponse");
const { ApiError } = require("../../utils/ApiError");
const { ROLES } = require("../../constants/roles");
const { getPagination, paginatedResponse } = require("../../utils/helpers");

router.use(authenticate);

router.get("/", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
  const { page = 1, limit = 10, department, search } = req.query;
  const { skip } = getPagination({ page, limit });
  const filter = {};
  if (department) filter.department = department;
  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate({
        path: "user",
        select: "firstName lastName email avatar phone isActive",
        ...(search ? { match: { $or: [{ firstName: { $regex: search, $options: "i" } }, { lastName: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] } } : {}),
      })
      .populate("reportingTo", "firstName lastName")
      .skip(skip)
      .limit(parseInt(limit)),
    Employee.countDocuments(filter),
  ]);
  ApiResponse.success(res, paginatedResponse(employees.filter((e) => e.user), total, parseInt(page), parseInt(limit)));
});

router.post("/", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  const existing = await Employee.findOne({ user: req.body.userId });
  if (existing) throw ApiError.conflict("Employee record already exists for this user");
  const employee = await Employee.create({ ...req.body, user: req.body.userId });
  ApiResponse.created(res, employee, "Employee created");
});

router.get("/:id", async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate("user", "-password -refreshTokens")
    .populate("reportingTo", "firstName lastName avatar");
  if (!employee) throw ApiError.notFound("Employee not found");
  ApiResponse.success(res, employee);
});

router.put("/:id", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!employee) throw ApiError.notFound("Employee not found");
  ApiResponse.success(res, employee, "Employee updated");
});

router.delete("/:id", authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) throw ApiError.notFound("Employee not found");
  ApiResponse.success(res, null, "Employee record deleted");
});

module.exports = router;
