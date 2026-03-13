import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom colored icons based on priority
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  urgent: createCustomIcon('red'),
  high: createCustomIcon('orange'),
  normal: createCustomIcon('blue'),
  low: createCustomIcon('grey'),
  default: createCustomIcon('blue')
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function ComplaintHeatmap({ complaints = [] }) {
  const [mapData, setMapData] = useState([]);
  
  // Default center: India
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  useEffect(() => {
    // Process complaints to ensure they have valid coordinates
    const processed = complaints.map((c, index) => {
      // If exact coordinates are missing, simulate nearby coordinates around the default center
      // This is for demonstration purposes as requested
      const hasValidCoords = c.latitude != null && c.longitude != null && !isNaN(c.latitude) && !isNaN(c.longitude);
      
      let lat = hasValidCoords ? parseFloat(c.latitude) : null;
      let lng = hasValidCoords ? parseFloat(c.longitude) : null;

      // Simulate coordinates if missing (spreading them around India)
      if (!hasValidCoords) {
        // Random spread: +/- 5 degrees from center
        const latOffset = (Math.random() - 0.5) * 10;
        const lngOffset = (Math.random() - 0.5) * 10;
        lat = defaultCenter[0] + latOffset;
        lng = defaultCenter[1] + lngOffset;
      }

      return {
        ...c,
        displayLat: lat,
        displayLng: lng,
        isSimulated: !hasValidCoords
      };
    });
    
    setMapData(processed.filter(c => c.displayLat !== null && c.displayLng !== null));
  }, [complaints]);

  return (
    <div className="premium-card overflow-hidden flex flex-col h-[400px]">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-white">
        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-error">
          <MapPin size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Complaint Hotspots</h2>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Geospatial Distribution</p>
        </div>
      </div>
      
      <div className="flex-1 relative bg-slate-50 z-0">
        <MapContainer 
          center={defaultCenter} 
          zoom={defaultZoom} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          scrollWheelZoom={false}
        >
          <ChangeView center={defaultCenter} zoom={defaultZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {mapData.map((complaint) => {
            const priorityLower = complaint.priority?.toLowerCase() || 'normal';
            // Also map categories to priority for older complaints without priority
            let iconType = icons.default;
            if (icons[priorityLower]) {
              iconType = icons[priorityLower];
            } else if (complaint.urgency) {
               const urgencyLower = complaint.urgency.toLowerCase();
               if (urgencyLower === 'high') iconType = icons.urgent;
               else if (urgencyLower === 'medium') iconType = icons.high;
               else iconType = icons.low;
            }

            return (
              <Marker 
                key={complaint.id || Math.random().toString()} 
                position={[complaint.displayLat, complaint.displayLng]}
                icon={iconType}
              >
                <Popup className="premium-popup rounded-xl">
                  <div className="p-1">
                    <p className="font-bold text-slate-800 text-sm mb-1">{complaint.title || 'Civic Issue'}</p>
                    <div className="flex flex-col gap-1 text-xs">
                       <span className="text-slate-600 font-medium">
                         <span className="text-slate-400 font-bold uppercase text-[9px] mr-1 border border-slate-200 px-1 rounded">Dept</span> 
                         {complaint.Department?.name || complaint.department || 'TBD'}
                       </span>
                       <span className="text-slate-600 font-medium">
                         <span className="text-slate-400 font-bold uppercase text-[9px] mr-1 border border-slate-200 px-1 rounded">Cat</span> 
                         {complaint.category || 'Other'}
                       </span>
                       <span className="text-slate-600 font-medium">
                         <span className="text-slate-400 font-bold uppercase text-[9px] mr-1 border border-slate-200 px-1 rounded">Loc</span> 
                         {complaint.location || (complaint.isSimulated ? 'Simulated Location' : 'Map Pin')}
                       </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-100 z-[1000] text-[10px] font-bold">
           <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm border border-red-200" />
                <span className="text-slate-600 uppercase tracking-wider">Urgent</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-400 shadow-sm border border-orange-200" />
                <span className="text-slate-600 uppercase tracking-wider">High</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm border border-blue-200" />
                <span className="text-slate-600 uppercase tracking-wider">Normal</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
