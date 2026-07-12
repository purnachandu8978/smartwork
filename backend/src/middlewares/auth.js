const passport = require("passport");
const { ApiError } = require("../utils/ApiError");
const { ROLE_PERMISSIONS } = require("../constants/roles");

/**
 * Authenticate via JWT bearer token
 */
const authenticate = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return next(new ApiError(401, info?.message || "Authentication required"));
    if (!user.isActive) return next(new ApiError(403, "Your account has been deactivated"));
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Authorize by role(s)
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Required roles: ${roles.join(", ")}`)
      );
    }
    next();
  };
};

/**
 * Authorize by permission
 */
const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Authentication required"));

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return next(
        new ApiError(403, "You do not have permission to perform this action")
      );
    }
    next();
  };
};

/**
 * Optional authentication — doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (user) req.user = user;
    next();
  })(req, res, next);
};

module.exports = { authenticate, authorizeRoles, authorize, optionalAuth };
