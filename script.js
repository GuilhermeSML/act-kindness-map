// Initialize the map using Leaflet, default to London if geolocation is not available
const map = L.map('map').setView([51.5074, -0.1278], 13); // Default to London (lat, long)

// Set up the OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Create a layer group for the kindness spots
const kindnessSpotsLayer = L.layerGroup().addTo(map);

// Fetch kindness spots data from the JSON file
fetch('kindnessSpots.json')  // Ensure the path is correct
  .then(response => response.json())
  .then(data => {
    displayKindnessSpots(data.kindnessSpots);  // Function to add markers
  })
  .catch(error => console.error("Error fetching data:", error));

// Function to display kindness spots on the map
function displayKindnessSpots(spots) {
  spots.forEach(spot => {
    // Create a marker for each kindness spot and add it to the kindnessSpotsLayer
    const marker = L.marker([spot.location.lat, spot.location.lng])
      .addTo(kindnessSpotsLayer)  // Add marker to the kindness spots layer
      .bindPopup(`
        <strong>${spot.name}</strong><br>
        ${spot.description}<br>
        <em>Type: ${spot.type}</em><br>
        <strong>Address:</strong> ${spot.address}<br>
        <strong>Phone:</strong> ${spot.phone}
      `);
  });
}

// Geolocation API to center map on user's location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function(position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      
      // Center the map on the user's current location
      map.setView([userLat, userLng], 13);
      
      // Add a marker for the user's location
      L.marker([userLat, userLng])
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();
      
    },
    function(error) {
      console.error("Geolocation error: ", error);
      // Fallback to London if geolocation fails
      console.log("Using default location (London)");
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
  // Fallback to London if geolocation is not supported
  map.setView([51.5074, -0.1278], 13); // Default to London
}

// Optional: Add a control to toggle the kindness spots layer on/off
const overlayMaps = {
  "Kindness Spots": kindnessSpotsLayer  // Add kindness spots layer to the overlayMaps control
};

L.control.layers(null, overlayMaps).addTo(map);  // Add the layer control to the map
