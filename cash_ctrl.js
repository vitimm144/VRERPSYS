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
  cash_ctrl.subTotalProducts = 0;
  cash_ctrl.post_url = 'api/sales/';
  
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

  $scope.sell_products = [];
  $scope.payments = [];
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
  
  var headers = {
    'headers': {
      'Authorization':'Token ' +  $scope.login_ctrl.token,
      'X-CSRFToken': $scope.login_ctrl.token,
      'Accept':'*/*'
    }
  };
    
//  cash_ctrl.select_config = {
//    'options': cash_ctrl.products,
//    'placeholder': 'Digite um código ou um produto',
//    'show_fields': [ 'description', 'code' ],
//    'filter_fields': [ 'description', 'code' ],
//    'out_fields': [ 'id' ],
//    'min_checkbox': 0,
//    'multiple': true,
//    'filter_mode': 'contains'
//  };
  
  cash_ctrl.get_clients = function ( ) {
    var get_clients = function () {
      console.log('get_clients');
      $http.get(
        'http://' + $scope.login_ctrl.host + '/api/clients/',
        headers
      ).then(
        function ( response ) {
          console.log( 'Client get OK', response )
          $scope.login_ctrl.has_missed_clients = false;
          cash_ctrl.clients = response.data.results;
        }, function ( response ) {
          console.log( 'Clients get FAIL', response )
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
          get_clients();
        }
      },
      function ( response ) {
        console.log( 'ctrl_has', response )
      }
    );
  };
  
  cash_ctrl.get_employees = function ( ) {
    var get_employees = function () {
      console.log('get_employees');
      $http.get(
        'http://' + $scope.login_ctrl.host + '/api/employees/',
        headers
      ).then(
        function ( response ) {
          console.log( 'Employees get OK', response )
          $scope.login_ctrl.has_missed_employees = false;
          cash_ctrl.employees = response.data.results;
        }, function ( response ) {
          console.log( 'Employees get FAIL', response )
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
          get_employees();
        }
      },
      function ( response ) {
        console.log( 'ctrl_has', response )
      }
    );
  };
  
  cash_ctrl.get_products = function ( ) {
    var get_products = function () {
      console.log('get_products');
      $http.get(
        'http://' + $scope.login_ctrl.host + '/api/products/',
        headers
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
  cash_ctrl.get_employees();
  cash_ctrl.get_clients();

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
    
    console.log('ADD PRODUCT');
    console.log(cash_ctrl.newProduct);
    $scope.sell_products.push({
      'id': $scope.sell_products.length+1,
      'product': cash_ctrl.newProduct.product.id,
      'amount': cash_ctrl.newProduct.amount,
      'price':cash_ctrl.newProduct.product.products[0].id,
      'price_value':cash_ctrl.newProduct.product.products[0].value
    });
    cash_ctrl.newProduct = null;
  }

  function pushPayment() {
    cash_ctrl.sell.payments.push({
      'id': cash_ctrl.sell.payments.length+1,
      'mode': cash_ctrl.newPayment.mode,
      'plots_amount': cash_ctrl.newPayment.plots_amount || 1,
      'value': cash_ctrl.newPayment.value,
      'plots': cash_ctrl.newPayment.plots
    });
    cash_ctrl.newPayment = {};
  };

  cash_ctrl.addPayment = function(){
    cash_ctrl.newPayment.plots = [];
    mode = cash_ctrl.newPayment.mode; 
    if(mode == 'CHP' || mode == 'CP' || mode == 'VP'){
      $('#plotsModal').modal('show');
    }else{
      pushPayment();
    }
  };
  
  $scope.$watchCollection('sell_products', function(newValue, oldValue){
      console.log('Product collection changed');
      if(newValue !== oldValue){
        console.log('old != new');
        cash_ctrl.subTotalProducts = 0; 
        angular.forEach($scope.sell_products, function(product){
          console.log(product);
          console.log(parseFloat(product.price_value));
          console.log(product.amount);
          cash_ctrl.subTotalProducts += (parseFloat(product.price_value) * parseFloat(product.amount));
        });
        
        console.log(cash_ctrl.subTotalProducts);
        
      }
  });
  
  $scope.onParcelChange = function (){
      console.log('onparcelchange');
    var date = new Date;
    var parcel = cash_ctrl.newPayment.value / cash_ctrl.parcel_length;
    for( var i = 0; i < cash_ctrl.parcel_length; i++){
      date.setMonth(date.getMonth() + 1)
      cash_ctrl.newPayment.plots.push({
      'date': new Date(date.toDateString()),
      'plot': cash_ctrl.newPayment.plots.length+1,
      'ploted_value': parcel
    });
    }
  };
  $scope.onDeductionChange = function() {
      console.log('onDeductionChange');
  };
  

  cash_ctrl.addPlot = function(){
    cash_ctrl.newPayment.plots.push({
      'date': null,
      'plot': cash_ctrl.newPayment.plots.length+1,
      'ploted_value': 0
    });
  };

  $('#plotsModal').on('hide.bs.modal', function(e){
    console.log('dismiss modal');
    cash_ctrl.newPayment.value = 0;
    cash_ctrl.newPayment.plots.forEach(function(plot) {
      cash_ctrl.newPayment.value = cash_ctrl.newPayment.value + plot.ploted_value;
    });
    cash_ctrl.newPayment.plots_amount = cash_ctrl.newPayment.plots.length;
    pushPayment();
    $scope.$apply();
    console.log(cash_ctrl.sell);
  });
  
  cash_ctrl.can_submit = function(){
    var can_submit = false;
    if ($scope.sell_products.length > 0 && $scope.payments.length > 0 ){
      can_submit = true; 
    }
    
    return can_submit;
    
  };
  
  cash_ctrl.submit = function(){
    
    cash_ctrl.sell.products = $scope.sell_products;
    cash_ctrl.sell.payments = $scope.payments;
    
    if (cash_ctrl.can_submit()){
        console.log('SUBMIT');
        console.log(cash_ctrl.sell);
      $http.post(
        'http://' +
        $scope.login_ctrl.host +
        cash_ctrl.post_url,
        cash_ctrl.sell,
        headers
      ).then(
        function ( response ) {
          console.log( 'Stock transfer post OK', response )
          $rootScope.$broadcast( 'Stock_refresh' );
          $state.go( 'contacts.stock' );
        }, function ( response ) {
          console.log( 'Stock transfer  post FAIL', response )
          if ( response.status == 401 ) {
            $scope.login_ctrl.logout();
          } else if ( response.status == 400 ) {
            add_error( 'Erro ao transferir produto!' );
          }
        }
      );
    }
    
    
  };

});