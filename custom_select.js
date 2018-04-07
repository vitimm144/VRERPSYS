angular.module( 'vrerpsys' )
.directive( 'customSelect', function(){
  return {
    restrict: 'E',
    require: [ 'ngModel' ],
    scope: {
      'ngModel': '=',
      'config': '='
      /* Config examples:
        // Simple
        {
          'options': [{'id':'','identifier':'','wording':''}],
          'placeholder': 'Type',
          'show_fields': [ 'identifier', 'wording' ],
          'filter_fields': [ 'identifier', 'wording' ],
          'out_fields': [ 'id' ],
          'remove': true //User can unselect options.
        }
        // Multiple
        {
          'options': [{'id':'','identifier':'','wording':''}],
          'placeholder': 'Type',
          'show_fields': [ 'identifier', 'wording' ],
          'filter_fields': [ 'identifier', 'wording' ],
          'out_fields': [ 'id' ],
          'checkbox': 'selected', //Adds a booblean field,
                                    named with this string, in each option.
          'min_checkbox': 3, //Minimum of selected options quantity to
                              show checkboxes.
          'multiple': true,
        }
      */
    },
    replace: true,
    templateUrl: 'custom_select.html',
    link: function( scope, element, attrs, controller, transcludeFn ) {
      // Skipping if no ng-model.
      if ( !controller ) {
        return;
      }

      // Opens the select options container.
      scope.open_options = false;

      scope.filtered_options = [];
      scope.selected = [];

      if ( scope.config.checkbox ) {
        scope.config.out_fields.push( scope.config.checkbox );
      }

      scope.starts_with = function( actual, expected ) {
        //This conditional will return false if 'expected' is empty or bigger
        // than 'actual'.
        if ( ( expected.length > 0 ) && ( expected.length <= actual.length ) ) {

          //This loop will run from the first to last position of 'expected'
          // comparing each position with it's respective in 'actual'.
          for ( var i = 0; i < expected.length; i++ ) {

            //This conditional will return false if a position in 'expected' is
            // not equal to it's respective in 'actual'.
            if ( expected[ i ].toLowerCase() !== actual[ i ].toLowerCase() ) {
              return false;
            }
          }

          return true;
        } else {
          return false;
        }
      };
      scope.ends_with = function( actual, expected ) {
        //This conditional will return false if 'expected' is empty or bigger
        // than 'actual'.
        if ( expected.length > 0 && expected.length <= actual.length ) {

        //This loop will run from the last to first position of 'expected'
        // comparing each position with it's respective in 'actual'.
        for ( var i = expected.length - 1; i >= 0; i-- ) {

          //This conditional will return false if a position in 'expected' is
          // not equal to it's respective in 'actual'.
          if (
            expected[ i ].toLowerCase() !==
            actual[
              i + ( actual.length - expected.length )
            ].toLowerCase()
          ) {
            return false;
          }
        }

          return true;
        } else {
          return false;
        }
      };
      scope.contains = function( actual, expected ) {
        return (
          actual.toLowerCase().indexOf( expected.toLowerCase() ) !== -1
        );
      };

      if ( scope.config.filter_mode ) {
        if ( scope.config.filter_mode == 'start' ) {
          scope.comparator = scope.starts_with;
        } else if ( scope.config.filter_mode == 'end' ) {
          scope.comparator = scope.ends_with;
        } else {
          scope.comparator = scope.contains;
        }
      } else {
        scope.comparator = scope.contains;
      }

      scope.in_selected = function ( param ) {
        return ( _.indexOf( scope.selected, param ) + 1 );
      };

      scope.expression = function( value, index, array ) {
        if ( scope.in_selected( value ) ) { return false; }
        if ( scope.search ) {
          var result = false;
          _.forEach( scope.config.filter_fields, function ( field ) {
            if ( scope.comparator( String( value[ field ] ), scope.search ) ) {
              result = true;
            }
          });
          return result;
        } else {
          return true;
        }
      };

      scope.select = function ( option ) {
        scope.search = "";
        if ( !scope.in_selected( option ) ) {
          // Adding to selected.
          scope.selected.push( option );
        }
      };

      scope.choose = function ( option ) {
        scope.open_options = false;
        scope.search = "";
        if ( !scope.in_selected( option ) ) {
          // Adding to selected.
          scope.selected = [ option ];
        }
      };

      scope.unselect = function ( option, index ) {
        // Removing from selected.
        scope.selected.splice( index, 1 );
      };

      element.bind( "keydown keypress", function( event ) {
        if ( event.keyCode == 13 ) {
          if ( scope.config.multiple ) {
            if ( scope.filtered_options.length ) {
              scope.select( scope.filtered_options[ 0 ] );
            }
          } else {
            if ( scope.filtered_options.length ) {
              scope.choose( scope.filtered_options[ 0 ] );
            }
          }
          scope.search = "";
          event.preventDefault();
          scope.$apply();
        } else if ( event.keyCode == 8 ) {
          if (
            !scope.search &&
            ( scope.config.multiple || scope.config.remove )
          ) {
            scope.unselect( {}, ( scope.selected.length - 1 ) );
            scope.$apply();
          }
        }
      });

      scope.$watch( 'selected', function( newValue, oldValue ) {
        if ( newValue && ( newValue != oldValue ) ) {
          var to_ng_model = [];
          // Updating model.
          if ( scope.config.out_fields.length > 1 ) {
            _.forEach( scope.selected, function( item ) {
              to_ng_model.push( _.pick( item, scope.config.out_fields ) );
            });
          } else {
            to_ng_model = _.map(
              scope.selected,
              scope.config.out_fields[ 0 ]
            );
          }

          // Passing value to ngModel.
          if ( _.isEqual( to_ng_model, [] ) ) {
            scope.ngModel = null;
          } else {
            scope.ngModel = to_ng_model;
          }
        }
      }, true );

      scope.$watch( 'ngModel', function( newValue, oldValue ) {
        if ( ( newValue != oldValue ) ) {
          if ( newValue ) {
            var to_selected = [];

            // Updating selected.
            if ( scope.config.out_fields.length > 1 ) {
              _.forEach( newValue, function( item ) {
                var find = _.find(
                  scope.config.options,
                  _.pick( item, scope.config.out_fields )
                );
                if ( find ) { to_selected.push( find ); }
              });
            } else {
              var to_find = {};
              var find = [];
              _.forEach( newValue, function( item ) {
                to_find[ scope.config.out_fields[ 0 ] ] = item;
                find = _.find(
                  scope.config.options,
                  to_find
                );
                if ( find ) { to_selected.push( find ); }
              });
            }
            scope.selected = to_selected;
          } else {
            scope.selected = [];
          }
        }
      }, true );
      scope.$watch( 'search', function( newValue, oldValue ) {
        if ( ( newValue != oldValue ) ) {
          if ( newValue ) {
            scope.open_options = true;
          }
        }
      });
    }
  };
});

