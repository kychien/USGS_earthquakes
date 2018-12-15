// API endpoints
var last7Url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var last30Url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Thanks to: https://github.com/fraxen/tectonicplates
var faultUrl = "resources/PB2002_boundaries.json";

// Function to update plot when new endpoint is chosen
function updatePlot(url) {
  // Perform a GET request to the query URL
  d3.json(url, function(data) {
    // Once we get a response, send the data.features object to the plotQuakes function
    plotQuakes(data.features);
  });
}

// Function to plot circles based on quake magnitude
function plotQuakes(earthquakeData) {

  // Give each feature a popup describing the place and time of the earthquake
  function quakePopUp(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Convert latlng to a Circle instead of marker
  function quakeCircle(feature, latlng){

    // Handles for quick reference
    var magn = +feature.properties.mag;
    
    // Default color
    var cLvl = '#b7f34d';

    // Adjust color for magnitude of quake
    if (magn > 5) {
      cLvl = '#f06b6b';
    } else if (magn > 4) {
      cLvl = '#f0a76b';
    } else if (magn > 3) {
      cLvl = '#f3ba4d';
    } else if (magn > 2) {
      cLvl = '#f3db4d';
    } else if (magn > 1) {
      cLvl = '#e1f34d';
    }

    // Create circle
    return L.circleMarker(latlng, {
      radius: magn*5,
      fillColor: cLvl,
      fillOpacity: 0.75,
      color: cLvl,
      weight: 1,
      opacity: 1
    });
  }

  // Create a GeoJSON layer via Circle and PopUp functions
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: quakeCircle, 
    onEachFeature: quakePopUp
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define map layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Add fault line data
  var faultLayer = L.layerGroup();

  d3.json(faultUrl, function(data){
    L.geoJSON(data, {
      color: '#d84df3',
      weight: 3
    }).addTo(faultLayer);
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satellitemap,
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Light Map": lightmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Fault Lines": faultLayer,
    "Earthquakes": earthquakes
  };

  // Set up default map with earthquake and fault layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [satellitemap, faultLayer, earthquakes]
  });

  

  // Create a layer control for maps and overlays
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend to display information about our map
  var info = L.control({
    position: "bottomright"
  });

  // When the layer control is added, insert a div to act as the "legend"
  info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    // Use CSS to help format legend
    div.innerHTML = "<table class='legend'>" +
      "<tr><th>Color</th><th>Magnitude</th></tr>" +
      "<tr> <td class='low'></td> <td class='key'>0-1</td></tr>" +
      "<tr> <td class='llw'></td> <td class='key'>1-2</td></tr>" +
      "<tr> <td class='mll'></td> <td class='key'>2-3</td></tr>" +
      "<tr> <td class='mod'></td> <td class='key'>3-4</td></tr>" +
      "<tr> <td class='hgh'></td> <td class='key'>4-5</td></tr>" +
      "<tr> <td class='svr'></td> <td class='key'>5+ </td></tr>" +
      "</table>";
    return div;
  };

  // Add the info legend to the map
  info.addTo(myMap);  

}
// Function based to allow for event listeners to modify for future implementations
updatePlot(last7Url);