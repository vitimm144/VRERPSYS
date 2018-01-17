angular.module( 'vrerpsys' )
.controller( 'LoginCtrl', function (
  $state,
  $interval,
  $scope,
  $http,
  $timeout
) {
  var login_ctrl = this;

  login_ctrl.login_form = {};

  login_ctrl.package = package;

  login_ctrl.has_missed_calls = null;

  console.log('LoginCtrl')

  login_ctrl.username = null;
  login_ctrl.email = null;
  login_ctrl.name = null;
  login_ctrl.peers = [];
  login_ctrl.host = null;
  login_ctrl.token = null;

  login_ctrl.ctrl_has = function ( keys ) {
    var promise = new Promise(
      function ( resolve, reject ) {
        var call_get_all = false;

        var controller_has_keys = function () {
          for ( var key of keys ) {
            if ( !login_ctrl[ key ] ) {
              call_get_all = true;
            }
          }
        };
        controller_has_keys();

        if ( call_get_all ) {
          call_get_all = false;
          login_ctrl.get_all_storage().then(
            function ( response ) {
              console.log(response)

              controller_has_keys();
              if ( call_get_all ) {
                login_ctrl.logout();
                console.log( 'get_all_storage não encontrou' )
                resolve( [ 'get_all_storage não encontrou', false ] );
              } else {
                console.log( 'get_all_storage encontrou' )
                resolve( [ 'get_all_storage encontrou', true ] );
              }
            },
            function ( response ) {
              console.log(response)
              reject( [ 'Erro get_all_storage', false ] );
            }
          );
        } else {
          console.log( 'não precisou de get_all_storage' )
          resolve( [ 'não precisou de get_all_storage', true ] );
        }
      }
    );
    return promise;
  };

  login_ctrl.get_all_storage = function () {
    var promise = new Promise(
      function( resolve, reject ) {
        console.log( 'get_all_storage' )
        storage.getMany(
          [
            'username',
            'email',
            'name',
            'peers',
            'host',
            'token'
          ],
          function( error, data ) {
            if ( error ) {
              console.log( 'Erro storage login', error )
              reject('Erro get_all_storage');
            } else {
              if ( data.username.value ) {
                login_ctrl.username = data.username.value;
              }
              if ( data.email.value ) {
                login_ctrl.email = data.email.value;
              }
              if ( data.name.value ) {
                login_ctrl.name = data.name.value;
              }
              if ( data.peers.value ) {
                login_ctrl.peers = data.peers.value;
              }
              if ( data.host.value ) {
                login_ctrl.host = data.host.value;
              }
              if ( data.token.value ) {
                login_ctrl.token = data.token.value;
              }
              $scope.$apply();
              resolve('get_all_storage OK');
            }
          }
        );
      }
    );
    return promise;
  };
  login_ctrl.get_all_storage().then(
    function ( response ) { console.log(response) },
    function ( response ) { console.log(response) }
  );

  $scope.$on('$stateChangeSuccess', function(
    event,
    toState,
    toParams,
    fromState,
    fromParams
  ){
    event.preventDefault();
    console.log('current_state',$state.current);
    login_ctrl.current_state_name = $state.current.name;
  });

  login_ctrl.errors = [];

  var add_error = function ( param ) {
    login_ctrl.errors.unshift( param );
    $timeout(
      function () {
        login_ctrl.errors.pop();
      },
      5000
    );
  };

  login_ctrl.login = function () {
    console.log('Login')
    if ( login_ctrl.login_form.$valid ) {
      $http.post(
        'http://' + login_ctrl.host + '/api/auth/token/',
        { 'username': login_ctrl.username, 'password': login_ctrl.password }
      ).then(
        function ( response ) {
          console.log( 'Login post OK', response )

//          login_ctrl.email = response.data.email;
//          login_ctrl.name = response.data.name;
//          login_ctrl.peers = response.data.peers;
          login_ctrl.token = response.data.token;
          console.log( 'Login post OK', login_ctrl.host )

          console.log( 'Login post OK', login_ctrl.username )
          storage.set( 'username', { value: login_ctrl.username } );
//          storage.set( 'email', { value: response.data.email } );
//          storage.set( 'name', { value: response.data.name } );
//          storage.set( 'peers', { value: response.data.peers } );
          storage.set( 'host', { value: login_ctrl.host } );
          storage.set(
            'token',
            { value: response.data.token },
            function ( error ) {
              if ( error ) {
                console.log( 'Erro set storage token', error )
              } else {
                $state.go( 'contacts' );
              }
            }
          );

          login_ctrl.password = null;
        }, function ( response ) {
          console.log( 'Login post FAIL', response )
          if ( response.status == 400 ) {
            if ( response.data.info == 'wrong password!' ) {
              add_error( 'Usuário e/ou senha incorreto(s)!' );
            } else {
              add_error( 'Erro ao autenticar usuário!' );
            }
          }
        }
      );
    }
  };

  login_ctrl.finish_autobahn = function() {
    ipcRenderer.send( 'sfbpresence-stop' );
    if ( autobahn_session ) {
      for( var sub of autobahn_session.subscriptions ) {
        if ( sub[ 0 ] ) {
          console.log( 'Unsubscribing', sub[ 0 ].topic )
          autobahn_session.unsubscribe( sub[ 0 ] ).then(
            function ( gone ) {
              // successfully unsubscribed
              console.log( 'Unsubscribed', gone )
            },
            function ( error ) {
              // unsubscribe failed
              console.log( 'Unsubscribe FAIL', error )
            }
          );
        }
      }
    }

    if ( autobahn_connection && autobahn_connection.isOpen ) {
      autobahn_connection.close();
    }
  };

  login_ctrl.logout = function () {
    login_ctrl.finish_autobahn();

    storage.keys( function ( error, keys ) {
      if ( error ) {
        console.log( 'Erro storage keys', error )
      } else {
        for ( var key of keys ) {
          if ( key != 'host' ) {
            storage.remove( key );
          }
        }
        $state.go( 'login' );
      }
    });
  };

  login_ctrl.change_password = function () {
    $state.go( 'change_password' );
  };

  login_ctrl.show_stock_view = function () {
            console.log('GO to stock');
    $state.go( 'contacts.stock' );
  };

  var dev_tools_count = 0;
  login_ctrl.open_dev_tools = function () {
    dev_tools_count += 1;
    if ( dev_tools_count > 1 ) {
      ipcRenderer.send( 'window-open-dev-tools' );
      dev_tools_count = 0;
    }
  };

  login_ctrl.update_status = '';
  var clear_update_status = null;
  ipcRenderer.on( 'update-status', function (evt, param) {
    console.log('update status', evt, param);
    login_ctrl.update_status = param;
    if ( clear_update_status ) {
      $timeout.cancel( clear_update_status )
    }
    clear_update_status = $timeout(
      function() {
        login_ctrl.update_status = '';
        $scope.$apply();
      }, 5000
    )
    $scope.$apply();
  });
  ipcRenderer.send( 'update-check' );
});