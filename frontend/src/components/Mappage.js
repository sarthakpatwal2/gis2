import React, { useState, useEffect } from "react";
//import "./App.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

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

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const _created = (e) => {
    const layer = e.layer;
    const featureData = layer.toGeoJSON();

    setMapFeatures((prevFeatures) => [...prevFeatures, featureData]);

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
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert("User not logged in!");
      return;
    }
  
    const payload = {
      user_id: parseInt(userId, 10), // Convert to integer
      name: "User's Map",
      data: mapFeatures, // Assuming mapFeatures contains the map data
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/maps/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token if required
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        alert("Map saved successfully!");
      } else {
        alert("Failed to save map.");
      }
    } catch (err) {
      console.error("Error saving map:", err);
      alert("An error occurred while saving the map.");
    }
  };
  
  return (
    <div style={{ position: "relative" }}>
      <MapContainer center={[28.3949, 84.124]} zoom={7} style={{ height: "100vh", zIndex: 0 }}>
        {file && <GeoTiffLayer file={file} />}
        <FeatureGroup>
          <EditControl position="topright" onCreated={_created} />
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
    </div>
  );
}

export default MapPage;
