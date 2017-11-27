angular.module( 'vrerpsys' )
.controller( 'RecentCallsCtrl', function (
  $state,
  $interval,
  $scope,
  $http,
  $rootScope,
  $stateParams,
  $timeout,
  DTOptionsBuilder,
  DTColumnDefBuilder
) {
  var recent_calls_ctrl = this;

  recent_calls_ctrl.dtInstance = {};
  recent_calls_ctrl.dtOptions = DTOptionsBuilder.newOptions().withPaginationType(
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
  ).withOption( 'paging', true ).withOption('order', []);

  recent_calls_ctrl.dtColumnDefs = [
    DTColumnDefBuilder.newColumnDef( 0 ).notSortable(),
    DTColumnDefBuilder.newColumnDef( 1 ).notSortable(),
    DTColumnDefBuilder.newColumnDef( 2 ).notSortable(),
    DTColumnDefBuilder.newColumnDef( 3 ).notSortable(),
    DTColumnDefBuilder.newColumnDef( 4 ).notSortable()
  ];

  recent_calls_ctrl.recent_calls_form = {};

  console.log('RecentCallsCtrl')

  $scope.$on('$stateChangeSuccess', function(
    event,
    toState,
    toParams,
    fromState,
    fromParams
  ){
    event.preventDefault();
    console.log('current_state',$state.current);
    recent_calls_ctrl.current_state = $state.current;
  });

  recent_calls_ctrl.get_calls = function ( id ) {
    var get_calls = function () {
      console.log('get_calls');
      $http.get(
        'http://' +
        $scope.login_ctrl.host +
        '/redt/api/cdr/',
        {
          'headers': {
            'Authorization': $scope.login_ctrl.token,
            'Accept':'*/*'
          },
          'params': {
            'limit': 30,
            'peers': $scope.login_ctrl.peers
          }
        }
      ).then(
        function ( response ) {
          console.log( 'Calls get OK', response )
          $scope.login_ctrl.has_missed_calls = false;
          recent_calls_ctrl.calls = response.data;
        }, function ( response ) {
          console.log( 'Calls get FAIL', response )
          if ( response.status == 401 ) {
            $scope.login_ctrl.logout();
          }
        }
      );
    };

    $scope.login_ctrl.ctrl_has( [ 'token', 'peers', 'host' ] ).then(
      function ( response ) {
        console.log( 'ctrl_has', response )
        if ( response[ 1 ] ) {
          get_calls();
        }
      },
      function ( response ) {
        console.log( 'ctrl_has', response )
      }
    );
  };

  recent_calls_ctrl.go_back = function () {
    $state.go( '^' );
  };

  recent_calls_ctrl.get_calls();
});