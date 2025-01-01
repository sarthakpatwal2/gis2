import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useMap } from "react-leaflet";
import L from "leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Set default icon paths for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

function GeoTiffLayer({ file }) {
  const map = useMap();

  useEffect(() => {
    if (!file) return;

    const loadGeoTiff = async () => {
      try {
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
          const arrayBuffer = event.target.result;
          const georaster = await parseGeoraster(arrayBuffer);

          const geoRasterLayer = new GeoRasterLayer({
            georaster,
            opacity: 0.7,
            pixelValuesToColorFn: (value) => {
              if (value < 50) return "yellow";
              if (value >= 50 && value < 130) return "green";
              if (value >= 130 && value < 180) return "#93E9BE";
              if (value === 190) return "red";
              if (value === 200) return "#966400";
              if (value === 210) return "blue";
              if (value === 220) return "#ffffff";
              return "transparent";
            },
            resolution: 128,
          });

          geoRasterLayer.addTo(map);
          map.fitBounds(geoRasterLayer.getBounds());
        };

        fileReader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("Error loading GeoTIFF:", error);
      }
    };

    loadGeoTiff();
  }, [file, map]);

  return null;
}

function MapPage() {
  const [file, setFile] = useState(null);
  const [mapFeatures, setMapFeatures] = useState([]);
  const [savedMaps, setSavedMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const mapRef = useRef();
  const [isMapReady, setIsMapReady] = useState(false);
  

  


  useEffect(() => {
    const fetchSavedMaps = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        alert("User not logged in!");
        return;
      }
    
      try {
        const response = await fetch(`http://localhost:5000/api/maps?user_id=${userId}`);
        const data = await response.json();
        console.log("Fetched saved maps:", data); // Debugging log
        setSavedMaps(data.maps);
      } catch (err) {
        console.error("Error fetching saved maps:", err);
      }
    };
    

    fetchSavedMaps();
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert("User not logged in!");
      return;
    }

    const payload = {
      user_id: parseInt(userId, 10),
      name: prompt("Enter a name for your map:", "User's Map") || "User's Map",
      data: mapFeatures,
    };

    try {
      const response = await fetch("http://localhost:5000/api/maps/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Map saved successfully!");
        const fetchSavedMaps = async () => {
          const response = await fetch(`http://localhost:5000/api/maps?user_id=${userId}`);
          const data = await response.json();
          setSavedMaps(data.maps);
        };
        fetchSavedMaps();
      } else {
        const errorData = await response.json();
        alert(`Failed to save map: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error saving map:", err);
      alert("An error occurred while saving the map.");
    }
  };

  const handleMapSelect = (map) => {
    if (!map || !map.data) {
      console.error("Selected map or map data is unavailable.");
      return;
    }
    
    setSelectedMap(map); // Update selected map state
    console.log("Selected map in handleMapSelect:", map);
  
    if (mapRef.current) {
      console.log("Map reference is initialized.");
  
      // Remove existing layers (except tile layers)
      mapRef.current.eachLayer((layer) => {
        if (!(layer instanceof L.TileLayer)) {
          mapRef.current.removeLayer(layer);
        }
      });
  
      // Add GeoJSON data
      const geoJsonLayer = L.geoJSON(map.data).addTo(mapRef.current);
  
      // Fit bounds to GeoJSON layer
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds);
      } else {
        console.warn("Bounds are invalid, falling back to default view.");
        mapRef.current.setView([28.3949, 84.124], 7); // Default center and zoom
      }
    } else {
      console.error("Map reference is not initialized yet.");
    }
  };

  useEffect(() => {
    if (!mapRef.current) {
      console.log("Initializing map...");
      mapRef.current = L.map('mapId').setView([51.505, -0.09], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors',
      }).addTo(mapRef.current);
  
      mapRef.current.on('load', () => {
        console.log("Map fully loaded.");
      });
  
      console.log("Map initialized:", mapRef.current);
    }
  }, []);
  
  

  useEffect(() => {
    if (mapRef.current) {
      setIsMapReady(true);
    }
  }, [mapRef.current]);
  
  
  // Debugging: Log mapRef and selectedMap
  useEffect(() => {
    if (!isMapReady || !selectedMap) return;

  console.log("Map is ready, and selectedMap is available");
  
    if (!mapRef.current) {
      console.error("Map reference is not initialized yet");
      return;
    }
  
    console.log("Selected map:", selectedMap);
    console.log("Map reference initialized:", mapRef.current);
  
    if (!selectedMap.data || !Array.isArray(selectedMap.data)) {
      console.error("Invalid or missing GeoJSON data in selectedMap:", selectedMap.data); // Debugging log
      return;
    }
  
    // Clear existing layers except the base TileLayer
    mapRef.current.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        mapRef.current.removeLayer(layer);
      }
    });
  
    // Add GeoJSON layer for the selected map
    const geoJsonLayer = L.geoJSON(selectedMap.data, {
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(
            Object.entries(feature.properties)
              .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
              .join("<br>")
          );
        }
      },
    }).addTo(mapRef.current);
  
    // Fit bounds to the GeoJSON layer
    const bounds = geoJsonLayer.getBounds();
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds);
    } else {
      console.warn("GeoJSON layer has invalid bounds"); // Debugging log
    }
  }, [isMapReady, selectedMap]);
  

  return (
    <div >
  <MapContainer
  center={[28.3949, 84.124]}
  zoom={7}
  style={{ height: "100vh", zIndex: 0 }}
  whenCreated={(map) => {
    
    
    console.log("Map created and reference stored:", map); // Debugging log
    mapRef.current = map;
  }}

>


        {file && <GeoTiffLayer file={file} />}
        <FeatureGroup>
        <EditControl
  position="topright"
  onCreated={(e) => {
    // Update map features with the new layer
    const layer = e.layer;
    setMapFeatures((prev) => [...prev, layer.toGeoJSON()]);

    // Geocoding functionality for markers
    if (layer instanceof L.Marker) {
      const { lat, lng } = layer.getLatLng();
      layer.bindPopup("Loading information...").openPopup();

      fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=67ce3a9c73234561bc3bedeeaa41afc9`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.results && data.results.length > 0) {
            const place = data.results[0];
            const placeInfo = `
              <b>Formatted Address:</b> ${place.formatted}<br />
              <b>Country:</b> ${place.components.country}<br />
              <b>State:</b> ${place.components.state || "N/A"}<br />
            `;
            layer.setPopupContent(placeInfo).openPopup();
          } else {
            layer
              .setPopupContent("No information available for this location.")
              .openPopup();
          }
        })
        .catch((error) => {
          layer
            .setPopupContent("Failed to fetch location info. Please try again.")
            .openPopup();
          console.error("API Error:", error);
        });
    }
  }}
/>

        </FeatureGroup>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
      <hr></hr>
      <div
    id="mapId"
    style={{
      height: "100vh",
      width: "100%",
      backgroundColor: "gray", // Fallback if no map loads
    }}
  >
  
    
  </div>

      <input
        type="file"
        accept=".tif"
        onChange={handleFileChange}
        style={{
          position: "absolute",
          top: "90px",
          left: "10px",
          zIndex: 1000,
          padding: "10px",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      />

      <button
        onClick={handleSave}
        style={{
          position: "absolute",
          top: "140px",
          left: "10px",
          zIndex: 1000,
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Save Map
      </button>

      <div
        style={{
          position: "absolute",
          top: "200px",
          left: "10px",
          zIndex: 1000,
        }}
      >
       <select
  onChange={(e) => {
    const selected = savedMaps.find((map) => map.id === parseInt(e.target.value, 10));
    console.log("Selected map from dropdown:", selected); // Debugging log
    handleMapSelect(selected);
  }}
>
  <option value="">Select a saved map</option>
  {savedMaps.map((map) => (
    <option key={map.id} value={map.id}>
      {map.name}
    </option>
  ))}
</select>


      </div>
    </div>
  );
}

export default MapPage;
