/**  * == terms
 * Status: *Stable*
 *
 * get all dashboards and show them in the panel
 *
 */
define([
  'angular',
  'app',
  //'underscore',
  'lodash',
  'jquery',
  'kbn',
  'config'
],
function (angular, app, _, $, kbn, config) {
  'use strict';

  var module = angular.module('kibana.panels.entry', []);
  app.useModule(module);

  module.controller('entry', function($scope, querySrv, dashboard, filterSrv, fields) {
    $scope.panelMeta = {
      modals : [
        {
          description: "Inspect",
          icon: "icon-info-sign",
          partial: "app/partials/inspector.html",
          show: $scope.panel.spyable
        }
      ],
      //editorTabs : [
      //  {title:'Queries', src:'app/partials/querySelect.html'}
      //],
      status  : "Stable",
      description : "Displays All dashboard"};

    $scope.init = function () {
      $scope.hits = 0;

      $scope.$on('refresh',function(){
        $scope.get_data();
      });
      $scope.get_data();

    };

    $scope.get_data = function() {
        var request = $scope.ejs.Request().indices(config.kibana_index).types('dashboard');
        request.size(1000).doSearch(
          // Success
          function(result) {
            var dashboardmainclass = [];
            var dashboardclass = {};
            for (var i in config.dashboard_class){
                for(var k in config.dashboard_class[i])
                    dashboardmainclass.push(k);
                    dashboardclass[k] = config.dashboard_class[i][k];
            }

            var entries = {}
            for (var i in result['hits']['hits']){
                var _source = result['hits']['hits'][i]['_source'];
                
                var mainclass = 'Other';
                if ('mainclass' in _source){
                    mainclass = _source['mainclass'];
                }
                if ('subclass' in _source){
                    var subclass = _source['subclass'];
                }else{
                    if (mainclass in dashboardclass && dashboardclass[mainclass].length > 0){
                        var subclass='其它';
                    }else{
                        var subclass='';
                    }
                }

                if (mainclass in entries){
                    if (subclass in entries[mainclass]){
                        entries[mainclass][subclass].push(_source['title']);
                    } else{
                        entries[mainclass][subclass] = [_source['title']];
                    }
                }else{
                    entries[mainclass] = {};
                    entries[mainclass][subclass] = [_source['title']];
                }
            }


            var entriesList = [];

            for(var mainclass in entries){
                var One = {};

                One['title'] = mainclass;
                
                One['data'] = [];
                for (var subclass in entries[mainclass]){
                    entries[mainclass][subclass].sort(function(x,y){
                        if (x.toLowerCase()>y.toLowerCase())
                            return 1;
                        return -1;
                    });
                    One['data'].push({title:subclass,data:entries[mainclass][subclass]});
                }

                if (mainclass in dashboardclass && dashboardclass[mainclass].length>0){
                    One['data'].sort(function(x,y){
                        var sortedTitles = dashboardclass[mainclass];

                        if (sortedTitles.indexOf(x['title']) == -1){
                            return 1;
                        }
                        if (sortedTitles.indexOf(y['title']) == -1){
                            return -1;
                        }
                        return sortedTitles.indexOf(x['title']) - sortedTitles.indexOf(y['title']);
                    });
                }
                entriesList.push(One);
            }

            //sort on MainClass
            entriesList.sort(function(x,y){

                if (dashboardmainclass.indexOf(x['title']) == -1){
                    return 1;
                }
                if (dashboardmainclass.indexOf(y['title']) == -1){
                    return -1;
                }
                return dashboardmainclass.indexOf(x['title']) - dashboardmainclass.indexOf(y['title']);
            });


            $scope.entriesList = entriesList;

            return result;
          },
          // Failure
          function() {
            return false;
          }
        );
    };

    $scope.set_refresh = function (state) {
      $scope.refresh = state;
    };

    $scope.close_edit = function() {
      if($scope.refresh) {
        $scope.get_data();
      }
      $scope.refresh =  false;
    };

  });

});
