import { useEffect } from "react";
import { useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

function GeoTiffLayer({ file }) {
  const map = useMap(); // Access the Leaflet map instance

  useEffect(() => {
    if (!file) return; // Exit if no file is provided

    const loadGeoTiff = async () => {
      try {
        const fileReader = new FileReader();

        fileReader.onload = async (event) => {
          const arrayBuffer = event.target.result;

          // Parse the GeoTIFF file
          const georaster = await parseGeoraster(arrayBuffer);
          console.log("GeoRaster Data:", georaster); // Debug parsed GeoTIFF

          // Add GeoTIFF as a layer to the map
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
            resolution: 256, // Resolution for performance optimization
          });

          // Add layer to the map and fit bounds
          geoRasterLayer.addTo(map);
          map.fitBounds(geoRasterLayer.getBounds());
        };

        fileReader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
      } catch (error) {
        console.error("Error loading GeoTIFF:", error);
      }
    };

    loadGeoTiff();
  }, [file, map]); // Re-run effect when file changes

  return null; // This component doesn't render anything visually
}

export default GeoTiffLayer;
