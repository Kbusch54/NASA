const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const mongoose = require("mongoose");
const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

const PORT = process.env.PORT || 8000;
// const PASSWORD = PROCESS.ENV.PASSWORD;
const MONGO_URL = process.env.MONGO_URL;

const server = http.createServer(app);

mongoose.connection.once("open", () => {
  console.log("MangoDb connection ready!");
});
mongoose.connection.on("error", (err) => {
  console.error(err);
});

const startServer = async () => {
  await mongoose.connect(MONGO_URL);
  await loadPlanetsData();
  await loadLaunchData();
};

server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}....`);
});
//
startServer();
