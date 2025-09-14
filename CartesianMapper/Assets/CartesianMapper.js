// CartesianMapper.js - Working Spectacles Implementation
// Create separate empty SceneObject for gridRoot!

//@input SceneObject gridRoot

// Test coordinates for demonstration
var TEST_COORDINATES = [
    { x: 1.0, y: 0.5, id: "device_1" },
    { x: -1.0, y: -0.5, id: "device_2" },
    { x: 0.0, y: 1.0, id: "device_3" }
];

var MARKER_HEIGHT = 0.5; // 50cm above ground

function initialize() {
    if (!script.gridRoot) {
        createErrorText("ERROR: Assign gridRoot in Inspector");
        return;
    }
    
    if (script.gridRoot === script.getSceneObject()) {
        createErrorText("ERROR: gridRoot must be different object");
        return;
    }
    
    createWelcomeText();
    createOriginMarker();
    createTestMarkers();
}

function createWelcomeText() {
    var welcomeObj = script.gridRoot.createSceneObject("Welcome");
    var text3D = welcomeObj.createComponent("Text3D");
    text3D.text = "Cartesian Grid Active";
    text3D.size = 0.2;
    text3D.extruded = false;
    
    // Position above user at eye level
    welcomeObj.getTransform().setLocalPosition(new vec3(0, 0.3, -1.5));
}

function createOriginMarker() {
    var originObj = script.gridRoot.createSceneObject("Origin");
    var text3D = originObj.createComponent("Text3D");
    text3D.text = "ORIGIN (0,0)";
    text3D.size = 0.15;
    text3D.extruded = false;
    
    // Position at ground level
    originObj.getTransform().setLocalPosition(new vec3(0, 0.1, 0));
}

function createTestMarkers() {
    for (var i = 0; i < TEST_COORDINATES.length; i++) {
        var coord = TEST_COORDINATES[i];
        createMarker(coord.x, coord.y, coord.id);
    }
}

function createMarker(x, y, deviceId) {
    // Create marker container
    var markerContainer = script.gridRoot.createSceneObject("Marker_" + deviceId);
    markerContainer.getTransform().setLocalPosition(new vec3(x, 0, y));
    
    // Create main marker text
    var markerObj = markerContainer.createSceneObject("MarkerText_" + deviceId);
    var markerText3D = markerObj.createComponent("Text3D");
    markerText3D.text = "MARKER";
    markerText3D.size = 0.3;
    markerText3D.extruded = false;
    markerObj.getTransform().setLocalPosition(new vec3(0, MARKER_HEIGHT, 0));
    
    // Create device label
    var labelObj = markerContainer.createSceneObject("Label_" + deviceId);
    var labelText3D = labelObj.createComponent("Text3D");
    labelText3D.text = deviceId;
    labelText3D.size = 0.1;
    labelText3D.extruded = false;
    labelObj.getTransform().setLocalPosition(new vec3(0, MARKER_HEIGHT - 0.2, 0));
    
    // Create coordinate label
    var coordObj = markerContainer.createSceneObject("Coord_" + deviceId);
    var coordText3D = coordObj.createComponent("Text3D");
    coordText3D.text = "(" + x + "," + y + ")";
    coordText3D.size = 0.08;
    coordText3D.extruded = false;
    coordObj.getTransform().setLocalPosition(new vec3(0, MARKER_HEIGHT - 0.35, 0));
}

function createErrorText(message) {
    // Create error directly on script object if gridRoot fails
    var errorObj = script.getSceneObject().createSceneObject("Error");
    var text3D = errorObj.createComponent("Text3D");
    text3D.text = message;
    text3D.size = 0.2;
    text3D.extruded = false;
    
    // Position in front of user
    errorObj.getTransform().setLocalPosition(new vec3(0, 0, -1.0));
}

// PUBLIC API for backend integration
function updateCoordinates(coordinates) {
    if (!script.gridRoot) return;
    
    // Clear existing markers
    var children = script.gridRoot.children;
    for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        if (child.name.indexOf("Marker_") === 0) {
            child.destroy();
        }
    }
    
    // Create new markers
    for (var j = 0; j < coordinates.length; j++) {
        var coord = coordinates[j];
        createMarker(coord.x, coord.y, coord.id);
    }
}

// Lens Studio initialization
script.createEvent("OnStartEvent").bind(function() {
    initialize();
});

// Make function globally available
global.updateCoordinates = updateCoordinates;