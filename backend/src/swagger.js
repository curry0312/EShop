import swaggerAutogen from "swagger-autogen";

const doc = {
    "swagger": "2.0",
    "info": {
      "version": "1.0.0", 
      "title": "ESHOP API",
      "description": "My ESHOP API",
      "license": {
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
      }
    },
    "host": "localhost:8080", 
    "basePath": "/api",
    "schemes": ["http"],
    "consumes": ["application/json"],
    "produces": ["application/json"],
    "paths":{}
  }


const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.route.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);