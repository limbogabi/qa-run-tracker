const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "QA Run Tracker API",
      version: "1.0.0",
      description: "API documentation for QA Run Tracker"
    }
  },
  apis: ["./src/server.js"], // <–– Swagger reads comments here
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
