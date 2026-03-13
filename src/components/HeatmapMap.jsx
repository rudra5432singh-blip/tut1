import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapLayer from './HeatmapLayer';
import ComplaintMarker from './ComplaintMarker';

export default function HeatmapMap({ complaints }) {
  // Default center to a sample city (e.g., Bengaluru)
  const center = [12.9716, 77.5946];

  // Convert complaints to heatmap points [lat, lng, intensity]
  const heatPoints = complaints.map(c => [c.latitude, c.longitude, 1]);

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative z-0">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer points={heatPoints} />
        {complaints.map(c => (
          <ComplaintMarker key={c.id} complaint={c} />
        ))}
      </MapContainer>
    </div>
  );
}
