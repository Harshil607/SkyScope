import { useEffect } from "react";
import Globe from "./components/Globe";
import { useAircraftStore } from "./store/aircraftStore";

function App() {
  const getAircraft = useAircraftStore((state) => state.getAircraft);

  useEffect(() => {
    getAircraft();

    const interval = setInterval(() => {
      getAircraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [getAircraft]);

  return <Globe />;
}

export default App;
