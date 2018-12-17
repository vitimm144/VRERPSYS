angular.module( 'vrerpsys' )
.controller( 'CashCtrl', function (
  $state,
  $interval,
  $scope,
  $window,
  $http,
  $rootScope,
  $stateParams,
  $timeout,
  DTOptionsBuilder,
  DTColumnDefBuilder
) {
  var cash_ctrl = this;
  var fs = require('fs');
  var printer = require('printer');
  var table = require('text-table');
  var headers = {
    'headers': {
      'Authorization':'Token ' +  $scope.login_ctrl.token,
      'X-CSRFToken': $scope.login_ctrl.token,
      'Accept':'*/*'
    }
  };
  
  cash_ctrl.dtInstance = {};
  cash_ctrl.products = [];
  cash_ctrl.products_for_sale = [];
  cash_ctrl.subTotalProducts = 0;
  cash_ctrl.post_url = '/api/sales/';
  $scope.sell_products = [];
  $scope.sell_payments = [];
  $scope.payments = [];
  $scope.salePrint = '';
  cash_ctrl.deduction_value = 0;
  cash_ctrl.payment_total = 0;
  cash_ctrl.total_pay = 0;
  cash_ctrl.money_change = 0;
  cash_ctrl.money_missing = 0;
  
  console.log(printer.getDefaultPrinterName());
  console.log(printer.getDefaultPrinterName());
  console.log('SUPORTED PRINT FORMATS');
  console.log(printer.getSupportedPrintFormats());
  printHeader = `

  Cabeçalho entra aqui! 

  `  + '\n\n';
  
  printFooter = `

  Rodapé entra aqui! 

  ` + '\n\n';
  
  cash_ctrl.createSalePrint = function(){
    var salePrint = [];
    charCodeLatina(salePrint);
    bold(salePrint, printHeader);
    lineFeed(salePrint, 2);
    
    var t = [];
    t.push([ "Cod:", "Prod:", "qtd:", "Unid:" , "Total:" ]);
    
    angular.forEach($scope.sell_products, function(product){
        console.log(product);
        total = (parseFloat(product.price_value) * parseFloat(product.amount))
        total = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        price = parseFloat(product.price_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        t.push([product.code, product.description, product.amount, price, total])
    });
    
    console.log(t);
    tproduct = table(t, {align:[1, 1, 1, 1, 1]});
    
    normal(salePrint, tproduct)
    lineFeed(salePrint, 1);
    alignRight(salePrint);
    underline2(
      salePrint,
      "Total: " + parseFloat(cash_ctrl.subTotalProducts).toLocaleString(
        'pt-BR',
        { style: 'currency', currency: 'BRL' }
      )
    )
    
    lineFeed(salePrint, 2);
    alignCenter(salePrint)
    bold(salePrint, printFooter);
    fullCut(salePrint)
    
    return salePrint;
  };
  
  $scope.sendPrint = function() {
    var info = cash_ctrl.createSalePrint(); 
    console.log(info);
//    var info = 'texto'; 
    printer.printDirect({
      data: new Buffer(info),
      type: 'RAW',
      success: function (jobID) {
        console.log("ID: " + jobID);
      },
      error: function (err) {
        console.log('printer module error: '+err);
        throw err;
      }
    });
  };

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
    'status': 'F',
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
      'description': cash_ctrl.newProduct.product.description,
      'code': cash_ctrl.newProduct.product.code,
      'amount': cash_ctrl.newProduct.amount,
      'price':cash_ctrl.newProduct.product.products[0].id,
      'price_value':cash_ctrl.newProduct.product.products[0].value
    });
    cash_ctrl.newProduct = null;
  }

  function pushPayment() {
    console.log('push payment');
    $scope.sell_payments.push({
      'id': $scope.sell_payments.length+1,
      'mode': cash_ctrl.newPayment.mode,
      'plots_amount': cash_ctrl.newPayment.plots_amount || 1,
      'value': cash_ctrl.newPayment.value,
      'plots': cash_ctrl.newPayment.plots
    });
    cash_ctrl.newPayment = {};
    cash_ctrl.payment_total = 0;
    
  };
  
  cash_ctrl.setMoneyChange = function(){
    console.log('setMoneyChange');
    cash_ctrl.money_change = 0;
    if (cash_ctrl.payment_total > cash_ctrl.total_pay && cash_ctrl.payment_total != 0){
      cash_ctrl.money_change = (
        parseFloat(cash_ctrl.payment_total) - parseFloat(cash_ctrl.total_pay)
      ).toFixed(2);
    }
    if (cash_ctrl.money_change < 0){
      console.log('money change < 0');
      cash_ctrl.money_change = 0;
    } 
  };
  
  cash_ctrl.setMoneyMissing = function(){
      console.log('setMoneyMissing');
    cash_ctrl.money_missing = 0;
    if (cash_ctrl.payment_total < cash_ctrl.total_pay){
      cash_ctrl.money_missing = (
        parseFloat(cash_ctrl.total_pay) - parseFloat(cash_ctrl.payment_total)
      ).toFixed(2);
    }
    if (cash_ctrl.money_missing < 0){
      console.log('money missing < 0');
      cash_ctrl.money_missing = 0;
    }
  };
  
  cash_ctrl.setTotalPay = function(){
    console.log('setTotalPay');
    cash_ctrl.total_pay = (
      parseFloat(cash_ctrl.subTotalProducts) - parseFloat(cash_ctrl.deduction_value)
    ).toFixed(2);
  };

  cash_ctrl.setPaymentTotal = function(){
    console.log('setPaymentTotal');
    cash_ctrl.payment_total = 0;
    angular.forEach($scope.sell_payments, function(payment){
      console.log(payment);
      cash_ctrl.payment_total += parseFloat(payment.value);
    });
  };

  cash_ctrl.addPayment = function(){
    console.log('Add payment');
    cash_ctrl.newPayment.plots = [];
    mode = cash_ctrl.newPayment.mode; 
    if(mode == 'CHP' || mode == 'CP' || mode == 'VP'){
      $('#plotsModal').modal('show');
    }else{
      pushPayment();
    }
  };
  
  $scope.$watchCollection('sell_payments', function(newValue, oldValue){
    if(newValue !== oldValue){
      console.log('Payment collection changed');
      cash_ctrl.setPaymentTotal();
      cash_ctrl.setTotalPay();
      cash_ctrl.setMoneyChange();
      cash_ctrl.setMoneyMissing();
      $window.setTimeout(function() {$scope.$apply();},1)
    }
  });
  
  $scope.$watchCollection('sell_products', function(newValue, oldValue){
      if(newValue !== oldValue){
        console.log('Product collection changed');
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
  
  var delayTimer;
  $scope.onParcelChange = function (){
    if(delayTimer){
      
      $window.clearTimeout(delayTimer);
    }
    delayTimer = $window.setTimeout(function() {
      console.log('onparcelchange');
      var date = new Date();
      var parcel = (parseFloat(cash_ctrl.newPayment.value) / parseFloat(cash_ctrl.parcel_length)).toFixed(2);
        console.log(cash_ctrl.parcel_length);
        console.log(cash_ctrl.newPayment.value);
        console.log(parcel);
      for( var i = 0; i < cash_ctrl.parcel_length; i++){
        date.setMonth(date.getMonth() + 1)
        cash_ctrl.newPayment.plots.push({
          'date': new Date(date.toDateString()),
          'plot': cash_ctrl.newPayment.plots.length+1,
          'ploted_value': parseFloat(parcel)
        });
      }
      $window.setTimeout(function() {$scope.$apply();},1)
      
    }, 1000);
  };
  
  var delayDeduction;
  
  $scope.onDeductionChange = function() {
    if(delayDeduction){
      $window.clearTimeout(delayDeduction);
    }
    delayDeduction = $window.setTimeout(function() {
      console.log('onDeductionChange');
      cash_ctrl.deduction_value = (
        parseFloat(cash_ctrl.subTotalProducts) * parseFloat(cash_ctrl.sell.deduction)
      ).toFixed(2);
      cash_ctrl.setTotalPay();
      cash_ctrl.setPaymentTotal();
      cash_ctrl.setMoneyChange();
      cash_ctrl.setMoneyMissing();
      $window.setTimeout(function() {$scope.$apply();},1)
    }, 1000);
    
  };

  cash_ctrl.addPlot = function(){
    cash_ctrl.newPayment.plots.push({
      'date': null,
      'plot': cash_ctrl.newPayment.plots.length+1,
      'ploted_value': 0
    });
  };

  $('#plotsModal').on('hide.bs.modal', function(evt){
    console.log('dismiss modal');
    cash_ctrl.newPayment.value = 0;
    cash_ctrl.newPayment.plots.forEach(function(plot) {
      console.log(plot);
      cash_ctrl.newPayment.value += parseFloat(plot.ploted_value);
    });
    cash_ctrl.newPayment.plots_amount = cash_ctrl.newPayment.plots.length;
    pushPayment();
    $window.setTimeout(function() {$scope.$apply();},1)
    console.log(cash_ctrl.sell);
  });
  
  cash_ctrl.can_submit = function(){
    var can_submit = false;
    if ($scope.sell_products.length > 0 && $scope.sell_payments.length > 0 ){
      can_submit = true; 
    }
    
    return can_submit;
    
  };
  
  cash_ctrl.submit = function(){
//      console.log('SUBMIT');
    cash_ctrl.sell.products = $scope.sell_products;
    cash_ctrl.sell.payments = $scope.sell_payments;
    
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