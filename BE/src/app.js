const express = require("express");
const app = express();
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { notFoundHandler, errorHandler } = require("./middleware/errors.middleware");
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./docs/swagger');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
// Doc API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// Routes
app.use("", require("./routers"));
// client check kết nối với server

// error handler
app.use(notFoundHandler);
app.use(errorHandler);

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500);
  console.log(error.message);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
