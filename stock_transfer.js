angular.module( 'vrerpsys' )
.controller( 'StockTransferCtrl', function (
  $state,
  $interval,
  $scope,
  $http,
  $rootScope,
  $stateParams,
  $timeout
) {
  var stock_transfer_ctrl = this;

  stock_transfer_ctrl.transfer_form = {};

  console.log('StockTransferCtrl')

  $scope.$on('$stateChangeSuccess', function(
    event,
    toState,
    toParams,
    fromState,
    fromParams
  ){
    event.preventDefault();
//    console.log('current_state',$state.current);
    stock_transfer_ctrl.current_state = $state.current;
  });
  
  stock_transfer_ctrl.post_url = '/api/stock/transfer/';
  stock_transfer_ctrl.url = '/api/stocks/';
  stock_transfer_ctrl.post_data = {};
  stock_transfer_ctrl.stockId = $stateParams.stockId;
  console.log('stockId');
  console.log(stock_transfer_ctrl.stockId);
  var headers = {
    'headers': {
      'Authorization':'Token ' +  $scope.login_ctrl.token,
      'X-CSRFToken': $scope.login_ctrl.token,
      'Accept':'*/*'
    }
  };
  
  $http.get(
    'http://' + 
    $scope.login_ctrl.host + 
    '/api/users',
    headers
  ).then(function(data){
    console.log(data);
    stock_transfer_ctrl.users = data.data.results;
  });
  
  $http.get(
    'http://' + 
    $scope.login_ctrl.host + 
    stock_transfer_ctrl.url + 
    stock_transfer_ctrl.stockId +
    '/',
    headers
  ).then(function(data){
    stock_transfer_ctrl.post_data.stock = data.data;   
    stock_transfer_ctrl.stock = data.data;
    console.log('stock_transfer_ctrl.stock');
    console.log(stock_transfer_ctrl.stock);
    $timeout(
      function () {
        $scope.$apply();
      },
      1000
    );
    
    
  });
  
  

  stock_transfer_ctrl.errors = [];

  var add_error = function ( param ) {
    stock_transfer_ctrl.errors.unshift( param );
    $timeout(
      function () {
        stock_transfer_ctrl.errors.pop();
      },
      5000
    );
  };

  stock_transfer_ctrl.submit = function () {
    if ( stock_transfer_ctrl.transfer_form.$valid ) {
      var submit = function () {
        stock_transfer_ctrl.post_data['from_transfer'] = stock_transfer_ctrl.stock
        $http.post(
          'http://' +
          $scope.login_ctrl.host +
          stock_transfer_ctrl.post_url,
          stock_transfer_ctrl.post_data,
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
  stock_transfer_ctrl.form_cancel = function () {
    $state.go( 'contacts.stock' );
  };
});