angular.module( 'vrerpsys' )
.controller( 'SalesCtrl', function (
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
  var sales_ctrl = this;

  sales_ctrl.dtInstance = {};
  sales_ctrl.dtOptions = DTOptionsBuilder.newOptions().withPaginationType(
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

  sales_ctrl.dtColumnDefs = [
    DTColumnDefBuilder.newColumnDef( 0 ).notSortable(),
    DTColumnDefBuilder.newColumnDef( 1 ).notSortable(),
    DTColumnDefBuilder.newColumnDef( 2 ).notSortable(),
    DTColumnDefBuilder.newColumnDef( 3 ).notSortable(),
    DTColumnDefBuilder.newColumnDef( 4 ).notSortable()
  ];

  sales_ctrl.sales_form = {};

  console.log('SalesCtrl')

  $scope.$on('$stateChangeSuccess', function(
    event,
    toState,
    toParams,
    fromState,
    fromParams
  ){
    event.preventDefault();
    console.log('current_state',$state.current);
    sales_ctrl.current_state = $state.current;
  });
  
  sales_ctrl.status = {
    "F":"Finalizada",
    "C":"Cancelada"
  }

  sales_ctrl.get_sales = function ( id ) {
    var get_sales = function () {
      console.log('get_sales');
      $http.get(
        'http://' +
        $scope.login_ctrl.host +
        '/api/sales/',
        {
          'headers': {
            'Authorization':'Token ' +  $scope.login_ctrl.token,
            'X-CSRFToken': $scope.login_ctrl.token,
            'Accept':'*/*'
          }

        }
      ).then(
        function ( response ) {
          console.log( 'Sales get OK', response )
          $scope.login_ctrl.has_missed_sales = false;
          sales_ctrl.sales = response.data.results;
        }, function ( response ) {
          console.log( 'Sales get FAIL', response )
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
          get_sales();
        }
      },
      function ( response ) {
        console.log( 'ctrl_has', response )
      }
    );
  };

  sales_ctrl.go_back = function () {
    $state.go( 'contacts.cash' );
  };
  sales_ctrl.transfer = function ( id ) {
    console.log('transfer');
//    $state.go( 'contacts.cash', { 'salesId': id } );
  };

  sales_ctrl.get_sales();
});