import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Tree, Farm } from '../types';
import { Leaf, MapPin, Truck } from 'lucide-react';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

interface MapViewProps {
  trees?: Tree[];
  farm?: Farm;
  deliveryLocation?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  onTreeClick?: (tree: Tree) => void;
  userTree?: Tree;
}

export const Directions: React.FC<{ origin: { lat: number; lng: number }; destination: { lat: number; lng: number } }> = ({ origin, destination }) => {
  const map = useMap();
  const [directionsService, setDirectionsService] = React.useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = React.useState<google.maps.DirectionsRenderer | null>(null);

  React.useEffect(() => {
    if (!map || !window.google) return;
    setDirectionsService(new google.maps.DirectionsService());
    setDirectionsRenderer(new google.maps.DirectionsRenderer({ map, suppressMarkers: true }));
  }, [map]);

  React.useEffect(() => {
    if (!directionsService || !directionsRenderer) return;

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        }
      }
    );

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer, origin, destination]);

  return null;
};

export const TreeMarker: React.FC<{ tree: Tree; isUserTree?: boolean; onClick?: () => void }> = ({ tree, isUserTree, onClick }) => {
  return (
    <AdvancedMarker
      position={tree.location}
      onClick={onClick}
      title={isUserTree ? "Your Tree" : `Tree ${tree.id}`}
    >
      <Pin
        background={isUserTree ? "#22c55e" : "#166534"}
        borderColor={isUserTree ? "#FFFFFF" : "#166534"}
        glyphColor="#FFFFFF"
      >
        <Leaf size={16} color="white" />
      </Pin>
    </AdvancedMarker>
  );
};

export const FarmBoundary: React.FC<{ farm: Farm }> = ({ farm }) => {
  const map = useMap();
  React.useEffect(() => {
    if (!map || !farm || !window.google || !farm.boundary) return;

    // Support both direct MultiPolygon and Polygon coordinates from GeoJSON
    let paths = [];
    if (farm.boundary.type === 'Polygon') {
      paths = farm.boundary.coordinates[0].map((coord: [number, number]) => ({
        lat: coord[1],
        lng: coord[0]
      }));
    } else if (farm.boundary.type === 'MultiPolygon') {
      paths = farm.boundary.coordinates.map((poly: any) => 
        poly[0].map((coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0]
        }))
      );
    } else {
      // Fallback for legacy format if any
      paths = farm.boundary.coordinates?.[0]?.map((coord: [number, number]) => ({
        lat: coord[1],
        lng: coord[0]
      })) || [];
    }

    const polygon = new google.maps.Polygon({
      paths: paths,
      strokeColor: "#166534",
      strokeOpacity: 0.9,
      strokeWeight: 3,
      fillColor: "#22c55e",
      fillOpacity: 0.15,
      clickable: true,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="padding: 8px; color: #1a4d2e;"><b>${farm.name}</b><br/>Sustainable Organic Farm</div>`,
      disableAutoPan: true
    });

    polygon.addListener('mouseover', (e: google.maps.PolyMouseEvent) => {
      polygon.setOptions({
        fillOpacity: 0.35,
        strokeWeight: 4,
        strokeColor: "#064e3b"
      });
      if (e.latLng) {
        infoWindow.setPosition(e.latLng);
        infoWindow.open(map);
      }
    });

    polygon.addListener('mouseout', () => {
      polygon.setOptions({
        fillOpacity: 0.15,
        strokeWeight: 3,
        strokeColor: "#166534"
      });
      infoWindow.close();
    });

    polygon.addListener('click', (e: google.maps.PolyMouseEvent) => {
      if (e.latLng) {
        map?.panTo(e.latLng);
        map?.setZoom(16);
      }
    });

    polygon.setMap(map);
    return () => {
      polygon.setMap(null);
      infoWindow.close();
    };
  }, [map, farm]);

  return null;
};

export const DeliveryMarker: React.FC<{ position: { lat: number; lng: number } }> = ({ position }) => {
  return (
    <AdvancedMarker position={position}>
      <div className="bg-blue-600 p-2 rounded-full shadow-lg border-2 border-white animate-bounce">
        <Truck size={20} color="white" />
      </div>
    </AdvancedMarker>
  );
};

const MapComponent: React.FC<MapViewProps> = ({ trees, farm, deliveryLocation, destination, onTreeClick, userTree }) => {
  if (!API_KEY) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-gray-100 rounded-xl p-6 text-center">
        <MapPin size={48} className="text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">Google Maps API Key Required</h3>
        <p className="text-sm text-gray-500 mt-2">Please add GOOGLE_MAPS_PLATFORM_KEY to secrets.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={farm?.location || { lat: 26.9124, lng: 75.7873 }} // Default to Jaipur area
          defaultZoom={15}
          mapId="TREEKART_MAP_ID"
          className="w-full h-full"
          gestureHandling="greedy"
          disableDefaultUI={true}
          style={{ height: '100%', width: '100%' }}
        >
          {farm && <FarmBoundary farm={farm} />}
          {trees?.map(tree => (
            <TreeMarker 
              key={tree.id} 
              tree={tree} 
              isUserTree={userTree?.id === tree.id}
              onClick={() => onTreeClick?.(tree)}
            />
          ))}
          {deliveryLocation && <DeliveryMarker position={deliveryLocation} />}
          {farm && destination && <Directions origin={farm.location} destination={destination} />}
        </Map>
      </APIProvider>
    </div>
  );
};

export default MapComponent;
