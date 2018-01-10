angular.module( 'vrerpsys' )
.controller( 'ContactEditCtrl', function (
  $state,
  $interval,
  $scope,
  $http,
  $rootScope,
  $stateParams,
  $timeout
) {
  var contact_edit_ctrl = this;

  contact_edit_ctrl.contact_edit_form = {};

  console.log('ContactEditCtrl')

  $scope.$on('$stateChangeSuccess', function(
    event,
    toState,
    toParams,
    fromState,
    fromParams
  ){
    event.preventDefault();
    console.log('current_state',$state.current);
    contact_edit_ctrl.current_state = $state.current;
  });

  contact_edit_ctrl.contact = {
    'name': null,
    'cpf': null,
    'rg': null,
    'address': null,
    'cellphone': null,
    'phone': null
  };

  console.log('State Params', $stateParams);
  contact_edit_ctrl.get_contact = function ( id ) {
    var get_contact = function () {
      console.log('get_contact', $stateParams);
      $http.get(
        'http://' +
        $scope.login_ctrl.host +
        '/api/clients/' +
        id,
        {
          'headers': {
            'Authorization':'Token ' +  $scope.login_ctrl.token,
            'X-CSRFToken': $scope.login_ctrl.token,
            'Accept':'*/*'
          }
        }
      ).then(
        function ( response ) {
          console.log( 'Contact get OK', response )
          contact_edit_ctrl.contact = response.data;
        }, function ( response ) {
          console.log( 'Contact get FAIL', response )
          if ( response.status == 401 ) {
            $scope.login_ctrl.logout();
          }
        }
      );
    };

    $scope.login_ctrl.ctrl_has( [ 'token', 'host' ] ).then(
      function ( response ) {
        console.log( 'ctrl_has', response )
        if ( response[ 1 ] ) {
          get_contact();
        }
      },
      function ( response ) {
        console.log( 'ctrl_has', response )
      }
    );
  };

  if ( $stateParams.contactId ) {
    contact_edit_ctrl.get_contact( $stateParams.contactId );
  } else {
    contact_edit_ctrl.contact.Countrycode = '55';
  }

  contact_edit_ctrl.errors = [];

  var add_error = function ( param ) {
    contact_edit_ctrl.errors.unshift( param );
    $timeout(
      function () {
        contact_edit_ctrl.errors.pop();
      },
      5000
    );
  };

  contact_edit_ctrl.submit = function () {
    if ( contact_edit_ctrl.contact_edit_form.$valid ) {
      var submit = function () {
        if ( $stateParams.contactId ) {
          $http.put(
            'http://' +
            $scope.login_ctrl.host +
            '/api/clients/' +
            $stateParams.contactId + '/',
            contact_edit_ctrl.contact,
            {
              'headers': {
                'Authorization':'Token ' +  $scope.login_ctrl.token,
                'X-CSRFToken': $scope.login_ctrl.token,
                'Accept':'*/*'
              }
            }
          ).then(
            function ( response ) {
              console.log( 'Contact put OK', response )
              $rootScope.$broadcast( 'Contact_refresh' );
              $state.go( '^' );
            }, function ( response ) {
              console.log( 'Contact put FAIL', response )
              if ( response.status == 401 ) {
                $scope.login_ctrl.logout();
              } else if ( response.status == 400 ) {
                add_error( 'Erro ao salvar contato!' );
              }
            }
          );
        } else {
          $http.post(
            'http://' +
            $scope.login_ctrl.host +
            '/api/clients/',
            contact_edit_ctrl.contact,
            {
              'headers': {
                'Authorization':'Token ' +  $scope.login_ctrl.token,
                'X-CSRFToken': $scope.login_ctrl.token,
                'Accept':'*/*'
              }
            }
          ).then(
            function ( response ) {
              console.log( 'Contact post OK', response )
              $rootScope.$broadcast( 'Contact_refresh' );
              $state.go( '^' );
            }, function ( response ) {
              console.log( 'Contact post FAIL', response )
              if ( response.status == 401 ) {
                $scope.login_ctrl.logout();
              } else if ( response.status == 400 ) {
                add_error( 'Erro ao adicionar contato!' );
              }
            }
          );
        }
      };

      $scope.login_ctrl.ctrl_has( [ 'token', 'host' ] ).then(
        function ( response ) {
          console.log( 'ctrl_has', response )
          if ( response[ 1 ] ) {
            submit();
          }
        },
        function ( response ) {
          console.log( 'ctrl_has', response )
        }
      );
    }
  };
  contact_edit_ctrl.form_cancel = function () {
    $state.go( '^' );
  };
});