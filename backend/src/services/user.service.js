const User = require("../models/User");
const { ApiError } = require("../utils/ApiError");
const { getPagination, paginatedResponse, getSort } = require("../utils/helpers");
const { deleteFromCloudinary } = require("../config/cloudinary");

class UserService {
  async getUsers({ search, role, isActive, page, limit, sortBy, sortOrder }) {
    const { skip } = getPagination({ page, limit });
    const sort = getSort(sortBy, sortOrder);

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).select("-refreshTokens"),
      User.countDocuments(filter),
    ]);

    return paginatedResponse(users, total, page, limit);
  }

  async getUserById(id) {
    const user = await User.findById(id).select("-refreshTokens");
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  async updateUser(id, updateData, requesterId, requesterRole) {
    // Non-admins can only update themselves
    if (requesterRole === "employee" && id !== requesterId.toString()) {
      throw ApiError.forbidden("You can only update your own profile");
    }
    // Only admins can change roles
    if (updateData.role && !["admin", "super_admin"].includes(requesterRole)) {
      delete updateData.role;
    }

    const allowedFields = ["firstName", "lastName", "phone", "bio", "department", "position", "theme", "language", "timezone", "notificationPreferences"];
    if (["admin", "super_admin"].includes(requesterRole)) {
      allowedFields.push("role", "isActive");
    }

    const filtered = Object.fromEntries(
      Object.entries(updateData).filter(([k]) => allowedFields.includes(k))
    );

    const user = await User.findByIdAndUpdate(id, filtered, { new: true, runValidators: true }).select("-refreshTokens");
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  async updateAvatar(userId, file) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found");

    // Delete old avatar
    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId).catch(() => {});
    }

    user.avatar = { url: file.path, publicId: file.filename };
    await user.save();
    return { avatar: user.avatar };
  }

  async deleteUser(id, requesterId) {
    if (id === requesterId.toString()) throw ApiError.badRequest("You cannot delete your own account");
    const user = await User.findByIdAndDelete(id);
    if (!user) throw ApiError.notFound("User not found");
    return { message: "User deleted successfully" };
  }

  async toggleUserStatus(id) {
    const user = await User.findById(id);
    if (!user) throw ApiError.notFound("User not found");
    user.isActive = !user.isActive;
    await user.save();
    return { isActive: user.isActive, message: `User ${user.isActive ? "activated" : "deactivated"} successfully` };
  }

  async getDashboardStats() {
    const [total, byRole, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      User.find().sort({ createdAt: -1 }).limit(5).select("firstName lastName email role avatar createdAt"),
    ]);

    return {
      total,
      byRole: byRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
      recentUsers,
    };
  }
}

module.exports = new UserService();
