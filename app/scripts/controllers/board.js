'use strict';

angular.module('kanbanzillaApp')
  .controller('BoardCtrl', ['$scope', '$location', '$q','Bugzilla', 'Boards', '$routeParams', '$window', '$dialog', 'board',
  function ($scope, $location, $q, Bugzilla, Boards, $routeParams, $window, $dialog, board) {

    $scope.boardInfo = board.data; // the resolve from the routeProvider
    console.log($scope.boardInfo);
    $scope.components = makeSelect2Components($scope.boardInfo.board.components);

    function makeSelect2Components (components) {
      var data = [];
      for(var i = 0; i < components.length ; i++){
        data.push(components[i].product + '@&:' + components[i].component);
      }
      return data;
    }

    function getColumn (name) {
      for (var i = 0 ; i < $scope.boardInfo.columns.length ; i++){
        if($scope.boardInfo.columns[i].name === name) {
          return $scope.boardInfo.columns[i];
        }
      }
    }

    function receiveHandler (data, ui) {
      var bug = ui.item.sortable.moved;
      // dependent on html structure, would like to change this but its hard with what
      // the ui-sortable directive gives us.
      var columnName = data.target.parentNode.parentNode.attributes['display-title'].nodeValue;
      var column = getColumn(columnName);

      var statuses = [];
      var title = 'Update Bug';
      var open = false;

      if(column.statuses.length > 1) {
        // console.log('choose between these statuses', column.statuses);
        title = 'Move Bug to ' + columnName;
        statuses = column.statuses;
        open = true;
      }
      else if(column.statuses[0] === 'RESOLVED') {
        // console.log('choose between these statuses', ['FIXED', 'INVALID', 'WONTFIX', 'DUPLICATE', 'WORKSFORME', 'INCOMPLETE']);
        title = 'Move Bug to Resolved';
        statuses = ['RESOLVED'];
        open = true;
      }
      else if(column.statuses.length === 1) {
        // console.log('change the status on bug: #' + bug.id + ' to ' + column.statuses[0]);
        Bugzilla.updateBug(bug.id, { status: column.statuses[0] });
      }
      else {
        // console.log('change the whiteboard on bug: #' + bug.id + ' to kanbanzilla[' + columnName + ']');
        Bugzilla.updateBug(bug.id, { whiteboard: columnName });
      }

      var dropModalDialog = $dialog.dialog({
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        templateUrl: 'views/dropbugmodal.html',
        controller: 'DropBugModalCtrl',
        statuses: statuses,
        title: title
      });

      $scope.select2Options = {
        'multiple': true,
        'simple_tags': true,
        'minimumInputLength': 4
      };

      if(open){
        dropModalDialog.open().then(function (result) {
          if(result.action === 'submit'){
            // console.log(result.data);
            Bugzilla.updateBug(bug.id, result.data);
          }
          else if (result.action === 'close'){
            console.log('need to undo and send bug back to intial column');
          }
        });
      }


    }

    function updateBoardWith (data) {
      console.log(data);
    }


    // ui-sortable options, placeholder is a class, and helper clone disables
    // the click event from firing when dropping cards.
    $scope.sortableOptions = {
      placeholder: 'proxy-card',
      connectWith: '[ui-sortable]',
      helper: 'clone',
      revert: 100,
      receive: receiveHandler
    };

    $scope.refresh = function () {
      Boards.getUpdates($scope.boardInfo.board.id, $scope.boardInfo.latest_change_time)
        .success(function (data) {
          if(data.latest_change_time !== undefined) {
            console.log('theres been an update');
            updateBoardWith(data);
          }
          else {
            console.log('no update');
          }
        });
    };

    $scope.updateBoard = function () {
      console.log($scope.components);
      Boards.update($scope.boardInfo.board.id, {
        "name": "heheh",
        "components": [1,2,3]
      })
        .success(function (data) {
          console.log(data);
        });
    };

    $scope.$on('$destroy', function () {
      console.log('board destroyed');
    });

  }]);
