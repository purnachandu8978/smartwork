const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../src/models/User");
const Employee = require("../src/models/Employee");
const Team = require("../src/models/Team");
const Project = require("../src/models/Project");
const Task = require("../src/models/Task");
const CalendarEvent = require("../src/models/CalendarEvent");
const Message = require("../src/models/Message");
const Notification = require("../src/models/Notification");
const { ROLES } = require("../src/constants/roles");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smartwork-hub";

const seedData = async () => {
  try {
    console.log("Connecting to database at:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected! Clearing existing collections...");

    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Team.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      CalendarEvent.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log("Collections cleared. Seeding Users...");

    // Create users (with hashed password: password123)
    const usersData = [
      { firstName: "Chinna", lastName: "Official", email: "rockstarpurna80@gmail.com", role: ROLES.SUPER_ADMIN, password: "password123", isEmailVerified: true },
      { firstName: "Chandu", lastName: "Purna", email: "purnac2004@gmail.com", role: ROLES.EMPLOYEE, password: "password123", isEmailVerified: true },
      { firstName: "John", lastName: "Doe", email: "john.doe@example.com", role: ROLES.EMPLOYEE, password: "password123", isEmailVerified: true },
      { firstName: "chinna", lastName: "cyber", email: "99240041265@klu.ac.in", role: ROLES.EMPLOYEE, password: "password123", isEmailVerified: true },
      { firstName: "Sarah", lastName: "Chen", email: "sarah@smartwork.dev", role: ROLES.MANAGER, password: "password123", isEmailVerified: true },
      { firstName: "Marcus", lastName: "Johnson", email: "marcus@smartwork.dev", role: ROLES.EMPLOYEE, password: "password123", isEmailVerified: true },
      { firstName: "Priya", lastName: "Patel", email: "priya@smartwork.dev", role: ROLES.EMPLOYEE, password: "password123", isEmailVerified: true },
      { firstName: "James", lastName: "Wilson", email: "james@smartwork.dev", role: ROLES.EMPLOYEE, password: "password123", isEmailVerified: true },
      { firstName: "Emily", lastName: "Davis", email: "emily@smartwork.dev", role: ROLES.MANAGER, password: "password123", isEmailVerified: true },
      { firstName: "Alex", lastName: "Rivera", email: "alex@smartwork.dev", role: ROLES.EMPLOYEE, password: "password123", isEmailVerified: true },
    ];

    const users = [];
    for (const u of usersData) {
      const user = new User(u);
      // Wait for schema password pre-save hook to hash
      await user.save();
      users.push(user);
    }

    const chinnaSuper = users.find(u => u.email === "rockstarpurna80@gmail.com");
    const chandu = users.find(u => u.email === "purnac2004@gmail.com");
    const sarah = users.find(u => u.email === "sarah@smartwork.dev");
    const emily = users.find(u => u.email === "emily@smartwork.dev");

    console.log("Seeding Employees...");
    const employeesData = [
      { user: users[2]._id, position: "Software Engineer", department: "Engineering", joiningDate: new Date("2025-01-10"), reportingTo: sarah._id },
      { user: users[1]._id, position: "Security Analyst", department: "cybersecurity", joiningDate: new Date("2025-03-15"), reportingTo: chinnaSuper._id },
      { user: users[3]._id, position: "Security Trainee", department: "cybersecurity", joiningDate: new Date("2025-05-20"), reportingTo: chinnaSuper._id },
      { user: users[4]._id, position: "Senior Frontend Lead", department: "Engineering", joiningDate: new Date("2024-06-15") },
      { user: users[5]._id, position: "Backend Developer", department: "Engineering", joiningDate: new Date("2024-09-01"), reportingTo: sarah._id },
      { user: users[6]._id, position: "UI/UX Designer", department: "Design", joiningDate: new Date("2025-02-01"), reportingTo: sarah._id },
      { user: users[7]._id, position: "Full Stack Developer", department: "Engineering", joiningDate: new Date("2024-11-10"), reportingTo: sarah._id },
      { user: users[8]._id, position: "Marketing Manager", department: "Marketing", joiningDate: new Date("2024-05-01") },
      { user: users[9]._id, position: "Support Engineer", department: "Operations", joiningDate: new Date("2025-04-01") },
    ];
    await Employee.insertMany(employeesData);

    console.log("Seeding Teams...");
    const teamsData = [
      { name: "Engineering Team", description: "Core product development division", leader: sarah._id, members: users.slice(2, 8).map(u => ({ user: u._id, role: "member" })), createdBy: chinnaSuper._id },
      { name: "Security Team", description: "Securing corporate assets and cyber defense", leader: chinnaSuper._id, members: [ { user: chandu._id, role: "member" } ], createdBy: chinnaSuper._id },
    ];
    const createdTeams = await Team.insertMany(teamsData);

    console.log("Seeding Projects...");
    const projectsData = [
      { name: "SmartWork Platform", description: "Core enterprise MERN system deployment", team: createdTeams[0]._id, owner: sarah._id, status: "active", priority: "high", progress: 65, startDate: new Date("2026-01-15"), endDate: new Date("2026-09-30"), createdBy: chinnaSuper._id },
      { name: "Mobile App Redesign", description: "Overhaul customer-facing mobile applications UI", team: createdTeams[0]._id, owner: users[6]._id, status: "active", priority: "critical", progress: 40, startDate: new Date("2026-03-01"), endDate: new Date("2026-08-15"), createdBy: chinnaSuper._id },
      { name: "Analytics Dashboard", description: "Develop and deploy advanced reporting metrics module", team: createdTeams[0]._id, owner: sarah._id, status: "planning", priority: "medium", progress: 10, startDate: new Date("2026-06-01"), endDate: new Date("2026-12-31"), createdBy: chinnaSuper._id },
      { name: "API Gateway v2", description: "Build scalable routing and rate limiter layers", team: createdTeams[0]._id, owner: users[5]._id, status: "active", priority: "high", progress: 80, startDate: new Date("2026-02-01"), endDate: new Date("2026-07-30"), createdBy: chinnaSuper._id },
      { name: "Customer Portal", description: "Implement self-service help and wiki interface", team: createdTeams[0]._id, owner: emily._id, status: "on_hold", priority: "high", progress: 100, startDate: new Date("2025-10-01"), endDate: new Date("2026-04-15"), createdBy: chinnaSuper._id },
      { name: "DevOps Pipeline", description: "Setup CI/CD pipelines using GitHub Actions", team: createdTeams[0]._id, owner: chinnaSuper._id, status: "on_hold", priority: "low", progress: 25, startDate: new Date("2026-04-01"), endDate: new Date("2026-11-30"), createdBy: chinnaSuper._id },
    ];
    const createdProjects = await Project.insertMany(projectsData);

    console.log("Seeding Tasks...");
    const tasksData = [
      { title: "Implement user authentication flow", description: "Setup JWT cookies and RBAC middleware", project: createdProjects[0]._id, assignee: chandu._id, status: "done", priority: "critical", estimatedHours: 16, dueDate: new Date("2026-07-15"), createdBy: sarah._id },
      { title: "Design dashboard wireframes", description: "Create high-fidelity screens in Figma", project: createdProjects[1]._id, assignee: users[6]._id, status: "review", priority: "high", estimatedHours: 8, dueDate: new Date("2026-07-18"), createdBy: sarah._id },
      { title: "Set up database migrations", description: "Design MongoDB schemas and TTL indexes", project: createdProjects[0]._id, assignee: users[5]._id, status: "in_progress", priority: "high", estimatedHours: 12, dueDate: new Date("2026-07-20"), createdBy: sarah._id },
      { title: "Write API documentation", description: "Setup Swagger UI and export JSON schemas", project: createdProjects[2]._id, assignee: sarah._id, status: "todo", priority: "medium", estimatedHours: 6, dueDate: new Date("2026-07-25"), createdBy: sarah._id },
      { title: "Performance optimization audit", description: "Check API latency and memory leaks", project: createdProjects[0]._id, assignee: chandu._id, status: "backlog", priority: "medium", estimatedHours: 10, createdBy: sarah._id },
      { title: "Implement file upload service", description: "Connect Multer backend to Cloudinary storage", project: createdProjects[0]._id, assignee: users[5]._id, status: "in_progress", priority: "high", estimatedHours: 14, dueDate: new Date("2026-07-22"), createdBy: sarah._id },
      { title: "Create onboarding flow", description: "Develop walk-through slides for new hires", project: createdProjects[4]._id, assignee: emily._id, status: "todo", priority: "medium", estimatedHours: 20, dueDate: new Date("2026-07-28"), createdBy: sarah._id },
      { title: "Database schema optimization", description: "Add index constraints to prevent duplicate lookups", project: createdProjects[0]._id, assignee: users[5]._id, status: "todo", priority: "high", estimatedHours: 8, createdBy: sarah._id },
      { title: "Implement search functionality", description: "Setup text search filter in task routes", project: createdProjects[0]._id, assignee: users[7]._id, status: "in_progress", priority: "critical", estimatedHours: 12, dueDate: new Date("2026-07-16"), createdBy: sarah._id },
      { title: "Create notification system", description: "Deploy Socket.io server push notifications", project: createdProjects[0]._id, assignee: users[5]._id, status: "review", priority: "high", estimatedHours: 18, dueDate: new Date("2026-07-19"), createdBy: sarah._id },
    ];
    await Task.insertMany(tasksData);

    console.log("Seeding Calendar Events...");
    const eventsData = [
      { title: "Sprint Planning Session", description: "Define task backlog and timelines", type: "meeting", startDate: new Date("2026-07-12T10:00:00"), endDate: new Date("2026-07-12T11:30:00"), organizer: sarah._id, isPublic: true },
      { title: "Security Audit Review", description: "Discuss vulnerability scanner logs", type: "other", startDate: new Date("2026-07-13T14:00:00"), endDate: new Date("2026-07-13T15:00:00"), organizer: chinnaSuper._id, isPublic: false },
    ];
    await CalendarEvent.insertMany(eventsData);

    console.log("Seeding Chat Messages...");
    const messagesData = [
      { room: "general", sender: users[6]._id, content: "The new dashboard designs are in Figma. Please share feedback!", createdAt: new Date(Date.now() - 3600000) },
      { room: "general", sender: users[5]._id, content: "Thanks for the reminder. I'll have the API docs ready by then.", createdAt: new Date(Date.now() - 1800000) },
      { room: "general", sender: sarah._id, content: "Good morning team! Don't forget about the sprint planning at 10 AM.", createdAt: new Date(Date.now() - 600000) },
    ];
    await Message.insertMany(messagesData);

    console.log("Database Seeded Successfully! 🌱");
    mongoose.connection.close();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
