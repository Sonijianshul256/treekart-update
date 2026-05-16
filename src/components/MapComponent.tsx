import React, { useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Tree } from '../types';
import { Leaf, MapPin, Truck } from 'lucide-react';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

interface MapViewProps {
  trees: Tree[];
  farm?: any;
  deliveryLocation?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  onTreeClick?: (tree: Tree) => void;
  userTree?: Tree;
}

export const Directions: React.FC<{ origin: { lat: number; lng: number }; destination: { lat: number; lng: number } }> = ({ origin, destination }) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = React.useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = React.useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!routesLib || !map) return;
    setDirectionsService(new routesLib.DirectionsService());
    setDirectionsRenderer(new routesLib.DirectionsRenderer({ map, suppressMarkers: true }));
  }, [routesLib, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination) return;

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        }
      }
    );
  }, [directionsService, directionsRenderer, origin, destination]);

  return null;
};

export const DeliveryMarker: React.FC<{ position: { lat: number; lng: number } }> = ({ position }) => {
  return (
    <AdvancedMarker position={position}>
      <div className="p-3 bg-harvest-gold rounded-2xl shadow-xl border-4 border-white animate-bounce">
        <Truck size={24} className="text-treekart-green" />
      </div>
    </AdvancedMarker>
  );
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
      {isUserTree && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-treekart-green text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap">
          Your Tree
        </div>
      )}
    </AdvancedMarker>
  );
};

const MapComponent: React.FC<MapViewProps> = ({ trees, farm, deliveryLocation, destination, onTreeClick, userTree }) => {
  if (!API_KEY) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-gray-100 rounded-xl p-6 text-center">
        <MapPin size={48} className="text-gray-300 mb-4" />
        <h3 className="text-gray-500 font-bold mb-2">Google Maps API Key Required</h3>
        <p className="text-xs text-gray-400">Please provide a valid GOOGLE_MAPS_PLATFORM_KEY in your settings.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={farm?.location || { lat: 25.1481, lng: 73.5873 }}
          defaultZoom={17}
          mapId="TREKART_MAP_01"
          gestureHandling="greedy"
          disableDefaultUI
        >
          {trees.map(tree => (
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
