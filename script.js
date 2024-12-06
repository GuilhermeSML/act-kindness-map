// Initialize the map, set the view to London by default
const map = L.map('map').setView([51.5074, -0.1278], 13); // Default to London

// Set up the OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Create a layer group for kindness spots and initialize the MarkerCluster group
const kindnessSpotsLayer = L.layerGroup().addTo(map);
const markers = L.markerClusterGroup(); // Marker cluster group to handle multiple markers

// Create custom icons for different types of kindness spots
const foodIcon = L.icon({
  iconUrl: 'https://img.icons8.com/ios/50/000000/food.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const shelterIcon = L.icon({
  iconUrl: 'https://img.icons8.com/ios/50/000000/hotel-room.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const charityIcon = L.icon({
  iconUrl: 'https://img.icons8.com/ios/50/000000/giving.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Fetch kindness spots data from the JSON file (Make sure to use the correct path)
fetch('kindnessSpots.json') // Your kindness spots JSON file should be in the same folder or adjust the path
  .then(response => response.json())
  .then(data => {
    displayKindnessSpots(data.kindnessSpots); // Call function to add markers
  })
  .catch(error => console.error("Error fetching data:", error));

// Function to display kindness spots on the map
function displayKindnessSpots(spots) {
  spots.forEach(spot => {
    const markerIcon = spot.type === 'Food Bank' 
      ? foodIcon 
      : spot.type === 'Shelter' 
      ? shelterIcon 
      : charityIcon;

    const marker = L.marker([spot.location.lat, spot.location.lng], { icon: markerIcon })
      .bindPopup(`
        <strong>${spot.name}</strong><br>
        ${spot.description}<br>
        <em>Type: ${spot.type}</em><br>
        <strong>Address:</strong> ${spot.address}<br>
        <strong>Phone:</strong> ${spot.phone}
      `);

    markers.addLayer(marker); // Add marker to the MarkerCluster group
  });

  kindnessSpotsLayer.addLayer(markers); // Add the MarkerCluster group to the kindness spots layer
}

// Geolocation API to center map on user's location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function(position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Center the map on the user's current location
      map.setView([userLat, userLng], 13);

      // Add a marker for the user's location with default icon
      L.marker([userLat, userLng])
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();
    },
    function(error) {
      console.error("Geolocation error: ", error);
      map.setView([51.5074, -0.1278], 13); // Fallback to London if geolocation fails
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
  map.setView([51.5074, -0.1278], 13); // Fallback to London if geolocation is not supported
}

// Optional: Add a control to toggle the kindness spots layer on/off
const overlayMaps = {
  "Kindness Spots": kindnessSpotsLayer  // Add kindness spots layer to the overlayMaps control
};

L.control.layers(null, overlayMaps).addTo(map);  // Add the layer control to the map
