define([
  'angular',
  'app',
  'lodash',
  'config'
],
function (angular, app, _, config) {
  'use strict';

  var module = angular.module('kibana.controllers');

  module.controller('DashboardClassCtrl', function($scope, $rootScope, $timeout,ejsResource, querySrv) {

      $scope.init = function() {
        $scope.dashboardclass = {};
        $scope.dashboardmainclass = [];
        for (var i in config.dashboard_class){
            for(var k in config.dashboard_class[i])
                $scope.dashboardmainclass.push(k);
                $scope.dashboardclass[k] = config.dashboard_class[i][k];
        }
      };

      $scope.init();
    }
  );

});
