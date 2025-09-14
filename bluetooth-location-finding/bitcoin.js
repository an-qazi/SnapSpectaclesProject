// @input Asset.InternetModule internetModule
// @input Asset.BluetoothCentralModule bluetoothModule

var internetModule = script.internetModule;
var bluetooth = script.bluetoothModule;

// UUIDs must match your Android GATT servers
var SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
var CHAR_PRICE_UUID = "abcdef12-3456-7890-abcd-ef1234567890";

// Annual growth assumption: 49% CAGR
var growthRate = Math.log(1.49); // per year

// Known beacon coordinates (in meters, relative to room origin)
var beacons = {
    "Beacon1": { x: 0, y: 0 },
    "Beacon2": { x: 5, y: 0 },
    "Beacon3": { x: 2, y: 4 }
};

var distances = {}; // store computed distances

// Scan for peripherals
var scan = bluetooth.scanForPeripheralsWithServices([SERVICE_UUID]);

scan.onDiscovered.add(function(peripheral) {
    print("Discovered peripheral: " + peripheral.name);

    peripheral.connect().then(function() {
        return peripheral.discoverServices([SERVICE_UUID]);
    }).then(function(services) {
        var service = services[0];
        return service.discoverCharacteristics([CHAR_PRICE_UUID]);
    }).then(function(characteristics) {
        var priceChar = characteristics[0];
        return priceChar.readValue();
    }).then(function(value) {
        var dataView = new DataView(value.buffer);
        var btcPriceFromGatt = dataView.getInt32(0, false);

        fetchDistanceTravelled(peripheral.name, btcPriceFromGatt);
    }).catch(function(err) {
        print("Error: " + err);
    });
});

// Function to compute distance per beacon
async function fetchDistanceTravelled(beaconName, priceFromGatt) {
    let httpRequest = RemoteServiceHttpRequest.create();
    httpRequest.url = 'https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
    httpRequest.headers = {
        'X-CMC_PRO_API_KEY': '<YOUR_KEY>',
        'Accept': 'application/json'
    };

    let response = await internetModule.fetch(httpRequest);
    if (response.status != 200) {
        return;
    }

    let responseJson = await response.json();
    let listings = responseJson.data;
    let bitcoinData = listings.find(coin => coin.symbol === 'BTC');
    if (!bitcoinData) return;

    let currentPrice = bitcoinData.quote.USD.price;

    var timeYears = Math.log(currentPrice / priceFromGatt) / growthRate;
    var timeSeconds = 31556952 * timeYears;
    var metresTravelled = timeSeconds * 299792458;

    distances[beaconName] = metresTravelled;
    print(beaconName + " distance = " + metresTravelled);

    // Once we have all 3, do trilateration
    if (Object.keys(distances).length === 3) {
        var pos = trilaterate(
            beacons.Beacon1, distances.Beacon1,
            beacons.Beacon2, distances.Beacon2,
            beacons.Beacon3, distances.Beacon3
        );
        print("Spectacles estimated position: x=" + pos.x + " y=" + pos.y);
    }
}

// Trilateration math
function trilaterate(p1, r1, p2, r2, p3, r3) {
    // Based on circle intersection formulas
    var A = 2*p2.x - 2*p1.x;
    var B = 2*p2.y - 2*p1.y;
    var C = r1*r1 - r2*r2 - p1.x*p1.x + p2.x*p2.x - p1.y*p1.y + p2.y*p2.y;
    var D = 2*p3.x - 2*p2.x;
    var E = 2*p3.y - 2*p2.y;
    var F = r2*r2 - r3*r3 - p2.x*p2.x + p3.x*p3.x - p2.y*p2.y + p3.y*p3.y;

    var x = (C*E - F*B) / (E*A - B*D);
    var y = (C*D - A*F) / (B*D - A*E);

    return { x: x, y: y };
}
