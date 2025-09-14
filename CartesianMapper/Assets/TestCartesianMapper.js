// TestCartesianMapper.js - Test script with 5 markers
// Attach this to a separate SceneObject for testing

//@input SceneObject gridRoot

// Test with 5 markers in different positions
var TEST_MARKERS = [
    { x: 0.0, y: 0.0, id: "center" },      // Center position
    { x: 2.0, y: 1.0, id: "northeast" },   // 2m right, 1m forward
    { x: -1.5, y: 2.0, id: "northwest" },  // 1.5m left, 2m forward
    { x: 1.0, y: -1.5, id: "southeast" },  // 1m right, 1.5m back
    { x: -2.0, y: -1.0, id: "southwest" }  // 2m left, 1m back
];

var MARKER_HEIGHT = 0.6; // 60cm above ground

function runTest() {
    if (!script.gridRoot) {
        createErrorText("ERROR: Assign gridRoot in Inspector");
        return;
    }
    
    // Clear any existing test markers
    clearTestMarkers();
    
    // Create title
    createTestTitle();
    
    // Create all 5 test markers
    for (var i = 0; i < TEST_MARKERS.length; i++) {
        var marker = TEST_MARKERS[i];
        createTestMarker(marker.x, marker.y, marker.id, i + 1);
    }
    
    // Create summary
    createTestSummary();
}

function createTestTitle() {
    var titleObj = script.gridRoot.createSceneObject("TestTitle");
    var text3D = titleObj.createComponent("Text3D");
    text3D.text = "5-MARKER TEST";
    text3D.size = 0.25;
    text3D.extruded = false;
    
    // Position high and in front
    titleObj.getTransform().setLocalPosition(new vec3(0, 1.2, -1.0));
}

function createTestMarker(x, y, deviceId, number) {
    // Create marker container
    var markerContainer = script.gridRoot.createSceneObject("TestMarker_" + deviceId);
    markerContainer.getTransform().setLocalPosition(new vec3(x, 0, y));
    
    // Create main marker with number
    var markerObj = markerContainer.createSceneObject("Marker_" + deviceId);
    var markerText3D = markerObj.createComponent("Text3D");
    markerText3D.text = "MARKER " + number;
    markerText3D.size = 0.2;
    markerText3D.extruded = false;
    markerObj.getTransform().setLocalPosition(new vec3(0, MARKER_HEIGHT, 0));
    
    // Create device ID label
    var idObj = markerContainer.createSceneObject("ID_" + deviceId);
    var idText3D = idObj.createComponent("Text3D");
    idText3D.text = deviceId.toUpperCase();
    idText3D.size = 0.12;
    idText3D.extruded = false;
    idObj.getTransform().setLocalPosition(new vec3(0, MARKER_HEIGHT - 0.15, 0));
    
    // Create coordinate label
    var coordObj = markerContainer.createSceneObject("Coord_" + deviceId);
    var coordText3D = coordObj.createComponent("Text3D");
    coordText3D.text = "(" + x + ", " + y + ")";
    coordText3D.size = 0.08;
    coordText3D.extruded = false;
    coordObj.getTransform().setLocalPosition(new vec3(0, MARKER_HEIGHT - 0.28, 0));
    
    // Create distance from origin
    var distance = Math.sqrt(x * x + y * y).toFixed(1);
    var distObj = markerContainer.createSceneObject("Dist_" + deviceId);
    var distText3D = distObj.createComponent("Text3D");
    distText3D.text = distance + "m from origin";
    distText3D.size = 0.06;
    distText3D.extruded = false;
    distObj.getTransform().setLocalPosition(new vec3(0, MARKER_HEIGHT - 0.38, 0));
}

function createTestSummary() {
    var summaryObj = script.gridRoot.createSceneObject("TestSummary");
    var text3D = summaryObj.createComponent("Text3D");
    text3D.text = "5 markers created successfully";
    text3D.size = 0.1;
    text3D.extruded = false;
    
    // Position at bottom right
    summaryObj.getTransform().setLocalPosition(new vec3(1.5, 0.2, -0.8));
}

function clearTestMarkers() {
    if (!script.gridRoot) return;
    
    var children = script.gridRoot.children;
    for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        var name = child.name;
        if (name.indexOf("TestMarker_") === 0 || 
            name.indexOf("TestTitle") === 0 || 
            name.indexOf("TestSummary") === 0) {
            child.destroy();
        }
    }
}

function createErrorText(message) {
    var errorObj = script.getSceneObject().createSceneObject("TestError");
    var text3D = errorObj.createComponent("Text3D");
    text3D.text = message;
    text3D.size = 0.15;
    text3D.extruded = false;
    errorObj.getTransform().setLocalPosition(new vec3(0, 0, -1.0));
}

// Run test automatically on start
script.createEvent("OnStartEvent").bind(function() {
    runTest();
});

// Allow manual test trigger
global.runCartesianTest = runTest;
global.clearCartesianTest = clearTestMarkers;