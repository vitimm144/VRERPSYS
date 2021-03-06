angular.module(
  'vrerpsys',
  [
    'ui.router',
    'datatables',
    'ngScrollbars',
    'ui.select'
  ]
)
.config(
  function (
    $stateProvider,
    $urlRouterProvider
  ) {
    $urlRouterProvider.otherwise('/contacts');

    $stateProvider.state(
      {
        'name': 'main',
        'url': '/main',
        'controller': 'mainCtrl',
        'controllerAs': 'main_ctrl',
        'templateUrl': 'main.html'
      }
    ).state(
      {
        'name': 'contacts',
        'url': '/contacts',
        'controller': 'ContactsCtrl',
        'controllerAs': 'contacts_ctrl',
        'templateUrl': 'contacts.html'
      }
    ).state(
      {
        'name': 'contacts.new',
        'url': '/new',
        'views': {
          'form@': {
            'templateUrl': 'contact_edit.html',
            'controller': 'ContactEditCtrl',
            'controllerAs': 'contact_edit_ctrl'
          }
        }
      }
    ).state(
      {
        'name': 'contacts.edit',
        'url': '/edit/:contactId',
        'views': {
          'form@': {
            'templateUrl': 'contact_edit.html',
            'controller': 'ContactEditCtrl',
            'controllerAs': 'contact_edit_ctrl'
          }
        }
      }
    ).state(
      {
        'name': 'contacts.stock',
        'url': '/stock',
        'views': {
          'stock@': {
            'templateUrl': 'stock.html',
            'controller': 'StockCtrl',
            'controllerAs': 'stock_ctrl'
          }
        }
      }
    ).state(
      {
        'name': 'contacts.transfer',
        'url': '/stock/transfer/:stockId',
        'views': {
          'form@': {
            'templateUrl': 'stock_transfer.html',
            'controller': 'StockTransferCtrl',
            'controllerAs': 'stock_transfer_ctrl'
          }
        }
      }
    ).state(
      {
        'name': 'contacts.sales',
        'url': '/sales',
        'views': {
          'sales@': {
            'templateUrl': 'sales.html',
            'controller': 'SalesCtrl',
            'controllerAs': 'sales_ctrl'
          }
        }
      }
    ).state(
      {
        'name': 'contacts.cash',
        'url': '/cash',
        'views': {
          'stock@': {
            'templateUrl': 'cash.html',
            'controller': 'CashCtrl',
            'controllerAs': 'cash_ctrl'
          }
        }
      }
    ).state(
      {
        'name': 'login',
        'url': '/login',
        'templateUrl': 'login.html'
      }
    ).state(
      {
        'name': 'change_password',
        'url': '/change_password',
        'controller': 'ChangePasswordCtrl',
        'controllerAs': 'change_password_ctrl',
        'templateUrl': 'change_password.html'
      }
    );
  }
);