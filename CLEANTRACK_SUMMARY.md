# CleanTrack - Project Progress & Architecture Summary

## 1. Project Overview & Architecture
The CleanTrack platform is a tripartite architecture designed to bridge real-time waste reporting from citizens to field logistics:

- **Web Dashboard (Frontend)**: Next.js 14 (App Router) + Tailwind CSS + Lucide Icons.
- **Mobile Application**: Native Android (Kotlin + Jetpack Compose) for Field Agents (Offline-First via Room Database + WorkManager).
- **Backend API**: Node.js + Express.js + Prisma ORM (PostgreSQL database).
- **Mapping Engine**: Mapbox GL JS (with Turf.js for geospatial measurements).

### Port Mappings
- Next.js Web Dashboard: `3000`
- Express API Backend: `5000`
- PostgreSQL Database: `5432`

## 2. Completed Milestones

### System Design
- ✅ **Class Diagram**: Finalized the Prisma schema entities (Users, Roles, Branches, Trucks, Reports, Shifts, Tracking, Promotions).
- ✅ **Design Language**: Implemented a dual-theme UI (Dark Mode: `#09090B` and `#1A1A1A` cards with `#B2FF3B` neon accents; Light Mode: `#FAF7F2` beige with `#173321` deep green). 
- ✅ **Role-Based Access (Context)**: Created `AuthContext` to simulate JWT role segregation (`SUPER_ADMIN`, `STATION_ADMIN`, `STATION_MANAGER`, `FIELD_AGENT`, `CITIZEN`).

### Web UI & Dashboards
- ✅ **Login Flow**: Polished standard and biometric login interfaces.
- ✅ **Super Admin Dashboards**: Complete CRUD UI for "Manage Branches" and "Manage Admins". Added "Promotions Record" and overview analytics.
- ✅ **Station Admin Dashboards**: Complete UI for "Branch Overview", "Assign Reports" (Map-based routing), "Live Tracking" (Truck Fleet), and "History".
- ✅ **Theme Context**: Fully reactive dark/light mode toggle that updates the DOM and Mapbox canvas layers dynamically.

### Advanced GIS Mapbox Integration
We successfully implemented a complex, interactive mapping suite (matching the Figma/mockup requirements) into the **Initialize Branch** and **Edit Branch** workflows:
- ✅ **Dynamic Theme Swapping**: Maps dynamically switch between `outdoors-v12` (light) and `dark-v11` (dark).
- ✅ **Custom UI Sidebar**: Integrated a "Map Tools" floating sidebar.
- ✅ **Freeform Boundary Drawing**: Replaced static rectangle bounds with `@mapbox/mapbox-gl-draw`. Admins can use the Polygon and Line tools to draw highly specific, multi-node operational zones on the map.
- ✅ **Real-Time Analytics**: Integrated `@turf/turf` to instantly calculate and display the real-world Area (in km²) and Distance (in km) of drawn geometries.
- ✅ **Mapbox Geocoder**: Built a custom Search Bar overlaid on the map that fetches coordinates directly from `api.mapbox.com/geocoding/v5` and smoothly flies the camera to the destination.

## 3. Current Dependencies
Installed in `admin-dashboard`:
- `next`, `react`, `react-dom`
- `tailwindcss`, `lucide-react`
- `mapbox-gl` (Base Maps)
- `@mapbox/mapbox-gl-draw` (Polygon drawing suite)
- `@turf/turf` (Geospatial measurements)

## 4. Next Steps & Pending Implementation

1. **Backend & Database Setup**
   - Initialize the Node.js/Express backend at `backend/`.
   - Write the `schema.prisma` file reflecting the finalized class diagram.
   - Wire up the Next.js frontend to fetch live data from `localhost:5000` instead of using the mocked React states.

2. **Kotlin Android App (Priority for Testing Phase 1)**
   - Initialize the `cleantrack-mobile` Kotlin Jetpack Compose project.
   - Implement the Mapbox Android SDK.
   - Build the "Field Agent" route interface (Map showing assigned reports) and the "Citizen" report submission interface.
   - Connect the app to the Express backend.

---

> **Note to self/future instances**: The Next.js frontend UI (including complex mapping logic) is practically 100% complete. Do not alter `AdvancedMapEditor.tsx` or the CSS themes unless specifically requested. Start directly on the Android initialization or backend setup.
