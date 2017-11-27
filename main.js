const electron = require( 'electron' );
//const storage = require('electron-json-storage');
// Module to control application life.
const app = electron.app;
const Tray = electron.Tray;
const ipcMain = electron.ipcMain;
const Menu = electron.Menu;
const dialog = electron.dialog;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const autoUpdater = require("electron-updater").autoUpdater;
const log = require("electron-log")
const path = require( 'path' );
const url = require( 'url' );
const os = require( 'os' );
let mainWindow;

autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = "info"
autoUpdater.autoDownload = false;


function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow(
    {
      'width': 950,
      'height': 620,  
      'minWidth': 950,
      'minHeight': 620,
      'frame': false,
      'icon': path.join( __dirname, 'assets/images/logo_128.png' ),
      'show': false
    }
  );
  
  // and load the index.html of the app.
  mainWindow.loadURL( url.format ( {
    pathname: path.join( __dirname, 'index.html' ),
    protocol: 'file:',
    slashes: true
  }));

  // Emitted when the window is closed.
  mainWindow.on( 'closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on( 'maximize', function() {
    console.log('MAIN window-maximized')
    mainWindow.webContents.send( 'window-maximized' );
  });

  mainWindow.on( 'unmaximize', function() {
    console.log('MAIN window-unmaximized')
    mainWindow.webContents.send( 'window-unmaximized' );
  });

  mainWindow.on( 'close', function( event ) {
    console.log('MAIN window-closed')
    app.quit();
  });

  mainWindow.once( 'ready-to-show', function () {
    mainWindow.show();
  });
}

function sendUpdateStatus(text) {
    log.info(text);
    mainWindow.webContents.send('update-status', text);
}

function createTray () {
  tray = new Tray( path.join( __dirname, 'assets/images/app_ico_notification2.png' ) );
  const contextMenu = Menu.buildFromTemplate([
    {
      'label': 'Sair',
      'type': 'normal',
      'click': function() {
        app.quit();
      }
    }
  ]);
  tray.setToolTip('VRERP SYS');
  tray.setContextMenu(contextMenu);

  tray.on( 'click', function () {
    if(!mainWindow){
      createWindow();
    } else {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on( 'ready', createWindow );
app.on( 'ready', createTray );

autoUpdater.on( 'checking-for-update', function () {
  log.info( 'Checking for update...' );
  sendUpdateStatus( 'Buscando por atualizações.' );
});
autoUpdater.on( 'update-available', function ( ev, info ) {
  dialog.showMessageBox(
    {
      message:'Atualização disponível. Deseja baixar e instalar agora?',
      buttons: [ 'Sim', 'Não' ]
    },
    function ( response ) {
      if ( response == 0 ) {
        autoUpdater.downloadUpdate()
      }
    }
  )
  //console.log('Update available.');
  sendUpdateStatus( 'Atualização disponível.' );
});
autoUpdater.on( 'update-not-available', function ( ev, info ) {
    //console.logStatusToWindow('Update not available.');
    sendUpdateStatus( 'Esta versão já é a mais recente.' );
});
autoUpdater.on( 'error', function ( ev, err ) {
  dialog.showMessageBox(
    {
      message: 'Erro ao atualizar.',
      buttons: [ "OK" ]
    }
  );
  if ( err ) {
    dialog.showMessageBox(
      {
        message: err,
        buttons: [ "OK" ]
      }
    )
  }  
  throw err;
  console.log( 'Error in auto-updater.' );
});
autoUpdater.on( 'download-progress', function ( progressObj ) {
  log.info(progressObj);
  let log_message = "Baixando atualização. " +
    progressObj.percent.toFixed( 2 ) + '%' +
    ' ( ' +
    ( progressObj.transferred / 1048576 ).toFixed( 2 ) +
    " de " +
    ( progressObj.total / 1048576 ).toFixed( 2 ) + ' MB, ' +
    ( progressObj.bytesPerSecond / 1024 ).toFixed( 2 ) + 'kB/s' +
    ' )';
  sendUpdateStatus( log_message );
});

autoUpdater.on( 'update-downloaded', function ( ev, info ) {

  sendUpdateStatus(
    'Atualização baixada com sucesso. O VRERP SYS será fechado em 5 segundos.'
  );
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout( function() {
    autoUpdater.quitAndInstall();  
  }, 5000);
});

// Quit when all windows are closed.
app.on( 'window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
//  if ( process.platform !== 'darwin' ) {
//    tray.destroy();
//    app.quit();
//  };
});

app.on( 'activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if ( mainWindow === null ) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on( 'window-close', function() {
  console.log('window-close')
  mainWindow.hide();
});

ipcMain.on( 'window-minimize', function() {
  console.log('window-minimize')
  mainWindow.minimize();
});

ipcMain.on( 'window-maximize', function() {
  console.log('window-maximize')
  mainWindow.maximize();
});

ipcMain.on( 'window-unmaximize', function() {
  console.log('window-unmaximize')
  mainWindow.unmaximize();
});

ipcMain.on( 'window-focus', function() {
  console.log('window-focus')
  mainWindow.show();
  mainWindow.focus();
});
 
ipcMain.on( 'window-open-dev-tools', function( event ) {
  //##########################################
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  //##########################################

});

ipcMain.on( 'update-check', function( event ) {
  log.info( 'update-check' );
  autoUpdater.checkForUpdates();
});
