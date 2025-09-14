package com.example.minibeacon

import android.Manifest
import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.os.Bundle
import android.os.ParcelUuid
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.core.app.ActivityCompat
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.nio.ByteBuffer
import java.util.*
import kotlin.concurrent.fixedRateTimer

class MainActivity : ComponentActivity() {

    private var advertiser: BluetoothLeAdvertiser? = null
    private var gattServer: BluetoothGattServer? = null
    private lateinit var btcCharacteristic: BluetoothGattCharacteristic

    // Custom UUIDs
    private val SERVICE_UUID: UUID = UUID.fromString("12345678-1234-5678-1234-56789abcdef0")
    private val CHAR_PRICE_UUID: UUID = UUID.fromString("abcdef12-3456-7890-abcd-ef1234567890")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request runtime permissions
        val perms = arrayOf(
            Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.ACCESS_FINE_LOCATION
        )
        ActivityCompat.requestPermissions(this, perms, 1)

        val adapter = BluetoothAdapter.getDefaultAdapter()
        if (adapter == null || !adapter.isEnabled) {
            Log.e("BLE", "Bluetooth not available or disabled")
            return
        }

        val manager = getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        gattServer = manager.openGattServer(this, gattServerCallback)

        // Create a GATT service
        val service = BluetoothGattService(SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)

        // Bitcoin price characteristic
        btcCharacteristic = BluetoothGattCharacteristic(
            CHAR_PRICE_UUID,
            BluetoothGattCharacteristic.PROPERTY_READ,
            BluetoothGattCharacteristic.PERMISSION_READ
        )

        // Add characteristic to service
        service.addCharacteristic(btcCharacteristic)
        gattServer?.addService(service)

        // Start advertising
        advertiser = adapter.bluetoothLeAdvertiser
        startAdvertising()

        // Periodically update BTC price every 30s
        fixedRateTimer("btcTimer", initialDelay = 0L, period = 30_000L) {
            updateBitcoinPrice()
        }
    }

    private fun startAdvertising() {
        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(true) // ✅ must be connectable for GATT
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(true)
            .addServiceUuid(ParcelUuid(SERVICE_UUID))
            .build()

        advertiser?.startAdvertising(settings, data, object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
                Log.d("BLE", "Advertising GATT service: $SERVICE_UUID")
            }

            override fun onStartFailure(errorCode: Int) {
                Log.e("BLE", "Advertising failed: $errorCode")
            }
        })
    }

    private fun updateBitcoinPrice() {
        Thread {
            try {
                val btcPrice = fetchBitcoinPrice() ?: 0
                val priceBytes = ByteBuffer.allocate(4).putInt(btcPrice).array()
                btcCharacteristic.value = priceBytes
                Log.d("BLE", "Updated BTC price: $btcPrice")
            } catch (e: Exception) {
                Log.e("BLE", "Failed to fetch BTC price", e)
            }
        }.start()
    }

    private fun fetchBitcoinPrice(): Int? {
        val client = OkHttpClient()
        val apiKey = getString(R.string.cmc_api_key)
        val request = Request.Builder()
            .url("https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=1&convert=USD")
            .addHeader("Accepts", "application/json")
            .addHeader("X-CMC_PRO_API_KEY", apiKey) // ⚠️ Replace with your real API key
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                Log.e("BLE", "API request failed: $response")
                return null
            }

            val body = response.body?.string() ?: return null
            val json = JSONObject(body)
            val dataArray = json.getJSONArray("data")
            val bitcoin = dataArray.getJSONObject(0)
            val quote = bitcoin.getJSONObject("quote")
            val usd = quote.getJSONObject("USD")
            val price = usd.getDouble("price")

            return price.toInt() // simplify to integer
        }
    }

    private val gattServerCallback = object : BluetoothGattServerCallback() {
        override fun onConnectionStateChange(device: BluetoothDevice, status: Int, newState: Int) {
            Log.d("BLE", "Device ${device.address} connection state: $newState")
        }

        override fun onCharacteristicReadRequest(
            device: BluetoothDevice,
            requestId: Int,
            offset: Int,
            characteristic: BluetoothGattCharacteristic
        ) {
            if (characteristic.uuid == CHAR_PRICE_UUID) {
                Log.d("BLE", "Read request from ${device.address}")
                gattServer?.sendResponse(
                    device,
                    requestId,
                    BluetoothGatt.GATT_SUCCESS,
                    offset,
                    characteristic.value
                )
            }
        }
    }
}
