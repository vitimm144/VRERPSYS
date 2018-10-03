angular.module( 'vrerpsys' )
.controller( 'CashCtrl', function (
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
  var cash_ctrl = this;

  cash_ctrl.dtInstance = {};
  cash_ctrl.products = [];
  cash_ctrl.products_for_sale = [];
   $scope.$on('$stateChangeSuccess', function(
    event,
    toState,
    toParams,
    fromState,
    fromParams
  ){
    event.preventDefault();
    console.log('current_state',$state.current);
    cash_ctrl.current_state = $state.current;
  });


  cash_ctrl.dtOptions = DTOptionsBuilder.newOptions().withPaginationType(
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

  cash_ctrl.dtColumnDefs = [
    DTColumnDefBuilder.newColumnDef( 0 ).notSortable(),
    DTColumnDefBuilder.newColumnDef( 1 ).notSortable(),
    DTColumnDefBuilder.newColumnDef( 2 ).notSortable(),
    DTColumnDefBuilder.newColumnDef( 3 ).notSortable()
  ];

  cash_ctrl.select_config = {
    'options': cash_ctrl.products,
    'placeholder': 'Digite um código ou um produto',
    'show_fields': [ 'description', 'code' ],
    'filter_fields': [ 'description', 'code' ],
    'out_fields': [ 'id' ],
    'min_checkbox': 0,
    'multiple': true,
    'filter_mode': 'contains'
  };
  cash_ctrl.get_products = function ( id ) {
    var get_products = function () {
      console.log('get_products');
      $http.get(
        'http://' +
        $scope.login_ctrl.host +
        '/api/products/',
        {
          'headers': {
            'Authorization':'Token ' +  $scope.login_ctrl.token,
            'X-CSRFToken': $scope.login_ctrl.token,
            'Accept':'*/*'
          }

        }
      ).then(
        function ( response ) {
          console.log( 'Products get OK', response )
          $scope.login_ctrl.has_missed_products = false;
          cash_ctrl.products = response.data.results;
        }, function ( response ) {
          console.log( 'Products get FAIL', response )
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
          get_products();
        }
      },
      function ( response ) {
        console.log( 'ctrl_has', response )
      }
    );
  };

  cash_ctrl.paymentModes = [
    {
      'mode': 'D',
      'description': 'Débito'
    }, {
      'mode': 'CA',
      'description': 'Crédito à Vista'
    }, {
      'mode': 'CP',
      'description': 'Crédito Parcelado'
    }, {
      'mode': 'A',
      'description': 'À Vista'
    }, {
      'mode': 'CHA',
      'description': 'Cheque à Vista'
    }, {
      'mode': 'CHP',
      'description': 'Cheque Parcelado'
    }, {
      'mode': 'VP',
      'description': 'Vale Parcelado'
    }, {
      'mode': 'V',
      'description': 'Vale'
    }
  ];

  cash_ctrl.get_products();

  cash_ctrl.sell = {
    'id': null,
    'products': [],
    'payments': [],
    'status': 0,
    'saleswoman': null,
    'client': null,
    'deduction': 0
  };

  cash_ctrl.addProduct = function(){
    cash_ctrl.sell.products.push({
      'id': cash_ctrl.sell.products.length+1,
      'product': cash_ctrl.newProduct.product,
      'amount': cash_ctrl.newProduct.amount
    });
    cash_ctrl.newProduct = null;
  }

  function pushPayment() {
    cash_ctrl.sell.payments.push({
      'id': cash_ctrl.sell.payments.length+1,
      'mode': cash_ctrl.newPayment.mode,
      'plots_amount': 1,
      'value': cash_ctrl.newPayment.value
    });
    cash_ctrl.newPayment = {};
  };

  cash_ctrl.addPayment = function(){
    cash_ctrl.newPayment.plots = [];

    if(cash_ctrl.newPayment.mode == 'CHP'){
      $('#plotsModal').modal('show');
    }else{
      pushPayment();
    }
  };

  cash_ctrl.addPlot = function(){
    cash_ctrl.newPayment.plots.push({
      'date': null,
      'plot': cash_ctrl.newPayment.plots.length+1,
      'ploted_value': 0
    });
  };

  $('#plotsModal').on('hide.bs.modal', function(e){
    cash_ctrl.newPayment.value = 0;
    cash_ctrl.newPayment.plots.forEach(function(plot) {
      cash_ctrl.newPayment.value = cash_ctrl.newPayment.value + plot.ploted_value;
    });
    pushPayment();
  });

});