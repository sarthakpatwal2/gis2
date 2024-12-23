import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useMap } from "react-leaflet";
import L from "leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
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
              if (value > 50 && value < 130) return "green";
              if (value < 130 && value > 180) return "#93E9BE";
              if (value === 190) return "red";
              if (value === 200) return "#966400";
              if (value === 210) return "blue";
              if (value === 220) return "#ffffff";
              return "transparent";
            },
            resolution: 128, // Adjust the resolution
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

  // Define fetchSavedMaps at the top of the MapPage function
const fetchSavedMaps = async () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    alert("User not logged in!");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/maps?user_id=${userId}`);
    const data = await response.json();
    setSavedMaps(data.maps);
  } catch (err) {
    console.error("Error fetching saved maps:", err);
  }
};

// Example: If used in useEffect, call fetchSavedMaps when the component mounts
useEffect(() => {
  fetchSavedMaps(); // Load saved maps on component mount
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        alert("Map saved successfully!");
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
    setSelectedMap(map);
  };
  
  useEffect(() => {
    if (!selectedMap || !mapRef.current) return;
  
    const loadMapFeatures = () => {
      // Clear existing layers except the base TileLayer
      mapRef.current.eachLayer((layer) => {
        if (!(layer instanceof L.TileLayer)) {
          mapRef.current.removeLayer(layer);
        }
      });
  
      // Load the GeoJSON data from the selected map
      const geoJsonLayer = L.geoJSON(selectedMap.data).addTo(mapRef.current);
  
      // Adjust the map view to fit the bounds of the new features
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds);
      }
    };
  
    loadMapFeatures();
  }, [selectedMap]);
  

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={[28.3949, 84.124]}
        zoom={7}
        style={{ height: "100vh", zIndex: 0 }}
        whenCreated={(map) => {
          mapRef.current = map;
        }}
      >
        {file && <GeoTiffLayer file={file} mapRef={mapRef} />}
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={(e) => {
              const layer = e.layer;
              setMapFeatures((prev) => [...prev, layer.toGeoJSON()]);
            }}
          />
        </FeatureGroup>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      <input
        type="file"
        accept=".tif"
        onChange={handleFileChange}
        style={{
          position: "absolute",
          top: "80px",
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
  onChange={(e) =>
    handleMapSelect(savedMaps.find((map) => map.id === parseInt(e.target.value, 10)))
  }
  style={{
    padding: "10px",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "10px",
    width: "200px",
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
