# Mapbox Implementation — Summary

## 0. Get Tokens (Mapbox account)
- Sign up at https://account.mapbox.com
- **Public token** (`pk.`) → used in both apps for rendering maps
- **Secret token** (`sk.`) → used only to download the Android SDK (needs `DOWNLOADS:READ` scope)

---

## Android (Kotlin + Jetpack Compose)

**1. Secret token for SDK download**
`~/.gradle/gradle.properties` (not committed):
```properties
MAPBOX_DOWNLOADS_TOKEN=sk.your_secret_token_here
```

**2. Repository config** — `settings.gradle.kts`:
```kotlin
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://api.mapbox.com/downloads/v2/releases/maven")
            authentication { create<BasicAuthentication>("basic") }
            credentials {
                username = "mapbox"
                password = providers.gradleProperty("MAPBOX_DOWNLOADS_TOKEN").get()
            }
        }
    }
}
```

**3. Dependencies** — `app/build.gradle.kts`:
```kotlin
dependencies {
    implementation("com.mapbox.maps:android:11.x.x")
    implementation("com.mapbox.extension:maps-compose:11.x.x")
}
```

**4. Public token** — `res/values/strings.xml`:
```xml
<string name="mapbox_access_token" translatable="false">pk.your_public_token_here</string>
```
(Best practice: load from `local.properties` + `manifestPlaceholders`, same pattern used for `MAPS_API_KEY`.)

**5. Compose usage**
```kotlin
MapboxMap(
    Modifier.fillMaxSize(),
    mapViewportState = rememberMapViewportState {
        setCameraOptions {
            zoom(12.0)
            center(Point.fromLngLat(yourLng, yourLat))
        }
    }
) { /* markers, annotations */ }
```

**6. Cleanup**
- Remove `com.google.android.gms:play-services-maps`
- Remove Google Maps manifest placeholder / imports

---

## Web (Next.js + TypeScript + Tailwind)

**1. Install**
```bash
npm install mapbox-gl
npm install --save-dev @types/mapbox-gl
```

**2. Public token** — `.env.local`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_public_token_here
```

**3. Import CSS** — root layout (`app/layout.tsx`):
```tsx
import 'mapbox-gl/dist/mapbox-gl.css';
```

**4. Map component** — `components/Map.tsx`:
```tsx
'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [11.5021, 3.8480], // Yaoundé
      zoom: 12,
    });
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapContainer} className="w-full h-full min-h-[400px] rounded-lg" />;
}
```

**5. Use in a page**
```tsx
import Map from '@/components/Map';

export default function MapPage() {
  return (
    <div className="w-full h-screen">
      <Map />
    </div>
  );
}
```

**6. Add a marker (optional)**
```tsx
new mapboxgl.Marker().setLngLat([11.5021, 3.8480]).addTo(mapRef.current!);
```

**Notes**
- Container div needs an explicit height (`h-screen` / `min-h-[...]`) or the map won't render.
- For complex maps (clustering, many markers, declarative style), consider `react-map-gl` as a wrapper over `mapbox-gl`.
