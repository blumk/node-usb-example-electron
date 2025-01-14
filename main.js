// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
const usb = require('usb');

let windows = []

var Ant = require('ant-plus');
var stick = new Ant.GarminStick2;
var sensor = new Ant.HeartRateSensor(stick);
sensor.on('hbData', function (data) {
    console.log(data.DeviceID, data.ComputedHeartRate);
});
 
stick.on('startup', function () {
    sensor.attach(0, 0);
});

const showDevices = () => {
    const devices = usb.getDeviceList()
    const text = devices.map(d => `pid: ${d.deviceDescriptor.idProduct}, vid: ${d.deviceDescriptor.idVendor}`).join('\n')
    windows.forEach(win => {
        if (win) win.webContents.send('devices', text)
    })
}

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    win.loadFile('index.html')

    // Open the DevTools.
    // win.webContents.openDevTools()

    windows.push(win);
    showDevices();
    if (!stick.open()) {
        console.log('Stick not found!');
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    usb.on('attach', showDevices)
    usb.on('detach', showDevices)

    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    usb.removeListener('attach', showDevices)
    usb.removeListener('detach', showDevices)
    app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
