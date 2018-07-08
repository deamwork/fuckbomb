'use strict';

angular.module('app.directives', [])
.directive('bombInfo', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/bombInfo.html',
    };
})
.directive('complicatedWires', function() {
	return {
		restrict: 'E',
		scope: {
			selectedVersion: '=',
			globals: '=',
		},
		templateUrl: 'templates/complicatedWires.html',
	};
})
.directive('complicatedWire', function() {
    return {
        restrict: 'C',
        templateUrl: 'templates/complicatedWire.html',
    };
})
.directive('complicatedWireResult', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/complicatedWireResult.html',
    };
})
.directive('bombInput', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/bombInput.html',
    };
})
.directive('passwords', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/passwords.html',
    };
})
.directive('passwordInput', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/passwordInput.html',
    };
})
.directive('passwordBank', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/passwordBank.html',
    };
});