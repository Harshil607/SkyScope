import dotenv from "dotenv";

dotenv.config();

let cache = [];
let lastCacheUpdate = null;
let inFlightPromise = null;
let cachedAccessToken = null;
let tokenExpiresAt = 0;
let intervalID = null;

const refreshInterval = Number(process.env.AIRCRAFT_REFRESH_INTERVAL);

const REFRESH_INTERVAL =
  Number.isFinite(refreshInterval) && refreshInterval > 0
    ? refreshInterval
    : 30000;

const getAccessToken = async () => {
  try {
    if (cachedAccessToken && Date.now() < tokenExpiresAt) {
      return cachedAccessToken;
    }

    const res = await fetch(
      "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: "client_credentials",
        }),
      },
    );

    if (!res.ok) {
      throw new Error("Authentication failed");
    }

    const data = await res.json();

    cachedAccessToken = data.access_token;

    tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return cachedAccessToken;
  } catch (error) {
    console.error("Failed to Authenticate...", error.message);
    throw new Error("Failed to authenticate with OpenSky");
  }
};

const getAircraftStates = async () => {
  try {
    const access_token = await getAccessToken();
    const res = await fetch("https://opensky-network.org/api/states/all", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!res.ok) {
      throw new Error("Aircraft data request failed");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch aircraft data...");
    throw new Error("Failed to retrieve aircraft data from OpenSky");
  }
};

const makeObjAircraft = (aircraft) => {
  const aircraftObject = {
    icao24: aircraft[0],
    callsign: aircraft[1]?.trim() || null,
    originCountry: aircraft[2],
    longitude: aircraft[5],
    latitude: aircraft[6],
    baroAltitude: aircraft[7],
    onGround: aircraft[8],
    velocity: aircraft[9],
    heading: aircraft[10],
    verticalSpeed: aircraft[11],
  };
  return aircraftObject;
};

const formatAircraft = async () => {
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      const { states } = await getAircraftStates();

      if (!states) {
        return { success: false, data: cache };
      }

      const aircraft_obj = states.map((a) => makeObjAircraft(a));

      const validAircraft = aircraft_obj.filter(
        (a) => a.longitude != null && a.latitude != null,
      );

      cache = validAircraft;
      lastCacheUpdate = Date.now();

      return { success: true, data: cache };
    } catch (error) {
      console.error(error.message);
      return { success: false, data: cache };
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
};

export const startAircraftPolling = async () => {
  if (intervalID !== null) {
    return;
  }

  const result = await formatAircraft();

  if (result.success) {
    console.log("Initial aircraft data fetched successfully");
  } else {
    console.error("Initial aircraft fetch failed");
    console.log("Will retry on the next refresh interval");
  }

  intervalID = setInterval(formatAircraft, REFRESH_INTERVAL);
};

export const retrieveCache = () => {
  return { cache, lastCacheUpdate };
};
