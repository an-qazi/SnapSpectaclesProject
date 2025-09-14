// @input Asset.InternetModule internetModule
// @input Asset.BluetoothCentralModule bluetoothModule

var internetModule = script.internetModule;
var bluetooth = script.bluetoothModule;

// UUIDs must match your Android GATT server
var SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
var CHAR_PRICE_UUID = "abcdef12-3456-7890-abcd-ef1234567890";

// Annual growth assumption: 49% CAGR
var growthRate = Math.log(1.49); // per year

// Step 1. Scan for peripherals
var scan = bluetooth.scanForPeripheralsWithServices([SERVICE_UUID]);

scan.onDiscovered.add(function(peripheral) {
    print("Discovered peripheral: " + peripheral.name);

    // Step 2. Connect
    peripheral.connect().then(function() {
        print("Connected to peripheral: " + peripheral.name);

        // Step 3. Discover services + characteristics
        return peripheral.discoverServices([SERVICE_UUID]);
    }).then(function(services) {
        var service = services[0];
        return service.discoverCharacteristics([CHAR_PRICE_UUID]);
    }).then(function(characteristics) {
        var priceChar = characteristics[0];

        // Step 4. Read BTC price characteristic
        return priceChar.readValue();
    }).then(function(value) {
        // GATT server encoded the price as 4-byte Int
        var dataView = new DataView(value.buffer);
        var btcPriceFromGatt = dataView.getInt32(0, false); // big-endian

        print("BTC price from GATT: " + btcPriceFromGatt);

        // Only after GATT fetch → do HTTP fetch
        fetchDistanceTravelled(btcPriceFromGatt);
    }).catch(function(err) {
        print("Error during GATT fetch: " + err);
    });
});

// Function to fetch from CoinMarketCap
async function fetchDistanceTravelled(priceFromGatt) {
    let httpRequest = RemoteServiceHttpRequest.create();
    httpRequest.url = 'https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
    httpRequest.headers = {
        'X-CMC_PRO_API_KEY': 'd7f86f4b-0a0d-4396-8631-0e815365f119',
        'Accept': 'application/json'
    };

    let response = await internetModule.fetch(httpRequest);
    if (response.status != 200) {
        print('Failure: response not successful');
        return;
    }

    let contentTypeHeader = response.headers.get('content-type');
    if (!contentTypeHeader.includes('application/json')) {
        print('Failure: wrong content type in response');
        return;
    }

    let responseJson = await response.json();
    let listings = responseJson.data;

    let bitcoinData = listings.find(coin => coin.symbol === 'BTC');
    if (!bitcoinData) {
        print('Bitcoin data not found in the listings');
        return;
    }

    let currentPrice = bitcoinData.quote.USD.price;


    // Step 5. Compute time elapsed
    var timeYears = Math.log(currentPrice / priceFromGatt) / growthRate;
    var timeSeconds = 31556952 * timeYears;

    // Step 6. Compute distance travelled
    var metresTravelled = timeSeconds * 299792458;

    
}
