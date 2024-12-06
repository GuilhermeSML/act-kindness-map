// Initialize the map, set the view to London by default
const map = L.map('map').setView([51.5074, -0.1278], 13); // Default to London

// Set up OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Create a layer group for kindness spots and initialize the MarkerCluster group
const kindnessSpotsLayer = L.layerGroup().addTo(map);
const markers = L.markerClusterGroup(); // Marker cluster group to handle multiple markers

// Create custom icons for different types of kindness spots
const foodIcon = L.icon({
  iconUrl: 'https://img.icons8.com/ios/50/000000/food.png',
  iconSize: [50, 50], // Increased icon size
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
  className: 'icon-background',
});

const shelterIcon = L.icon({
  iconUrl: 'https://img.icons8.com/?size=100&id=1138&format=png&color=000000',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
  className: 'icon-background',
});

const charityIcon = L.icon({
  iconUrl: 'https://img.icons8.com/ios/50/000000/giving.png',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
  className: 'icon-background',
});

// Function to fetch kindness spots data from Overpass API
function fetchKindnessSpots(lat, lng) {
  // Clear previous kindness spots
  kindnessSpotsLayer.clearLayers();
  markers.clearLayers();

  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  const query = `
    [out:json];
    (
      node["amenity"="food_bank"](around:10000,${lat},${lng});
      node["amenity"="shelter"](around:10000,${lat},${lng});
      node["shop"="charity"](around:10000,${lat},${lng});
    );
    out body;
  `;
  
  // Send the request to Overpass API
  fetch(overpassUrl + '?data=' + encodeURIComponent(query))
    .then(response => response.json())
    .then(data => {
      displayKindnessSpotsFromOSM(data.elements, lat, lng); // Function to add markers
    })
    .catch(error => console.error("Error fetching data from Overpass API:", error));
}

// Function to display kindness spots from Overpass API on the map
function displayKindnessSpotsFromOSM(elements, lat, lng) {
  elements.forEach(spot => {
    let icon;

    // Assign appropriate icon based on the tag (e.g., food bank, shelter, charity shop)
    if (spot.tags.amenity === 'food_bank') {
      icon = foodIcon;
    } else if (spot.tags.amenity === 'shelter') {
      icon = shelterIcon;
    } else if (spot.tags.shop === 'charity') {
      icon = charityIcon;
    } else {
      return; // Skip if it's not a kindness spot we're interested in
    }

    // Create a marker for each kindness spot using the appropriate icon
    const marker = L.marker([spot.lat, spot.lon], { icon: icon })
      .bindPopup(`
        <strong>${spot.tags.name || 'Unnamed'}</strong><br>
        <em>Type: ${spot.tags.amenity || spot.tags.shop}</em><br>
        <strong>Address:</strong> ${spot.tags.address || 'N/A'}<br>
      `);

    markers.addLayer(marker); // Add marker to the MarkerCluster group
  });

  kindnessSpotsLayer.addLayer(markers); // Add the MarkerCluster group to the kindness spots layer

  // Center the map on the new location
  map.setView([lat, lng], 13);
}

// Fetch kindness spots data when the map is loaded (default to London)
fetchKindnessSpots(51.5074, -0.1278); // Fetch kindness spots for London by default

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

      // Fetch kindness spots for the user's location
      fetchKindnessSpots(userLat, userLng);
    },
    function(error) {
      console.error("Geolocation error: ", error);
      // Fallback to London if geolocation fails
      map.setView([51.5074, -0.1278], 13); // Default to London
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
  // Fallback to London if geolocation is not supported
  map.setView([51.5074, -0.1278], 13); // Default to London
}

// Add search control (Geocoder) to the map
L.Control.geocoder({
  collapsed: false,
  geocoder: new L.Control.Geocoder.Nominatim()
}).on('markgeocode', function(e) {
  const lat = e.geocode.center.lat;
  const lng = e.geocode.center.lng;

  // Fetch kindness spots for the new location
  fetchKindnessSpots(lat, lng);

}).addTo(map);

// Optional: Add a control to toggle the kindness spots layer on/off
const overlayMaps = {
  "Kindness Spots": kindnessSpotsLayer,
};

L.control.layers(null, overlayMaps).addTo(map);
