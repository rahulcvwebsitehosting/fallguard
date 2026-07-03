"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPanelProps {
  location: { lat: number; lng: number; address: string } | null;
  label: string;
}

export default function MapPanel({ location, label }: MapPanelProps) {
  const pos: [number, number] = location ? [location.lat, location.lng] : [13.0827, 80.2707];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] w-full rounded-b-lg overflow-hidden">
          <MapContainer
            center={pos}
            zoom={15}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={pos} icon={icon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-medium">{location?.address || "Home Location"}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block"
                  >
                    <Button variant="outline" size="sm" type="button">
                      Get Directions
                    </Button>
                  </a>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}