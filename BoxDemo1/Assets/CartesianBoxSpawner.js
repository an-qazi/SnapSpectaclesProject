// @input Asset.RenderMesh boxMesh
// @input Asset.Material boxMaterial
// @input SceneObject parentObject

// Define the actual size of each box (this should match your mesh size)
var BOX_SIZE = 3.0;

// Spawns a box at a grid position (gridX, gridY, gridZ)
function spawnBoxAtGrid(gridX, gridY, gridZ) {
    if (gridZ === undefined) gridZ = 0; // Default to 0 if not provided
    
    var sceneObject = global.scene.createSceneObject("Box_" + gridX + "_" + gridY + "_" + gridZ);
    var meshVisual = sceneObject.createComponent("Component.MeshVisual");
    meshVisual.mesh = script.boxMesh;
    meshVisual.clearMaterials();
    meshVisual.addMaterial(script.boxMaterial);
    
    // Calculate world position
    var base = script.parentObject ? script.parentObject.getTransform().getWorldPosition() : new vec3(0,0,0);
    var worldX = gridX * BOX_SIZE;
    var worldY = gridY * BOX_SIZE;
    var worldZ = gridZ * BOX_SIZE;
    var pos = base.add(new vec3(worldX, worldY, worldZ));
    
    sceneObject.getTransform().setWorldPosition(pos);
    sceneObject.getTransform().setLocalScale(new vec3(3, 3, 3));
    
    if (script.parentObject) {
        sceneObject.setParent(script.parentObject);
    }
    
    print("Created box at: " + worldX + ", " + worldY + ", " + worldZ);
    return sceneObject;
}

// Creates a downward facing arrow pattern with a line leading from the top
function createDownwardArrow() {
    print("Creating downward arrow with line...");
    
    // Vertical line leading into the arrow (extending upward from center)
    for (var y = 1; y < 4; y++) {  // 3 boxes going up from the arrow
        spawnBoxAtGrid(2, y, 0);   // Center column (x=2)
    }
    
    // Top horizontal line (5 boxes wide) - the arrow head
    for (var x = 0; x < 5; x++) {
        spawnBoxAtGrid(x, 0, 0);
    }
    
    // Second row (3 boxes wide, centered)
    for (var x = 1; x < 4; x++) {
        spawnBoxAtGrid(x, -1, 0);
    }
    
    // Third row (1 box, center point)
    spawnBoxAtGrid(2, -2, 0);
    
    print("Downward arrow with line created");
}

// Alternative: If you want to specify exact world coordinates but ensure flush placement
function spawnBoxAtCartesian(worldX, worldY, worldZ) {
    worldZ = worldZ || 0; // Default to 0 if not provided for backward compatibility
    // Snap to grid to ensure flush placement
    var gridX = Math.round(worldX / BOX_SIZE);
    var gridY = Math.round(worldY / BOX_SIZE);
    var gridZ = Math.round(worldZ / BOX_SIZE);
    return spawnBoxAtGrid(gridX, gridY, gridZ);
}

// Simple straight line for comparison
function createStraightLine() {
    print("Creating straight line...");
    for (var x = 0; x < 5; x++) {
        spawnBoxAtGrid(x, 0, 0);
    }
    print("Straight line created");
}

// Wait for lens to initialize
script.createEvent("OnStartEvent").bind(function() {
    print("Script started");
    createDownwardArrow(); // Creates a downward facing arrow pattern
});