'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, ZoomIn, ZoomOut, Move, Target, 
  Ruler, Hexagon, Crosshair, 
  Trash2, Square, PenTool, MapPin 
} from 'lucide-react';
import * as turf from '@turf/turf';

interface AdvancedMapEditorProps {
  onBoundsChange?: (geojson: any) => void;
  initialCenter?: [number, number];
  initialGeoJSON?: any;
}

export default function AdvancedMapEditor({ onBoundsChange, initialCenter = [11.51, 3.86], initialGeoJSON }: AdvancedMapEditorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const { isDarkMode } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [measurement, setMeasurement] = useState<{type: string, value: string} | null>(null);

  const TOKEN = "pk.eyJ1Ijoid2FzMjlrZW0wMSIsImEiOiJjbXVncHdwZjkwb3p4MnpzZWZkeGd6d214In0.bSxWbFb9NqUQ5Gve5xT67g";

  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/satellite-streets-v12',
      center: initialCenter,
      zoom: 12
    });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: false,
        trash: false
      }
    });

    map.current.addControl(draw.current);

    map.current.on('load', () => {
      map.current?.resize();
      
      // If we have an existing boundary geometry, load it and zoom the map to it!
      if (initialGeoJSON && draw.current && map.current) {
        draw.current.add(initialGeoJSON);
        
        // Calculate the bounding box of the geometry so we can fit the map to it
        try {
          const bbox = turf.bbox(initialGeoJSON);
          map.current.fitBounds(bbox as mapboxgl.LngLatBoundsLike, { padding: 40, animate: false });
        } catch(e) { console.error("Could not fit bounds", e); }
      }
    });

    const updateData = (e: any) => {
      if (!draw.current) return;
      const data = draw.current.getAll();
      if (onBoundsChange) onBoundsChange(data);
      
      if (data.features.length > 0) {
        const lastFeature = data.features[data.features.length - 1];
        if (lastFeature.geometry.type === 'Polygon') {
          const areaSqMeters = turf.area(lastFeature);
          const areaSqKm = (areaSqMeters / 1000000).toFixed(2);
          setMeasurement({ type: 'Area', value: `${areaSqKm} km²` });
        } else if (lastFeature.geometry.type === 'LineString') {
          const lengthKm = turf.length(lastFeature, { units: 'kilometers' }).toFixed(2);
          setMeasurement({ type: 'Distance', value: `${lengthKm} km` });
        }
      } else {
        setMeasurement(null);
      }
    };

    map.current.on('draw.create', updateData);
    map.current.on('draw.delete', updateData);
    map.current.on('draw.update', updateData);

    return () => {
      map.current?.remove();
    };
  }, [isDarkMode]);

  const executeSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${TOKEN}&limit=5`);
      const data = await res.json();
      setSearchResults(data.features || []);
    } catch(err) {
      console.error(err);
    }
    setIsSearching(false);
  };

  const goToLocation = (coords: [number, number]) => {
    map.current?.flyTo({ center: coords, zoom: 14 });
    setSearchResults([]);
    setSearchQuery('');
  };

  const setDrawMode = (mode: string) => {
    if (mode === 'trash') {
      draw.current?.trash();
      // fake an event update
      const data = draw.current?.getAll();
      if (data && data.features.length === 0) setMeasurement(null);
      if (onBoundsChange && data) onBoundsChange(data);
      return;
    }
    draw.current?.changeMode(mode as any);
    setActiveTool(mode);
  };

  const zoom = (direction: 'in' | 'out') => {
    direction === 'in' ? map.current?.zoomIn() : map.current?.zoomOut();
  };
  
  const resetView = () => {
    map.current?.flyTo({ center: initialCenter, zoom: 12 });
  };

  return (
    <div className="flex h-[600px] w-full rounded-2xl overflow-hidden border border-theme card-theme shadow-xl relative z-0">
      
      {/* Sidebar Tools */}
      <div className="w-64 bg-theme-secondary border-r border-theme flex flex-col overflow-y-auto p-5 z-10">
        <h2 className="font-fraunces font-bold text-lg text-theme mb-6">Map Tools</h2>
        
        {/* Navigation */}
        <div className="mb-8">
          <h3 className="text-[10px] font-bold font-mono text-theme-muted uppercase mb-3 tracking-wider">Scale & Navigation</h3>
          <div className="grid grid-cols-4 gap-2">
            <button type="button" onClick={() => zoom('in')} className="p-2 card-theme border border-theme rounded-lg flex flex-col items-center gap-1 hover:bg-theme-secondary text-theme group transition-colors">
              <ZoomIn size={16} className="text-theme-muted group-hover:text-theme" />
            </button>
            <button type="button" onClick={() => zoom('out')} className="p-2 card-theme border border-theme rounded-lg flex flex-col items-center gap-1 hover:bg-theme-secondary text-theme group transition-colors">
              <ZoomOut size={16} className="text-theme-muted group-hover:text-theme" />
            </button>
            <button type="button" className="p-2 card-theme border border-theme rounded-lg flex flex-col items-center gap-1 hover:bg-theme-secondary text-theme group transition-colors">
              <Move size={16} className="text-theme-muted group-hover:text-theme" />
            </button>
            <button type="button" onClick={resetView} className="p-2 card-theme border border-theme rounded-lg flex flex-col items-center gap-1 hover:bg-theme-secondary text-theme group transition-colors">
              <Target size={16} className="text-theme-muted group-hover:text-theme" />
            </button>
          </div>
        </div>

        {/* Boundary Drawing */}
        <div className="mb-8">
          <h3 className="text-[10px] font-bold font-mono text-theme-muted uppercase mb-3 tracking-wider">Boundary Drawing</h3>
          <div className="grid grid-cols-4 gap-2">
            <button type="button" onClick={() => setDrawMode('draw_polygon')} className={`p-2 card-theme border ${activeTool === 'draw_polygon' ? 'border-[#4E8B5C] bg-[#4E8B5C]/10' : 'border-theme'} rounded-lg flex flex-col items-center gap-1 hover:bg-theme-secondary text-theme group transition-colors`} title="Polygon">
              <Hexagon size={16} className={`${activeTool === 'draw_polygon' ? 'text-[#4E8B5C]' : 'text-theme-muted'} group-hover:text-theme`} />
            </button>
            <button type="button" onClick={() => setDrawMode('draw_line_string')} className={`p-2 card-theme border ${activeTool === 'draw_line_string' ? 'border-[#4E8B5C] bg-[#4E8B5C]/10' : 'border-theme'} rounded-lg flex flex-col items-center gap-1 hover:bg-theme-secondary text-theme group transition-colors`} title="Line">
              <PenTool size={16} className={`${activeTool === 'draw_line_string' ? 'text-[#4E8B5C]' : 'text-theme-muted'} group-hover:text-theme`} />
            </button>
            <button type="button" onClick={() => setDrawMode('draw_polygon')} className={`p-2 card-theme border border-theme rounded-lg flex flex-col items-center gap-1 hover:bg-theme-secondary text-theme group transition-colors`} title="Rectangle (Draw Polygon)">
              <Square size={16} className="text-theme-muted group-hover:text-theme" />
            </button>
            <button type="button" onClick={() => setDrawMode('trash')} className="p-2 card-theme border border-theme rounded-lg flex flex-col items-center gap-1 hover:bg-[#B7503A]/10 text-theme group transition-colors" title="Delete Selected">
              <Trash2 size={16} className="text-theme-muted group-hover:text-[#B7503A]" />
            </button>
          </div>
        </div>
        
        {/* Measurement Display */}
        {measurement && (
          <div className="mt-auto p-4 card-theme border border-theme rounded-xl text-center shadow-sm">
            <p className="text-[10px] font-bold text-theme-muted uppercase tracking-wider font-mono">{measurement.type}</p>
            <p className="text-2xl font-bold text-theme font-fraunces text-[#4E8B5C] mt-1">{measurement.value}</p>
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-theme">
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} className="absolute inset-0 z-0" />
        
        {/* Search Bar Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-center pointer-events-none">
          <div className="w-full max-w-xl pointer-events-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search location, address or coordinates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    executeSearch();
                  }
                }}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/95 backdrop-blur-md border border-white/20 shadow-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C4693C] font-space"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                {searchResults.map(res => (
                  <button type="button" 
                    key={res.id}
                    onClick={() => goToLocation(res.center)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-sm text-gray-700 font-space flex items-start gap-3 transition-colors"
                  >
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{res.place_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
