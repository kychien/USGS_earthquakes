// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2017-12-30&endtime=" +
  "2018-01-02&maxlongitude=-66.8628&minlongitude=-169.9146&maxlatitude=71.5232&minlatitude=24.3959";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  // var incidents = data.features; 

  // // For each incident of an earthquake
  // for (var i = 0; i < incidents.length; i++){
    
  //   // Handles for quick reference
  //   var quake = incidents[i];
  //   var magn = quake.properties.mag;
    
  //   // Default color
  //   var cLvl = '#b7f34d';

  //   // Adjust color for magnitude of quake
  //   if (magn > 5) {
  //     cLvl = '#f06b6b';
  //   } else if (magn > 4) {
  //     cLvl = '#f0a76b';
  //   } else if (magn > 3) {
  //     cLvl = '#f3ba4d';
  //   } else if (magn > 2) {
  //     cLvl = '#f3db4d';
  //   } else if (magn > 1) {
  //     cLvl = '#e1f34d';
  //   }

  //   // Convert Quakes to 

  // }
});

function createFeatures(earthquakeData) {

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

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: quakeCircle, 
    onEachFeature: quakePopUp
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
