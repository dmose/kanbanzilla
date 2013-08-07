'use strict';

angular.module('kanbanzillaApp')
  .controller('MainCtrl', ['$scope', 'Bugzilla', 'Boards', '$window', '$http',
  function ($scope, Bugzilla, Boards, $window, $http) {
    $scope.products = {};

    // Bugzilla.getConfig()
    //    .success(function (data) {
    //       $scope.products = data.product;
    //     });

    $scope.myBoards = Boards.getAllBoards();
    $http.get('/api/board').
      success(function (data){
        console.log(data);
      });

    $scope.toggle = function (product) {
      console.log(product);
      if(typeof product.visible === 'undefined'){
        product.visible = true;
      }
      else{
        product.visible = !product.visible;
      }
    };

    $scope.deleteBoard = function (board) {
      if($window.confirm('Are you sure you want to delete this board?')){
        Boards.remove(board);
      }
    };

  }]);
