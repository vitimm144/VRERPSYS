angular.module(
  'vrerpsys',
  [
    'ui.router',
    'datatables',
    'ngScrollbars'
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
        'name': 'other',
        'url': '/other',
        'controller': 'otherCtrl',
        'controllerAs': 'other_ctrl',
        'templateUrl': 'other.html'
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
        'name': 'contacts.recent_calls',
        'url': '/recent_calls',
        'views': {
          'recent_calls@': {
            'templateUrl': 'recent_calls.html',
            'controller': 'RecentCallsCtrl',
            'controllerAs': 'recent_calls_ctrl'
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