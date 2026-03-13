import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';

// Fix for default marker icon issues in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function ComplaintMarker({ complaint }) {
  return (
    <Marker position={[complaint.latitude, complaint.longitude]} icon={DefaultIcon}>
      <Popup>
        <div className="p-1">
          <p className="text-[10px] font-black text-primary uppercase tracking-tighter mb-1">#{complaint.id}</p>
          <h4 className="text-xs font-bold text-slate-800 mb-1">{complaint.title}</h4>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] text-slate-400 font-bold uppercase">{complaint.category}</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
              complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' :
              complaint.status === 'Pending' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {complaint.status}
            </span>
          </div>
          <Link 
            to={`/complaint/${complaint.id}`}
            className="block w-full text-center py-2 bg-primary text-white text-[10px] font-bold rounded-lg no-underline hover:bg-primary-light transition-colors"
          >
            View Details
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}
