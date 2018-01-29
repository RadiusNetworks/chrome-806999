chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("index.html", {
    id: "mainWindow"
  });
  chrome.power.requestKeepAwake("display");
});
