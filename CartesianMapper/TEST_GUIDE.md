# Test Script Usage Guide

## TestCartesianMapper.js - 5 Marker Test

### What This Test Does
Creates 5 markers at strategic positions to verify your CartesianMapper system:

1. **CENTER** - (0, 0) at origin
2. **NORTHEAST** - (2, 1) 2m right, 1m forward  
3. **NORTHWEST** - (-1.5, 2) 1.5m left, 2m forward
4. **SOUTHEAST** - (1, -1.5) 1m right, 1.5m back
5. **SOUTHWEST** - (-2, -1) 2m left, 1m back

### Setup Instructions

#### Option 1: Replace Main Script (Quick Test)
1. **Replace** your main CartesianMapper.js with TestCartesianMapper.js
2. **Keep same setup**: Script Holder + Grid Container
3. **Preview** - you'll see all 5 markers immediately

#### Option 2: Add as Separate Test (Recommended)
1. **Create new SceneObject** called "Test Script Holder"
2. **Add Script Component** to Test Script Holder
3. **Assign TestCartesianMapper.js** to the script
4. **Assign same Grid Container** to gridRoot field
5. **Preview** - both main and test markers will appear

### What You'll See
- **"5-MARKER TEST"** title at the top
- **5 numbered markers** at different positions
- **Each marker shows**:
  - "MARKER 1", "MARKER 2", etc.
  - Device ID (CENTER, NORTHEAST, etc.)
  - Exact coordinates (x, y)
  - Distance from origin in meters
- **"5 markers created successfully"** summary message

### Manual Control
You can also trigger the test manually:
```javascript
// Run test
global.runCartesianTest();

// Clear test markers
global.clearCartesianTest();
```

### Verification Checklist
✅ All 5 markers visible  
✅ Markers at correct relative positions  
✅ Text readable at 60cm height  
✅ Coordinates match expected values  
✅ Distance calculations correct  

### Troubleshooting
- **No markers**: Check gridRoot assignment
- **Wrong positions**: Verify Grid Container at (0,0,0)
- **Text too small/large**: Adjust size values in script
- **Markers overlap**: Walk closer/farther to see separation

This test verifies your CartesianMapper system works correctly before connecting real backend data!