import dotenv from "dotenv";

dotenv.config();

const getAccessToken = async () => {
  try {
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
    return data;
  } catch (error) {
    console.error("Failed to Authenticate...");
    throw new Error("Failed to authenticate with OpenSky");
  }
};

const getAircraftStates = async () => {
  try {
    const { access_token } = await getAccessToken();
    const res = await fetch("https://opensky-network.org/api/states/all", {
      headers: {
        "Content-Type": "text/plain",
        "Client-ID": process.env.CLIENT_ID,
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

const formatAircraft = async (aircraft) => {
  const aircraftObject = {
    icao24: aircraft[0],
    callsign: aircraft[1],
    origin: aircraft[2],
    longitude: aircraft[5],
    latitude: aircraft[6],
    altitude: aircraft[7],
    onground: aircraft[8],
    velocity: aircraft[9],
    true_track: aircraft[10],
    vs: aircraft[11],
  };
};
