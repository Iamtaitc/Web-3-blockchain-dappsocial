const express = require("express");
const app = express();
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const initializeJwtSecrets  = require("./utils/initializeJwtSecrets");
const { swaggerUi, swaggerDocs } = require('./docs/swagger');
require("dotenv").config();

const connectDB = require("./configs/configs.mongoose");
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

initializeJwtSecrets();
// Doc API
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocs));
connectDB();
// Routes
app.use("", require("./routers"));

// console.log(listEndpoints(app));

// error handler
// app.use(notFoundHandler);
// app.use(errorHandler);

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
