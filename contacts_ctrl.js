angular.module( 'vrerpsys' )
.controller( 'ContactsCtrl', function (
  $state,
  $interval,
  $scope,
  $http,
  $rootScope,
  DTOptionsBuilder,
  DTColumnDefBuilder,
  $timeout
) {
  var contacts_ctrl = this;
  var host = "";
  storage.get('host', function(error, data) {
    if (error) throw error;
            console.log(data);
    contacts_ctrl.host = data.value;
    contacts_ctrl.api_url = 'http://' + contacts_ctrl.host + '/api/clients/';
    console.log(contacts_ctrl.api_url);
    contacts_ctrl.get_contacts();
  });
  
          console.log('#####################');
          console.log($scope.login_ctrl);
          console.log('#####################');
  
  contacts_ctrl.scroll_wrapper_config = {
    'alwaysShowScrollbar': 1
  };
  contacts_ctrl.dtInstance = {};
  contacts_ctrl.dtOptions = DTOptionsBuilder.newOptions().withPaginationType(
    'full_numbers'
  ).withDisplayLength( 20 ).withLanguage(
    {
      "sEmptyTable": "Nenhum registro encontrado",
      "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
      "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
      "sInfoFiltered": "(Filtrados de _MAX_ registros)",
      "sInfoPostFix": "",
      "sInfoThousands": ".",
      "sLengthMenu": "_MENU_ resultados por página",
      "sLoadingRecords": "Carregando...",
      "sProcessing": "Processando...",
      "sZeroRecords": "Nenhum registro encontrado",
      "sSearch": "Pesquisar",
      "oPaginate": {
          "sNext": "Próximo",
          "sPrevious": "Anterior",
          "sFirst": "Primeiro",
          "sLast": "Último"
      },
      "oAria": {
          "sSortAscending": ": Ordenar colunas de forma ascendente",
          "sSortDescending": ": Ordenar colunas de forma descendente"
      }
    }
  ).withOption( 'scrollY', '75vh' ).withOption(
    'scrollCollapse',
    true
  ).withOption( 'paging', true );

  contacts_ctrl.public_filter_class = 'p';
  contacts_ctrl.public_filter = function( param ){
    contacts_ctrl.public_filter_class = param;
    contacts_ctrl.dtInstance.DataTable.column( 6 ).search( param ).draw();
  };

  contacts_ctrl.dtColumnDefs = [
    DTColumnDefBuilder.newColumnDef( 0 ),
    DTColumnDefBuilder.newColumnDef( 1 ),
    DTColumnDefBuilder.newColumnDef( 2 ),
    DTColumnDefBuilder.newColumnDef( 3 ),
    DTColumnDefBuilder.newColumnDef( 4 ),
    DTColumnDefBuilder.newColumnDef( 5 ).notSortable().withOption(
      'searchable', false
    ),
    DTColumnDefBuilder.newColumnDef( 6 ).notVisible()
  ];

  console.log('ContactsCtrl')

  $scope.$on('$stateChangeSuccess', function(
    event,
    toState,
    toParams,
    fromState,
    fromParams
  ){
    event.preventDefault();
    console.log('current_state',$state.current);
    contacts_ctrl.current_state = $state.current;
  });

  contacts_ctrl.get_contacts = function () {
    var get_contacts = function () {
      $http.get(
        contacts_ctrl.api_url,
        {
          'headers': {
            'Authorization':'Token ' +  $scope.login_ctrl.token,
            'X-CSRFToken': $scope.login_ctrl.token,
            'Accept':'*/*'
          }
        }
      ).then(
        function ( response ) {
          console.log( 'Contacts get OK', response )
          contacts_ctrl.contacts = response.data.results;
          
        }, function ( response ) {
          console.log( 'Contacts get FAIL', response )
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
          get_contacts();
        }
      },
      function ( response ) {
        console.log( 'ctrl_has', response )
      }
    );
  };
  
  contacts_ctrl.object_size = function ( param ) {
    if ( param ) {
      return _.size( param );
    } else {
      return 0;
    }
  };

  contacts_ctrl.new_contact = function () {
    console.log('new_contact');
    $state.go( 'contacts.new' );
  };

  contacts_ctrl.edit_contact = function ( id ) {
    console.log('edit_contact');
    $state.go( 'contacts.edit', { 'contactId': id } );
  };


  contacts_ctrl.remove_contact = function ( id ) {
    var remove_contact = function () {
      $http.delete(
        contacts_ctrl.api_url + id,
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
          contacts_ctrl.get_contacts();
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
          remove_contact();
        }
      },
      function ( response ) {
        console.log( 'ctrl_has', response )
      }
    );
  };
   

  $rootScope.$on( 'Contact_refresh', function () {
    console.log('Contact_refresh');
    contacts_ctrl.get_contacts();
  });
  
  contacts_ctrl.show_messages = false;
});