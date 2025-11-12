const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Captcha Earning Platform API",
      version: "1.0.0",
      description: "API documentation for Captcha Earning Web App",
    },
  servers: [
  {
    url: "https://captcha-backend-a2fh.onrender.com",
    description: "Production Server (Render)",
  },
  {
    url: "http://localhost:5000",
    description: "Local Development Server",
  },
],

  },
  apis: ["./routes/*.js"], // 👈 path to your route files (adjust if needed)
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec, swaggerUi };
