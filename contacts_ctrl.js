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

  contacts_ctrl.calls = {};

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
        'http://' + $scope.login_ctrl.host + '/redt/api/contacts/',
        {
          'headers': {
            'Authorization': $scope.login_ctrl.token,
            'Accept':'*/*'
          }
        }
      ).then(
        function ( response ) {
          console.log( 'Contacts get OK', response )
          contacts_ctrl.contacts = response.data;
          ipcRenderer.send( 'sfbpresence-start', $scope.login_ctrl.host );
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
        'http://' +
        $scope.login_ctrl.host +
        '/redt/api/contacts/' +
        id,
        {
          'headers': {
            'Authorization': $scope.login_ctrl.token,
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


  contacts_ctrl.transfer = function ( tranfer_input, call ) {
    var params = [
      call.config.destination,
      tranfer_input
    ];
    console.log('transfer', params )
    autobahn_session.call( 'redt.pbxs.transfer_call', params ).then(
      function ( response ) {
        console.log('transfer OK', response)
        contacts_ctrl.tranfer_input = null;
      },
      function ( response ) {
        console.log('transfer FAIL', response)
      }
    );
  };

  contacts_ctrl.park = function ( param ) {
    if ( param ) {
      autobahn_session.call( 'redt.pbxs.park_call', [ param ] ).then(
        function ( response ) {
          console.log('Park OK', response)
        },
        function ( response ) {
          console.log('Park FAIL', response)
        }
      );
    }
  };

  contacts_ctrl.make_subs = function ( peers ) {
    console.log( 'contacts_ctrl.make_subs', peers )
    for( var peer of peers ) {
      autobahn_session.subscribe(
        'redt.incall.' + peer + '.call.new',
        function ( params, kwargs, details ) {
          console.log( details.topic, params )
          // Full Options
          notifications[ params[ 3 ] ] = {
            'window': notifier.notify( 'De ' + params[ 0 ], {
              'message': params[ 1 ] +
                ' <span class="ramal_atual">' + params[ 2 ] + '</span>',
              'icon': path.join(
                __dirname,
                'assets/images/notification_128x128.png'
              ),
              'buttons': [ 'Ignorar', 'Rejeitar' ],
              'duration': 600000,
              'vertical': false,
              'flat': true
            })
          };
          notifications[ params[ 3 ] ][ 'config' ] = {
            'source': params[ 0 ],
            'contact': params[ 1 ],
            'destination': params[ 2 ],
            'id': params[ 3 ],
            'source_channel': params[ 4 ]
          };

          notifications[
            params[ 3 ]
          ].window.on(
            'buttonClicked',
            function ( text, buttonIndex, options ) {
              if ( text === 'Rejeitar' ) {
                console.log('Rejeitar clicked', notifications[ params[ 3 ] ] )
                notifications[ params[ 3 ] ].window.close();
                var hangup_params = [ params[ 2 ], params[ 4 ] ];
                autobahn_session.call(
                  'redt.pbxs.hangup_call',
                  hangup_params
                ).then(
                  function ( response ) {
                    console.log('hangup OK', response, hangup_params)
                  },
                  function ( response ) {
                    console.log('hangup FAIL', response, hangup_params)
                  }
                );
              } else if ( text === 'Ignorar' ) {
                console.log('Ignorar clicked', notifications[ params[ 3 ] ] )
                notifications[ params[ 3 ] ].window.close();
              }
            }
          );
          notifications[
            params[ 3 ]
          ].window.on(
            'swipedRight',
            function () {
              console.log('swipedRight', notifications[ params[ 3 ] ] )
            }
          );
        }
      ).then( function ( subscription ) {
      });
      autobahn_session.subscribe(
        'redt.incall.' + peer + '.call.clear',
        function ( params, kwargs, details ) {
          console.log( details.topic, params )
          if ( params[ 1 ] === "6" ) {
            contacts_ctrl.calls[ params[ 2 ] ] = {
              'show': true,
              'config': notifications[ params[ 2 ] ].config
            };
            $scope.$apply();
            ipcRenderer.send( 'window-focus' );
            console.log('Mostra a call', contacts_ctrl.calls[ params[ 2 ] ])
          } else {
            console.log('Esconde a call', contacts_ctrl.calls[ params[ 2 ] ]);
            delete contacts_ctrl.calls[ params[ 2 ] ];
            $scope.$apply();
          }

          if ( notifications[ params[ 2 ] ] ) {
            notifications[ params[ 2 ] ].window.close();
            delete notifications[ params[ 2 ] ];
          }
        }
      ).then( function ( subscription ) {
      });
      autobahn_session.subscribe(
        'redt.incall.' + peer + '.call.cancel',
        function ( params, kwargs, details ) {
          console.log( details.topic, params )
          $scope.login_ctrl.has_missed_calls = true;
          $scope.$digest();
          notifications[ params[ 3 ] ][ 'window' ].close();
          delete notifications[ params[ 3 ] ];
        }
      ).then( function ( subscription ) {
      });
    }
  };

  var call_session_join_retry_count = 0;
  var call_session_join = function ( params ) {
    autobahn_session.call( 'redt.incall.session_join', params ).then(
      function ( response ) {
        console.log( 'redt.incall.session_join OK', response, params )
        call_session_join_retry_count = 0;
      },
      function ( response ) {
        console.log( 'redt.incall.session_join FAIL', response, params )
        call_session_join_retry_count++;
        if ( call_session_join_retry_count < 15 ) {
          console.log( 'redt.incall.session_join RETRY in 2s' )
          $timeout(
            function () {
              call_session_join( params );
            },
            2000
          );
        } else {
          call_session_join_retry_count = 0;
        }
      }
    );
  };

  //Autobahn start
  var start_autobahn = function () {
    contacts_ctrl.get_contacts();

    console.log('autobahn_connection', autobahn_connection)
    console.log('autobahn_session', autobahn_session)

    connect_autobahn( $scope.login_ctrl.host ).then(
      function ( response ) {
        console.log(response)
        console.log('autobahn_session', autobahn_session)
        contacts_ctrl.autobahn_is_connected = true;
        $scope.$apply();

        var params = [
          autobahn_session._id,
          autobahn_session._realm,
          $scope.login_ctrl.username,
          $scope.login_ctrl.peers
        ];
        call_session_join( params );

        autobahn_connection.onopen = function ( session ) {
          contacts_ctrl.autobahn_is_connected = true;
          $scope.$apply();
          autobahn_session = session;
          console.log('Autobahn Reconnected!', autobahn_session)
          params = [
            autobahn_session._id,
            autobahn_session._realm,
            $scope.login_ctrl.username,
            $scope.login_ctrl.peers
          ];
          call_session_join( params );
          contacts_ctrl.make_subs( $scope.login_ctrl.peers );
        };
        autobahn_connection.onclose = function (
          reason,
          details
        ) {
          contacts_ctrl.autobahn_is_connected = false;
          $scope.$apply();
          console.log(
            "Autobahn disconnected: ",
            reason,
            details
          )
        };
        contacts_ctrl.make_subs( $scope.login_ctrl.peers );
      },
      function ( response ) {
        console.log('Promise FAIL', response)
      }
    );
  };

  $scope.login_ctrl.ctrl_has( [ 'token', 'peers', 'host' ] ).then(
    function ( response ) {
      console.log( 'ctrl_has', response )
      if ( response[ 1 ] ) {
        start_autobahn();
      }
    },
    function ( response ) {
      console.log( 'ctrl_has', response )
    }
  );
  //Autobahn end

  $rootScope.$on( 'Contact_refresh', function () {
    console.log('Contact_refresh');
    contacts_ctrl.get_contacts();
  });

  contacts_ctrl.call_contact = function( country, area, number ) {
    var call_contact = function () {
      var complete_number = '';
      if ( country ) { complete_number = complete_number + country; }
      if ( area ) { complete_number = complete_number + area; }
      complete_number = complete_number + number;

      var params = [
        $scope.login_ctrl.peers[ 0 ],
        complete_number
      ];
      autobahn_session.call( 'redt.pbxs.make_call', params ).then(
        function ( response ) {
          console.log('make_call OK', response, params)
        },
        function ( response ) {
          console.log('make_call FAIL', response, params)
        }
      );
    };

    $scope.login_ctrl.ctrl_has( [ 'peers' ] ).then(
      function ( response ) {
        console.log( 'ctrl_has', response )
        if ( response[ 1 ] ) {
          call_contact();
        }
      },
      function ( response ) {
        console.log( 'ctrl_has', response )
      }
    );

  };

  contacts_ctrl.show_messages = false;
});