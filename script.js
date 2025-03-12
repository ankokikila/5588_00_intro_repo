require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/rest/route",
  "esri/rest/support/RouteParameters",
  "esri/rest/support/FeatureSet"
], function(Map, MapView, Graphic, GraphicsLayer, route, RouteParameters, FeatureSet) {

  // Esri API Key (Replace this with your actual API key)
  const API_KEY = "YOUR_ESRI_API_KEY";

  // Create the map
  const map = new Map({
    basemap: "streets-navigation-vector"
  });

  // Create the map view
  const view = new MapView({
    container: "map-view",
    map: map,
    center: [-118.2437, 34.0522], // Default center: Los Angeles
    zoom: 12
  });

  // Add a layer for routes
  const routesLayer = new GraphicsLayer();
  map.add(routesLayer);

  // Define route colors
  const routeSymbols = {
    optimal: { type: "simple-line", color: "green", width: 4 },
    congestion: { type: "simple-line", color: "red", width: 4 },
    alternate: { type: "simple-line", color: "blue", width: 4 }
  };

  // Function to fetch and display routes
  function getRoutes(start, end) {
    routesLayer.removeAll(); // Clear previous routes

    let routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: [
          createStop(start),
          createStop(end)
        ]
      }),
      returnDirections: true,
      returnRoutes: true,
      returnTrafficInfo: true
    });

    // Call Esri's routing service
    route.solve(`https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World?token=${API_KEY}`, routeParams)
      .then(response => {
        response.routeResults.forEach((routeResult, index) => {
          let trafficDelay = routeResult.route.attributes.TrafficDelay;
          let symbol = index === 0 ? routeSymbols.optimal : (trafficDelay > 300 ? routeSymbols.congestion : routeSymbols.alternate);
          displayRoute(routeResult.route.geometry, symbol);
        });
      })
      .catch(error => {
        console.error("Error fetching route:", error);
      });
  }

  // Function to create a stop (point) for routing
  function createStop(coords) {
    return new Graphic({
      geometry: {
        type: "point",
        longitude: coords[1],
        latitude: coords[0]
      }
    });
  }

  // Function to display route on the map
  function displayRoute(geometry, symbol) {
    let routeGraphic = new Graphic({
      geometry: geometry,
      symbol: symbol
    });
    routesLayer.add(routeGraphic);
  }

  // Simulate button event
  document.getElementById('simulate-btn').addEventListener('click', function() {
    let startInput = document.getElementById('start-location').value;
    let endInput = document.getElementById('end-location').value;
    
    if (!startInput || !endInput) {
      alert("Please enter valid start and end locations.");
      return;
    }
    
    let startCoords = startInput.split(",").map(Number);
    let endCoords = endInput.split(",").map(Number);
    
    getRoutes(startCoords, endCoords);
  });

});
