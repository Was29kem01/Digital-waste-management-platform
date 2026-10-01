'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

// Use the placeholder if the environment variable is not yet set
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.your_public_token_here';

interface MapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function Map({ center = [11.5021, 3.8480], zoom = 12, className = 'w-full h-full min-h-[400px] rounded-lg' }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });
    
    new mapboxgl.Marker({ color: '#C4693C' })
      .setLngLat(center)
      .addTo(mapRef.current);
    
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [center, zoom]);

  return <div ref={mapContainer} className={className} />;
}
