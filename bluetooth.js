// Object to track registered advertisements by their advertisement ID
let advertisementsById = {};

// BLE AltBeacon advertisement with the following identifiers:
// UUID: ABABABAB-ABAB-ABAB-ABAB-ABABABABABAB
// Major: 867
// Minor: 1
let advertisement1 = {
  type: "broadcast",
  manufacturerData: [{
    id: 280,
    data: [190, 172, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 3, 99, 0, 1, 196, 0]
  }]
};

// BLE AltBeacon advertisement with the following identifiers:
// UUID: ABABABAB-ABAB-ABAB-ABAB-ABABABABABAB
// Major: 867
// Minor: 2
let advertisement2 = {
  type: "broadcast",
  manufacturerData: [{
    id: 280,
    data: [190, 172, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 171, 3, 99, 0, 2, 196, 0]
  }]
};

function rotateAdvertisement(rotatorId, advertisement) {
  console.log(`[Rotator ${rotatorId}] Rotating advertisement`);
  // Look up existing advertisement for the current rotator
  if (!chrome.bluetoothLowEnergy) {
    console.log(`Bluetooth not supported on this platform`);
    return;
  }
  let currentAdvertisementId = advertisementsById[rotatorId];
  if (currentAdvertisementId) {
    // Unregister current advertisement if there is one
    console.log(`[Rotator ${rotatorId}] Unregistering advertisement ${currentAdvertisementId}`)
    chrome.bluetoothLowEnergy.unregisterAdvertisement(currentAdvertisementId, function() {
      if (chrome.runtime.lastError) {
        console.error(`[Rotator ${rotatorId}] Error unregistering advertisement (ID: ${currentAdvertisementId}): ${chrome.runtime.lastError.message}`);
        return;
      }
      console.log(`[Rotator ${rotatorId}] Advertisement unregistered successfully, registering new advertisement`);
      // Remove old advertisment from object
      delete advertisementsById[rotatorId];
      chrome.bluetoothLowEnergy.registerAdvertisement(advertisement, function(advertisementId) {
        if (chrome.runtime.lastError) {
          console.error(`[Rotator ${rotatorId}] Error registering advertisement (ID: ${advertisementId}): ${chrome.runtime.lastError.message}`);
          return;
        }
        console.log(`[Rotator ${rotatorId}] Successfully registered advertisement (ID: ${advertisementId})`);
        advertisementsById[rotatorId] = advertisementId;
      });
    });
  }
  else {
    // No existing advertisement, start fresh with a new one
    console.log(`[Rotator ${rotatorId}] No current advertisement for rotator, registering new advertisement`);
    chrome.bluetoothLowEnergy.registerAdvertisement(advertisement, function(advertisementId) {
      if (chrome.runtime.lastError) {
        console.error(`[Rotator ${rotatorId}] Error registering advertisement: ${chrome.runtime.lastError.message}`);
        return;
      }
      console.log(`[Rotator ${rotatorId}] Successfully registered advertisement`);
      advertisementsById[rotatorId] = advertisementId;
    });
  }
}

function startAdvertising(rotationIntervalSeconds) {
  // Call initial advertisement rotations
  rotateAdvertisement(1, advertisement1);
  setTimeout(function() {
    rotateAdvertisement(2, advertisement2);
  }, rotationIntervalSeconds * 1000);

  // Set up two advertisement rotating intervals
  setInterval(function() {
    rotateAdvertisement(1, advertisement1);
  }, rotationIntervalSeconds * 1000 * 2);
  // Stagger rotators so they don't rotate at the same time
  setTimeout(function() {
    setInterval(function() {
      rotateAdvertisement(2, advertisement2);
    }, rotationIntervalSeconds * 1000 * 2)
  }, rotationIntervalSeconds * 1000);
}

window.onload = function() {
  document.getElementById("form").addEventListener("submit", function(e) {
    e.preventDefault();
    let rotationIntervalSeconds = document.getElementById("rotationIntervalSeconds").value
    console.log(`Starting advertising with rotation interval of ${rotationIntervalSeconds} seconds`);
    startAdvertising(rotationIntervalSeconds);
    document.getElementById("rotationIntervalSeconds").disabled = true
    document.getElementById("submit").disabled = true;
  });
}
