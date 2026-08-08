import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Truck } from 'lucide-react';
import L from 'leaflet';

const hostIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to center map reactively when search coords update
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Click listener for host to click-and-emit simulated location coordinates
function MapSimulationEmitter({ onSimulateClick }) {
  useMapEvents({
    click(e) {
      onSimulateClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function DeliverySimulator({
  isSimulating,
  simulatedCoords,
  handleSimulateMovement
}) {
  return (
    <div className="lg:col-span-2 flex flex-col h-[280px] lg:h-auto min-h-[250px] relative">
      {isSimulating ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-accent" />
              Delivery Location Simulator (Click on map to move vehicle)
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-accent text-white font-bold rounded animate-pulse">
              Simulator Streaming
            </span>
          </div>
          <div className="flex-1 w-full rounded-xl overflow-hidden border border-accent/20 shadow-md">
            <MapContainer center={simulatedCoords} zoom={14} className="w-full h-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ChangeView center={simulatedCoords} />
              <MapSimulationEmitter onSimulateClick={handleSimulateMovement} />
              
              {/* User Delivery Vehicle Pin */}
              <Marker position={simulatedCoords} icon={hostIcon}>
                <Popup>
                  <div className="text-xs font-bold">Simulated Vehicle Pin</div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </>
      ) : (
        <div className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-center p-6">
          <div className="space-y-2 max-w-sm">
            <Truck className="h-10 w-10 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-500">Coordinate Simulator Map</p>
            <p className="text-[10px] text-gray-400">
              Verify a requested handover to activate the delivery console. Click on the map to stream real-time telemetry coordinates to the renter.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
