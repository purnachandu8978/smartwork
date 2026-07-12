const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SmartWork Hub API",
      version: "1.0.0",
      description:
        "Enterprise MERN SaaS Platform REST API — Full Stack Developer Showcase Project",
      contact: {
        name: "SmartWork Hub",
        url: process.env.CLIENT_URL || "http://localhost:5173",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
        description: "Development Server",
      },
      {
        url: `${process.env.API_URL}/api/v1`,
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/routes/v1/*.js", "./src/models/*.js"],
};

module.exports = swaggerJsdoc(options);
