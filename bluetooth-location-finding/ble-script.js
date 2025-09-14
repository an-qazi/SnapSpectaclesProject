// Import the BluetoothCentralModule
const bluetooth = require("LensStudio:BluetoothCentralModule");

// Define a function to handle the BLE operations
async function bleTest() {
    print("Starting Bluetooth scan...");

    // Start scanning for a device with a specific manufacturer ID
    // The predicate function returns true to stop the scan once a device is found
    const scanResult = await bluetooth.startScan(
        [{ manufacturerId: 0x1234 }], // Example filter: replace 0x1234 with your device's manufacturer ID
        { timeoutSeconds: 10, uniqueDevices: true }, // Scan settings: 10-second timeout, only unique devices
        (result) => {
            print('Device found:', result.deviceAddress, result.deviceName);
            // Return true to stop the scan and connect to this device
            return true;
        }
    );

    if (scanResult == undefined) {
        print('Scan failed to find a device within the timeout.');
        return;
    }

    print('Scan result:', scanResult);

    // Connect to the found device
    const bluetoothGatt = await bluetooth.connectGatt(scanResult.deviceAddress, {
        autoConnect: true,
        autoBond: true
    });

    // Add event listeners for connection state, bond state, and MTU changes
    bluetoothGatt.onConnectionStateChanged.add((state) => {
        print('Connection state changed:', state);
    });
    bluetoothGatt.onBondStateChanged.add((state) => {
        print('Bond state changed:', state);
    });
    bluetoothGatt.onMtuChanged.add((mtu) => {
        print('Mtu changed:', mtu);
    });

    // Get services from the connected device
    const services = await bluetoothGatt.getServices();
    if (services.length == 0) {
        print('No services found on the device.');
        return;
    }
    print('Services found:', services.map(s => s.uuid));

    // Select the first service (you would typically look for a specific service UUID)
    const service = services[0];
    const characteristics = await service.getCharacteristics();
    if (characteristics.length == 0) {
        print('No characteristics found for the selected service.');
        return;
    }
    print('Characteristics found:', characteristics.map(c => c.uuid));

    // Select the first characteristic (you would typically look for a specific characteristic UUID)
    const characteristic = characteristics[0];

    // Read the value of the characteristic
    const value = await characteristic.readValue();
    print('Characteristic value:', value);

    // Write a new value to the characteristic (example: writing a 3-byte array)
    await characteristic.writeValue(new Uint8Array([0x01, 0x02, 0x03]));
    print('Wrote new value to characteristic.');

    // Register for notifications on the characteristic
    characteristic.registerNotifications({
        // Callback for when the characteristic value changes
        onValueChange: (newValue) => {
            print('Characteristic value changed (notification):', newValue);
        }
    });

    // In a real application, you would manage the lifecycle of the connection
    // and eventually disconnect when no longer needed.
    // For this example, we'll just keep the connection open for a short period.
    // bluetoothGatt.disconnect(); // Call this when done
}

// Call the main function to start the BLE operations
bleTest();
