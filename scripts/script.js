var app = angular.module('myApp', []);

app.service('dataService', function ($http) {
    var data = [];

    this.loadData = function () {
        return $http.get('data/data.json')
            .then(function (response) {
                data = response.data;
                return data;
            });
    };

    this.getData = function () {
        return data;
    };
});

app.controller('jobController', function ($scope, $filter, dataService, $compile) {
    dataService.loadData()
        .then(function (response) {
            $scope.jobs = dataService.getData();
            $scope.filteredJobs = angular.copy($scope.jobs);
        })
        .catch(function (error) {
            console.error('Erreur lors de la récupération du JSON :', error);
        });

    $scope.filterTags = [];

    $scope.toggleFilter = function (button, value, event) {
        var element = event.currentTarget || event.srcElement;

        if (!element) {
            console.error('Element is undefined.');
            return;
        }

        var filterIndex = $scope.filterTags.findIndex(filter => filter.value === value);
        var dataValue = element.getAttribute('data-value');
        var dataButton = element.getAttribute('data-button');

        if (filterIndex === -1) {
            $scope.filterTags.push({ value: value, dataValue: dataValue, dataButton: dataButton });

            var filterTag = document.createElement('div');
            filterTag.className = 'filter-tag d-inline-block mx-1';

            var filterContent = document.createElement('div');
            filterContent.className = 'filter p-1';
            filterContent.innerText = value;

            var closeButton = document.createElement('span');
            closeButton.className = 'close p-1 close-button';
            closeButton.innerText = 'x';

            closeButton.addEventListener('click', function () {
                $scope.$apply(function () {
                    $scope.removeFilter(value, dataValue, dataButton);
                });
            });

            filterTag.appendChild(filterContent);
            filterTag.appendChild(closeButton);

            document.querySelector('.filter-tags').appendChild(filterTag);
        } else {
            $scope.filterTags.splice(filterIndex, 1);
            angular.element(document.querySelector('.filter-tags')).children().eq(filterIndex).remove();
        }

        $scope.searchFilter = $scope.filterTags.map(filter => filter.value).join(', ');
        $scope.filterJobs();
    };

    $scope.isFilterSelected = function (button, value) {
        return $scope.filterTags.some(filter => filter.value === value);
    };

    $scope.removeFilter = function (value, dataValue, dataButton) {
        var filterIndex = $scope.filterTags.findIndex(filter => filter.value === value);

        if (filterIndex !== -1) {
            $scope.filterTags.splice(filterIndex, 1);
            angular.element(document.querySelector('.filter-tags')).children().eq(filterIndex).remove();
            $scope.searchFilter = $scope.filterTags.map(filter => filter.value).join(', ');
            $scope.filterJobs();
        }
    };

    $scope.filterJobs = function () {
        $scope.filteredJobs = $filter('filter')($scope.jobs, function (job) {
            return $scope.filterTags.every(function (tag) {
                return (
                    (tag.dataButton === 'role' && job.role === tag.dataValue) ||
                    (tag.dataButton === 'level' && job.level === tag.dataValue) ||
                    (tag.dataButton === 'language' && job.languages.includes(tag.dataValue)) ||
                    (tag.dataButton === 'tool' && job.tools.includes(tag.dataValue))
                );
            });
        });
    };
    $scope.clearAllFilters = function () {
      $scope.filterTags = [];
      $scope.searchFilter = '';
      var filterTagsContainer = document.querySelector('.filter-tags');
      while (filterTagsContainer.firstChild) {
        filterTagsContainer.removeChild(filterTagsContainer.firstChild);
      }
      $scope.filterJobs();
    };

});
