angular.module( 'vrerpsys' )
.controller( 'ChangePasswordCtrl', function (
  $state,
  $interval,
  $timeout,
  $scope,
  $http
) {
  var change_password_ctrl = this;

  change_password_ctrl.change_password_form = {};

  console.log('ChangePasswordCtrl')

  $scope.$on('$stateChangeSuccess', function(
    event,
    toState,
    toParams,
    fromState,
    fromParams
  ){
    event.preventDefault();
    console.log('current_state',$state.current);
    change_password_ctrl.current_state_name = $state.current.name;
  });

  change_password_ctrl.username = null;
  change_password_ctrl.email = null;
  change_password_ctrl.name = null;
  change_password_ctrl.peers = [];
  change_password_ctrl.host = null;

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
      } else {
        if ( data.username.value ) {
          change_password_ctrl.username = data.username.value;
        }
        if ( data.email.value ) {
          change_password_ctrl.email = data.email.value;
        }
        if ( data.name.value ) {
          change_password_ctrl.name = data.name.value;
        }
        if ( data.peers.value ) {
          change_password_ctrl.peers = data.peers.value;
        }
        if ( data.host.value ) {
          change_password_ctrl.host = data.host.value;
        }
        if ( data.token.value ) {
          change_password_ctrl.token = data.token.value;
        }
        $scope.$apply();
      }
    }
  );

  change_password_ctrl.errors = [];

  var add_error = function ( param ) {
    change_password_ctrl.errors.unshift( param );
    $timeout(
      function () {
        change_password_ctrl.errors.pop();
      },
      5000
    );
  };

  change_password_ctrl.password_confirm = function () {
    if (
      change_password_ctrl.new_password !=
      change_password_ctrl.new_password_confirm
    ) {
      change_password_ctrl.password_mismatch = true;
      console.log( 'Senhas são diferentes' )
    } else {
      change_password_ctrl.password_mismatch = false;
      console.log( 'Senhas ok' )
    }
  };

  change_password_ctrl.change_password = function () {
    console.log('change_password', change_password_ctrl.change_password_form)
    if (
      change_password_ctrl.change_password_form.$valid &&
      !change_password_ctrl.password_mismatch
    ) {
      $http.put(
        'http://' +
        change_password_ctrl.host +
        '/redt/api/auth/change_password',
        {
          'username': change_password_ctrl.username,
          'current_password': change_password_ctrl.current_password,
          'new_password': change_password_ctrl.new_password
        },
        {
          'headers': {
            'Authorization': change_password_ctrl.token,
            'Accept':'*/*'
          }
        }
      ).then(
        function ( response ) {
          console.log( 'change_password put OK', response )

          change_password_ctrl.username = null;
          change_password_ctrl.current_password = null;
          change_password_ctrl.new_password = null;
          $state.go( 'contacts' );
        }, function ( response ) {
          console.log( 'change_password put FAIL', response )
          if ( response.status == 400 ) {
            if ( response.data.error == "password mismatch" ) {
              add_error( 'Senha atual incorreta!' );
            }
            if ( response.data.error == "missing parameters" ) {
              add_error( 'Informação faltando!' );
            }
          } else if ( response.status == 401 ) {
            $scope.login_ctrl.finish_autobahn();
            $state.go( 'login' );
          }
        }
      );
    }
  };

  change_password_ctrl.cancel = function () {
    $state.go( 'contacts' );
  };
});