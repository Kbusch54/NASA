const API_URL = "http://localhost:8000/v1";

async function httpGetPlanets() {
  // Load planets and return as JSON.
  const res = await fetch(`${API_URL}/planets`);
  return res.json();
}

async function httpGetLaunches() {
  // Load launches, sort by flight number, and return as JSON.
  const res = await fetch(`${API_URL}/launches`);
  const fetchedLaunches = await res.json();
  return fetchedLaunches.sort((a, b) => {
    return a.flightNumber - b.flightNumber;
  });
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  try {
    console.log("Trying to launch");
    console.log(launch);
    return await fetch(`${API_URL}/launches`, {
      method: "POST",
      body: JSON.stringify(launch),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return {
      ok: false,
    };
  }
}

async function httpAbortLaunch(id) {
  // TODO: Once API is ready.
  // Delete launch with given ID.
  try {
    console.log("Aborting launch");
    console.log(id);
    const yep = await fetch(`${API_URL}/launches/${id}`, {
      method: "delete",
    });
    return yep;
  } catch (error) {
    return {
      ok: false,
    };
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
