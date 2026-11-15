import { useState, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAircraftStore } from "../store/aircraftStore";
import { latLonToVector } from "../utils/coordinates";
import "../Globe.css";

function CameraTracker({ aircraft, isTracking, controlsRef }) {
  const { camera } = useThree();

  useFrame(() => {
    if (!isTracking || !aircraft || !controlsRef.current) return;

    const altitudeOffset = Math.max(aircraft.baroAltitude ?? 0, 0) * 0.00001;

    const radius = 2.025 + altitudeOffset;

    const position = latLonToVector(
      aircraft.latitude,
      aircraft.longitude,
      radius,
    );

    const target = new THREE.Vector3(...position);
    const up = target.clone().normalize();

    // Keep the camera just above the aircraft.
    const cameraPosition = target.clone().addScaledVector(up, 1.4);

    controlsRef.current.target.lerp(target, 0.08);
    camera.position.lerp(cameraPosition, 0.08);
    controlsRef.current.update();
  });

  return null;
}

function Aircraft({
  latitude,
  longitude,
  altitude,
  heading,
  aircraft,
  onSelect,
  isSelected,
}) {
  const { scene } = useGLTF("/aircraft.glb");

  const model = useMemo(() => {
    const clonedScene = scene.clone(true);

    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((material) => material.clone());
        } else {
          child.material = child.material.clone();
        }

        if (isSelected) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

          materials.forEach((material) => {
            if (material.color) {
              material.color.set("#38bdf8");
            }

            if (material.emissive) {
              material.emissive.set("#38bdf8");
              material.emissiveIntensity = 1.5;
            }
          });
        }
      }
    });

    return clonedScene;
  }, [scene, isSelected]);

  const altitudeOffset = Math.max(altitude ?? 0, 0) * 0.00001;
  const radius = 2.025 + altitudeOffset;
  const position = latLonToVector(latitude, longitude, radius);

  const up = new THREE.Vector3(...position).normalize();

  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  const angle = THREE.MathUtils.degToRad(heading ?? 0);

  const north = new THREE.Vector3(
    -Math.sin(lat) * Math.cos(lon),
    Math.cos(lat),
    Math.sin(lat) * Math.sin(lon),
  );

  const east = new THREE.Vector3(-Math.sin(lon), 0, -Math.cos(lon));

  const forward = north
    .clone()
    .multiplyScalar(Math.cos(angle))
    .add(east.clone().multiplyScalar(Math.sin(angle)))
    .normalize();

  const right = up.clone().cross(forward).normalize();

  const rotationMatrix = new THREE.Matrix4().makeBasis(right, up, forward);

  const orientation = new THREE.Quaternion().setFromRotationMatrix(
    rotationMatrix,
  );

  return (
    <group
      position={position}
      quaternion={orientation}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(aircraft);
      }}>
      <primitive object={model} scale={0.002} />
    </group>
  );
}

function AircraftMarkers({ onSelect, selectedAircraft }) {
  const aircrafts = useAircraftStore((state) => state.aircrafts);

  return (
    <>
      {aircrafts
        .filter((_, index) => index % 10 === 0)
        .slice(0, 100)
        .map((aircraft) => (
          <Aircraft
            key={aircraft.icao24}
            latitude={aircraft.latitude}
            longitude={aircraft.longitude}
            altitude={aircraft.baroAltitude}
            heading={aircraft.heading}
            aircraft={aircraft}
            onSelect={onSelect}
            isSelected={selectedAircraft?.icao24 === aircraft.icao24}
          />
        ))}
    </>
  );
}

function Atmosphere() {
  return (
    <mesh scale={1.04}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshBasicMaterial
        color="#3a9fff"
        transparent
        opacity={0.18}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function Earth() {
  const texture = useTexture("/earth.jpg");

  return (
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial map={texture} color="#1677bb" />
    </mesh>
  );
}

export default function Globe() {
  const [selectedId, setSelectedId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const controlsRef = useRef();

  const aircrafts = useAircraftStore((state) => state.aircrafts);

  // Always use the latest version of the selected aircraft.
  const selectedAircraft =
    aircrafts.find((aircraft) => aircraft.icao24 === selectedId) ?? null;

  const handleSelect = (aircraft) => {
    setSelectedId(aircraft.icao24);
    setIsTracking(false);
  };

  const closePanel = () => {
    setSelectedId(null);
    setIsTracking(false);
  };

  return (
    <div className="globe-container">
      <Canvas camera={{ position: [0, 0, 4.5] }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 3, 5]} intensity={2} />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
        />

        <CameraTracker
          aircraft={selectedAircraft}
          isTracking={isTracking}
          controlsRef={controlsRef}
        />

        <color attach="background" args={["#020617"]} />

        <Stars radius={100} depth={50} count={5000} factor={4} />

        <Earth />

        <AircraftMarkers
          onSelect={handleSelect}
          selectedAircraft={selectedAircraft}
        />

        <Atmosphere />
      </Canvas>

      {selectedAircraft && (
        <div className="aircraft-info">
          <button className="close-button" onClick={closePanel}>
            ×
          </button>

          <h2>{selectedAircraft.callsign || "Unknown Aircraft"}</h2>

          <p>
            <span>ICAO24</span>
            {selectedAircraft.icao24}
          </p>

          <p>
            <span>Country</span>
            {selectedAircraft.originCountry || "Unknown"}
          </p>

          <p>
            <span>Altitude</span>
            {selectedAircraft.baroAltitude != null
              ? `${selectedAircraft.baroAltitude.toFixed(0)} m`
              : "Unavailable"}
          </p>

          <p>
            <span>Speed</span>
            {selectedAircraft.velocity != null
              ? `${(selectedAircraft.velocity * 3.6).toFixed(1)} km/h`
              : "Unavailable"}
          </p>

          <p>
            <span>Heading</span>
            {selectedAircraft.heading != null
              ? `${selectedAircraft.heading.toFixed(1)}°`
              : "Unavailable"}
          </p>

          <button
            className="track-button"
            onClick={() => setIsTracking((previous) => !previous)}>
            {isTracking ? "Stop Tracking" : "Track Aircraft"}
          </button>
        </div>
      )}
    </div>
  );
}
