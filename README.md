# Chrome Multiple BLE Advertisements Test

This is a test application to demonstrate problems with multiple BLE advertisements inside of a Chrome App.

[Available in the Chrome Web Store](https://chrome.google.com/webstore/detail/chrome-multiple-ble-adver/ikpgoppmdfdpgejjelkfladjbnecjkgg)

## Expected behavior

The API should handle regular calls to unregister and re-register BLE advertisements, to effectively "rotate" what is being advertised on a regular interval (e.g., every 30 seconds).

## Observed Behavior

It appears that after calling the `chrome.bluetoothLowEnergy.registerAdvertisement` API on a short regular interval (e.g., once every 10 seconds) for a little while the API begins to fail. Initially when the failure occurs the API takes a while to return, but will eventually return with the error: "Operation failed".

Even though the API returns with a failure (and doesn't return an advertisement ID), it appears that the OS has still registered that advertisement under the hood because after the fifth "Operation failed" attempt the API instead returns "An advertisement is already advertising", which means that the maximum number of registered advertisements has been reached.  While the OS believes it has registered advertisements, nothing appears to be being broadcast from the device.

Since the API did not return advertisement IDs, the `chrome.bluetoothLowEnergy.unregisterAdvertisement` API can't be used to try to recover from this state by freeing up one of the advertisement slots.  In addition, the "An advertisement is already advertising" errors are still present after resetting BLE advertising with the `chrome.bluetoothLowEnergy.resetAdvertising` API, so that doesn't resolve the issue either.  Once in this state, a reboot is the only way to recover.
