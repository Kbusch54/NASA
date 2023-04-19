const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");
// const launches = new Map();

const DEAFUALT_FLIGHT_NUM = 100;

const SPACEX_API_URL = "http://api.spacexdata.com/v4/launches/query";

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEAFUALT_FLIGHT_NUM;
  }
  return latestLaunch.flightNumber;
}
// launches.set(launch.flightNumber, launch);
async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values());
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launchesDatabase.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}
async function exsistsLaunchWithId(launchId) {
  return await findLaunch(launchId);
}
async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function addNewLaunch(launch) {
  const planet = await planets.findOneAndUpdate({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planet found");
  }
  const flightNum = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["ZeroToMastery", "NASA"],
    flightNumber: flightNum,
  });
  await saveLaunch(newLaunch);
}
async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
}
async function populateDatabase() {
  console.log("Downloading launch data....");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response !== 200) {
    console.log("Problem downloading data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch);
  }
}
async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumbeer: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch was already loaded");
  } else {
    populateDatabase();
  }
}

module.exports = {
  exsistsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
  loadLaunchData,
};
