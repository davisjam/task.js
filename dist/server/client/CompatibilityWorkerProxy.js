'use strict';

var _Worker = require('../Worker.js');

var _Worker2 = _interopRequireDefault(_Worker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CompatibilityWorkerProxy = function (_GeneralWorker) {
	_inherits(CompatibilityWorkerProxy, _GeneralWorker);

	function CompatibilityWorkerProxy() {
		_classCallCheck(this, CompatibilityWorkerProxy);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CompatibilityWorkerProxy).apply(this, arguments));

		_this.postMessage = function (message, options) {
			// toss it out of the event loop
			_this._setTimeoutID = setTimeout(function () {
				var args = Object.keys(message).filter(function (key) {
					return key.match(/^argument/);
				}).sort(function (a, b) {
					return parseInt(a.slice(8), 10) - parseInt(b.slice(8), 10);
				}).map(function (key) {
					return message[key];
				});

				var functionBody = message.func.substring(message.func.indexOf('{') + 1, message.func.lastIndexOf('}')),
				    argNames = message.func.substring(message.func.indexOf('(') + 1, message.func.indexOf(')')).split(',');

				var func = new (Function.prototype.bind.apply(Function, [null].concat(_toConsumableArray(argNames), [functionBody])))();

				// we cant use eval
				try {
					var result = func.apply(undefined, _toConsumableArray(args));
					_this.handleWorkerMessage({ id: message.id, result: result });
				} catch (error) {
					_this.handleWorkerMessage({ id: message.id, 'error': error.message });
				}
			}, 1);
		};

		_this.terminate = function () {
			clearTimeout(_this._setTimeoutID);
			_this._setTimeoutID = null;
		};

		_this._listeners = {};
		_this._setTimeoutID = null;
		return _this;
	}

	return CompatibilityWorkerProxy;
}(_Worker2['default']);

module.exports = CompatibilityWorkerProxy;