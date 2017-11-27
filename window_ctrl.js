angular.module( 'vrerpsys' )
.controller( 'WindowCtrl', function (
  $state,
  $interval,
  $scope,
  $http
) {
  var window_ctrl = this;

  console.log('WindowCtrl')

  window_ctrl.is_maximized = false;

  window_ctrl.minimize = function () {
    console.log('window_ctrl.minimize')
    ipcRenderer.send( 'window-minimize' );
  };
  window_ctrl.maximize = function () {
    console.log('window_ctrl.maximize')
    ipcRenderer.send( 'window-maximize' );
    window_ctrl.is_maximized = true;
  };
  window_ctrl.restore = function () {
    console.log('window_ctrl.restore')
    ipcRenderer.send( 'window-unmaximize' );
    window_ctrl.is_maximized = false;
  };
  window_ctrl.close = function () {
    console.log('window_ctrl.close')
    ipcRenderer.send( 'window-close' );
  };

  ipcRenderer.on( 'window-maximized', function () {
    console.log('CTRL window-maximized');
    window_ctrl.is_maximized = true;
    $scope.$apply();
  });

  ipcRenderer.on( 'window-unmaximized', function () {
    console.log('CTRL window-unmaximized');
    window_ctrl.is_maximized = false;
    $scope.$apply();
  });
});