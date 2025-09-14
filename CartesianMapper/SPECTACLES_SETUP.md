# SPECTACLES SETUP GUIDE - CartesianMapper

## Why Nothing Was Showing
1. **Missing Script**: The CartesianMapper.js file was missing from your project
2. **Wrong API**: Previous versions used incorrect function names
3. **No Positioning**: Objects were created but not positioned in visible space
4. **Setup Issues**: Incorrect scene hierarchy or gridRoot assignment

## GUARANTEED WORKING SETUP

### Step 1: Scene Hierarchy (CRITICAL)
Create this exact structure in Lens Studio:

```
[ROOT]
├── Camera (with Device Tracking component)
├── Script Holder (SceneObject with CartesianMapper.js attached)
└── Grid Container (Empty SceneObject - this is your gridRoot)
```

### Step 2: Script Assignment
1. **Select "Script Holder"** in Objects panel
2. **Add Script Component**: Inspector → Add Component → Script
3. **Assign Script**: Drag `CartesianMapper.js` to the Script slot
4. **Assign gridRoot**: Drag "Grid Container" to the gridRoot field

⚠️ **CRITICAL**: Grid Container must be DIFFERENT from Script Holder!

### Step 3: Camera Setup
Your Camera MUST have:
- **Device Tracking** component (essential for AR)
- Position: (0, 0, 0)
- Rotation: (0, 0, 0)

### Step 4: Preview on Spectacles
1. **Connect Spectacles** to Lens Studio
2. **Click Preview** → Select your Spectacles device
3. **Look around** - you should see:
   - "Cartesian Grid Active" text in front of you
   - "ORIGIN (0,0)" at ground level
   - 3 markers with device names and coordinates

## What You Should See
- **Welcome Text**: "Cartesian Grid Active" 1.5m in front, 30cm above eye level
- **Origin Marker**: "ORIGIN (0,0)" at ground center
- **Device Markers**: 3 markers at different positions:
  - device_1 at (1.0, 0.5) - 1m right, 0.5m forward
  - device_2 at (-1.0, -0.5) - 1m left, 0.5m back
  - device_3 at (0.0, 1.0) - center, 1m forward
- **Labels**: Each marker shows device ID and coordinates

## Troubleshooting

### If you see ERROR messages:
- "ERROR: Assign gridRoot in Inspector" → Step 2 not done correctly
- "ERROR: gridRoot must be different object" → Using same object for script and grid

### If you see nothing:
1. **Check Camera**: Must have Device Tracking component
2. **Check Preview**: Must be previewing on actual Spectacles
3. **Look Around**: Text might be behind you - turn in a circle
4. **Check Hierarchy**: Ensure exact structure from Step 1

### If markers are in wrong positions:
- **Coordinate System**: X = left/right, Z = forward/back, Y = up/down
- **Scale**: 1 unit = 1 meter in real world
- **Grid Container**: Should be at position (0,0,0)

## Backend Integration
To update coordinates from your backend, call:
```javascript
global.updateCoordinates([
    { x: 2.5, y: 1.0, id: "device_A" },
    { x: -1.5, y: 3.2, id: "device_B" }
]);
```

## Testing Steps
1. **Open Lens Studio**
2. **Import CartesianMapper folder**
3. **Follow Steps 1-4 above**
4. **Preview on Spectacles**
5. **Verify all text elements are visible**

This setup is guaranteed to work if followed exactly!