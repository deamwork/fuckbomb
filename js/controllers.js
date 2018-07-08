'use strict';

angular.module('app.controllers', [])
.controller('AppController', function($scope) {
	$scope.versions = ['1'];
	$scope.selectedVersion = $scope.versions[0];
	
	$scope.resetBombInfo = function() {
		// Global bomb variables
		$scope.globals = {
			hasTwoBatteries: undefined,
			hasParallelPort: undefined,
			hasEvenSerial: undefined,
			needsSerial: false,
			needsParallel: false,
			needsBatteries: false,
		};
		$scope.moduleNum = 0;
	};
	
	$scope.resetBombInfo();
	
	// 0 - complex wires
	// 1 - password
	$scope.setModule = function(moduleNum) {
		$scope.moduleNum = moduleNum;
	};
})
.controller('ComplicatedWiresController', function($scope) {
	$scope.wires = [];
	$scope.watches = [];
	
	// Watch globals for bomb updates that will need to update wires
	$scope.$watch(
		function() { return $scope.globals; },
		function(newVal, oldVal) {
			$scope.wires.forEach(function(wire) {
				updateFinalResult(wire);
			});
		},
		/*objectEquality*/ true);
	
    $scope.addWire = function() {
        var len = $scope.wires.push({
			isWhite: false,
			isRed: false,
			isBlue: false,
			isStarOn: false,
			isLedOn: false,
			result: '',
		});
		
		// Watch the wire for any updates and re-evaulate the result
		var unbind = $scope.$watch(
			function() { return $scope.wires[len - 1]; },
			function(newVal, oldVal) {
				updateFinalResult(newVal);
			},
			/*objectEquality*/ true);
		
		$scope.watches.push(unbind);
    }
	
	$scope.clearWires = function() {
		$scope.wires = [];
		$scope.watches.forEach(function(unbind) {
			unbind();
		});
		$scope.watches = [];
		$scope.globals.needsSerial = false;
		$scope.globals.needsParallel = false;
		$scope.globals.needsBatteries = false;
	};
	
	$scope.getResultClass = function(wire) {
		var simpleResult = getSimpleResult(wire);
		return 'alert alert-' + simpleResultClassMap[simpleResult];
	};
	
	/******
	* Static Functions
	*******/
	
	var resultsMap = {
		'c': 'Cut',
		'd': 'Do NOT Cut',
		's': 'Is the last digit of the serial number even?',
		'p': 'Is there a parallel port?',
		'b': 'Is there at least 2 batteries?',
		'fuck': 'You are fucked',
	};
	
	var simpleResultClassMap = {
		'c': 'success',
		'd': 'danger',
		's': 'info',
		'p': 'info',
		'b': 'info',
		'fuck': 'warning',
	};
	
	var updateFinalResult = function(wire) {
		var simpleResult = getSimpleResult(wire);
		switch (simpleResult) {
			case 's':
				wire.needsSerial = true;
				$scope.globals.needsSerial = true;
				wire.needsParallel = false;
				wire.needsBatteries = false;
				break;
			case 'p':
				wire.needsParallel = true;
				$scope.globals.needsParallel = true;
				wire.needsSerial = false;
				wire.needsBatteries = false;
				break;
			case 'b':
				wire.needsBatteries = true;
				$scope.globals.needsBatteries = true;
				break;
			case 'c':
			case 'd':
				break;
			default:
				console.log('Unknown simple type ' + simpleResult);
				break;
		}
		
		wire.result = resultsMap[simpleResult];
	};
	
	var getSimpleResult = function(wire) {
		var isRed = wire.isRed,
			isBlue = wire.isBlue,
			isStarOn = wire.isStarOn,
			isLedOn = wire.isLedOn,
			hasTwoBatteries = $scope.globals.hasTwoBatteries,
			hasParallelPort = $scope.globals.hasParallelPort,
			hasEvenSerial = $scope.globals.hasEvenSerial;
		
		// cut
		if((!isRed && !isBlue && !isStarOn && !isLedOn)
			|| (!isRed && !isBlue && isStarOn && !isLedOn)
			|| (isRed && !isBlue && isStarOn && !isLedOn)
			|| (needsTwoBatteries(wire) && hasTwoBatteries)
			|| (needsParallelPort(wire) && hasParallelPort)
			|| (needsEvenSerial(wire) && hasEvenSerial))
			return 'c';
		
		// don't cut
		if((!isRed && !isBlue && !isStarOn && isLedOn)
			|| (!isRed && isBlue && isStarOn && !isLedOn)
			|| (isRed && isBlue && isStarOn && isLedOn)
			|| (needsTwoBatteries(wire) && isFalseAndDefined(hasTwoBatteries))
			|| (needsParallelPort(wire) && isFalseAndDefined(hasParallelPort))
			|| (needsEvenSerial(wire) && isFalseAndDefined(hasEvenSerial)))
			return 'd';
		
		// serial number
		if((!isRed && isBlue && !isStarOn && !isLedOn)
			|| (isRed && !isBlue && !isStarOn && !isLedOn)
			|| (isRed && isBlue && !isStarOn && !isLedOn)
			|| (isRed && isBlue && !isStarOn && isLedOn))
			return 's';
		
		// parallel port
		if((!isRed && isBlue && !isStarOn && isLedOn)
			|| (!isRed && isBlue && isStarOn && isLedOn)
			|| (isRed && isBlue && isStarOn && !isLedOn))
			return 'p';
		
		// batteries
		if((!isRed && !isBlue && isStarOn && isLedOn)
			|| (isRed && !isBlue && !isStarOn && isLedOn)
			|| (isRed && !isBlue && isStarOn && isLedOn))
			return 'b';
		
		return 'fuck';
	};
	
	var needsEvenSerial = function(wire) {
		var isRed = wire.isRed,
			isBlue = wire.isBlue,
			isStarOn = wire.isStarOn,
			isLedOn = wire.isLedOn;
			
		if((!isRed && isBlue && !isStarOn && !isLedOn)
			|| (isRed && !isBlue && !isStarOn && !isLedOn)
			|| (isRed && isBlue && !isStarOn && !isLedOn)
			|| (isRed && isBlue && !isStarOn && isLedOn))
			return true;
		return false;
	}
	
	var needsTwoBatteries = function(wire) {
		var isRed = wire.isRed,
			isBlue = wire.isBlue,
			isStarOn = wire.isStarOn,
			isLedOn = wire.isLedOn;
			
		if((!isRed && !isBlue && isStarOn && isLedOn)
			|| (isRed && !isBlue && !isStarOn && isLedOn)
			|| (isRed && !isBlue && isStarOn && isLedOn))
			return true;
		return false;
	};
	
	var needsParallelPort = function(wire) {
		var isRed = wire.isRed,
			isBlue = wire.isBlue,
			isStarOn = wire.isStarOn,
			isLedOn = wire.isLedOn;
			
		if((!isRed && isBlue && !isStarOn && isLedOn)
			|| (!isRed && isBlue && isStarOn && isLedOn)
			|| (isRed && isBlue && isStarOn && !isLedOn))
			return true;
		return false;
	};
	
	var isFalseAndDefined = function(bool) {
		return !bool && typeof bool !== 'undefined';	
	};
})
.controller('PasswordsController', function($scope) {
	// Each rows starting/ending position for the word bank used to distribute them in a table evenly. 
	// There's definitely a better way to do this, but this will work for now.
	$scope.rows = [{ start: 0, end: 5 },{ start: 5, end: 10 },{ start: 10, end: 15 },{ start: 15, end: 20 },{start: 20, end: 25 },{start: 25, end: 30},{start: 30, end: 36}];
	$scope.wordBank = ['about', 'after', 'again', 'below', 'could', 'every', 'first', 'found', 'great', 'house', 'large', 'learn', 'never', 'other', 'place', 'plant', 'point', 'right', 'small', 'sound', 'spell', 'still', 'study', 'their', 'there', 'these', 'thing', 'think', 'three', 'water', 'where', 'which', 'world', 'would', 'write'];
	
	$scope.resetInputs = function() {
		$scope.inputs = [{chars: ''}, {chars: ''}, {chars: ''}, {chars: ''}, {chars: ''}]
	};
	
	$scope.resetInputs();
});