# utils.py
import math

def rssi_to_distance(rssi: float, tx_power: float, n: float = 2.0) -> float:
    """
    Convert RSSI (in dBm) to distance (in meters) using the log‑distance path‑loss model.

    Args:
        rssi: Received signal strength (negative dBm)
        tx_power: RSSI at 1 m (typical beacon spec)
        n: Path‑loss exponent (2.0 free‑space, 3–4 indoor)

    Returns:
        Distance in meters (float)
    """
    if rssi >= 0:
        raise ValueError("RSSI should be a negative value")

    # d = 10 ^ ((TxPower - RSSI) / (10 * n))
    exponent = (tx_power - rssi) / (10 * n)
    return 10 ** exponent
