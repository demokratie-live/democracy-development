module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lib/context/filter.js":
/*!*******************************!*\
  !*** ./lib/context/filter.js ***!
  \*******************************/
/*! exports provided: Provider, Consumer, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Provider", function() { return Provider; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Consumer", function() { return Consumer; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var Helpers_subjectGroupToIcon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! Helpers/subjectGroupToIcon */ "./lib/helpers/subjectGroupToIcon.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

 // Helpers


var Context = react__WEBPACK_IMPORTED_MODULE_0___default.a.createContext();
var Consumer = Context.Consumer;
var documentTypes = ['Antrag', 'Gesetzgebung'];

var Provider =
/*#__PURE__*/
function (_Component) {
  _inherits(Provider, _Component);

  function Provider() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Provider);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Provider)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "displayName", 'FilterProvider');

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "state", {
      types: documentTypes,
      allTypes: true,
      subjectGroups: Object.keys(Helpers_subjectGroupToIcon__WEBPACK_IMPORTED_MODULE_1__["subjectGroups"]),
      allSubjectGroups: true,
      hasMore: true,
      sorters: {
        'in-abstimmung': {
          sortBy: 'voteDate',
          all: [{
            title: 'Nach Restzeit',
            value: 'voteDate'
          }, {
            title: 'Nach Aktuallisierung',
            value: 'lastUpdateDate'
          }, {
            title: 'Nach Aktivitäten',
            value: 'activities'
          }]
        },
        vergangen: {
          sortBy: 'voteDate',
          all: [{
            title: 'Nach Abstimmungsdatum',
            value: 'voteDate'
          }, {
            title: 'Nach Aktuallisierung',
            value: 'lastUpdateDate'
          }, {
            title: 'Nach Aktivitäten',
            value: 'activities'
          }]
        },
        'in-vorbereitung': {
          sortBy: 'lastUpdateDate',
          all: [{
            title: 'Nach Restzeit',
            value: 'lastUpdateDate'
          }, {
            title: 'Nach Vorgangsdatum',
            value: 'created'
          }, {
            title: 'Nach Aktivitäten',
            value: 'activities'
          }]
        },
        'whats-hot': {
          sortBy: 'activities',
          all: []
        }
      }
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "setHasMore", function (hasMore) {
      _this.setState({
        hasMore: hasMore
      });
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "selectSubjectGroup", function (subjectGroup) {
      _this.setState({
        subjectGroups: [subjectGroup],
        allSubjectGroups: false,
        types: documentTypes,
        allTypes: true,
        hasMore: true
      });
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "toggleSubjectGroup", function (subjectGroup) {
      if (_this.state.subjectGroups.indexOf(subjectGroup) !== -1) {
        if (_this.state.allSubjectGroups) {
          _this.setState({
            subjectGroups: [subjectGroup],
            allSubjectGroups: false,
            hasMore: true
          });
        } else {
          _this.setState({
            subjectGroups: _this.state.subjectGroups.filter(function (f) {
              return f !== subjectGroup;
            }),
            allSubjectGroups: false,
            hasMore: true
          });
        }
      } else {
        _this.setState({
          subjectGroups: _toConsumableArray(_this.state.subjectGroups).concat([subjectGroup]),
          allSubjectGroups: _this.state.subjectGroups.length + 1 === Object.keys(Helpers_subjectGroupToIcon__WEBPACK_IMPORTED_MODULE_1__["subjectGroups"]).length,
          hasMore: true
        });
      }
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "toggleAllSubjectGroups", function () {
      if (_this.state.subjectGroups.length === Object.keys(Helpers_subjectGroupToIcon__WEBPACK_IMPORTED_MODULE_1__["subjectGroups"]).length) {
        _this.setState({
          subjectGroups: [],
          allSubjectGroups: false,
          hasMore: true
        });
      } else {
        _this.setState({
          subjectGroups: Object.keys(Helpers_subjectGroupToIcon__WEBPACK_IMPORTED_MODULE_1__["subjectGroups"]),
          allSubjectGroups: true,
          hasMore: true
        });
      }
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "changeSort", function (_ref) {
      var _objectSpread2;

      var listType = _ref.listType,
          sort = _ref.sort;

      _this.setState({
        sorters: _objectSpread({}, _this.state.sorters, (_objectSpread2 = {}, _defineProperty(_objectSpread2, listType, _objectSpread({}, _this.state.sorters[listType], {
          sortBy: sort
        })), _defineProperty(_objectSpread2, "hasMore", true), _objectSpread2))
      });
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "selectType", function (type) {
      _this.setState({
        types: [type],
        allTypes: false,
        subjectGroups: Object.keys(Helpers_subjectGroupToIcon__WEBPACK_IMPORTED_MODULE_1__["subjectGroups"]),
        allSubjectGroups: true,
        hasMore: true
      });
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "toggleType", function (type) {
      if (_this.state.types.indexOf(type) !== -1) {
        if (_this.state.allTypes) {
          _this.setState({
            types: [type],
            allTypes: false,
            hasMore: true
          });
        } else {
          _this.setState({
            types: _this.state.types.filter(function (f) {
              return f !== type;
            }),
            allTypes: false,
            hasMore: true
          });
        }
      } else {
        _this.setState({
          types: _toConsumableArray(_this.state.types).concat([type]),
          allTypes: _this.state.types.length + 1 === documentTypes.length,
          hasMore: true
        });
      }
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "toggleAllTypes", function () {
      if (_this.state.types.length === documentTypes.length) {
        _this.setState({
          types: [],
          allTypes: false,
          hasMore: true
        });
      } else {
        _this.setState({
          types: documentTypes,
          allTypes: true,
          hasMore: true
        });
      }
    });

    return _this;
  }

  _createClass(Provider, [{
    key: "render",
    value: function render() {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Context.Provider, {
        value: {
          state: this.state,
          selectSubjectGroup: this.selectSubjectGroup,
          toggleSubjectGroup: this.toggleSubjectGroup,
          toggleAllSubjectGroups: this.toggleAllSubjectGroups,
          selectType: this.selectType,
          toggleType: this.toggleType,
          toggleAllTypes: this.toggleAllTypes,
          changeSort: this.changeSort,
          setHasMore: this.setHasMore
        }
      }, this.props.children);
    }
  }]);

  return Provider;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);


/* harmony default export */ __webpack_exports__["default"] = (Context);

/***/ }),

/***/ "./lib/context/search.js":
/*!*******************************!*\
  !*** ./lib/context/search.js ***!
  \*******************************/
/*! exports provided: Provider, Consumer, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Provider", function() { return Provider; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Consumer", function() { return Consumer; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


var Context = react__WEBPACK_IMPORTED_MODULE_0___default.a.createContext();
var Consumer = Context.Consumer;

var Provider =
/*#__PURE__*/
function (_Component) {
  _inherits(Provider, _Component);

  function Provider() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Provider);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Provider)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "displayName", 'SearchProvider');

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "state", {
      term: ''
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "changeSearchTerm", function (term) {
      if (term !== _this.state.term) {
        _this.setState({
          term: term
        });
      }
    });

    return _this;
  }

  _createClass(Provider, [{
    key: "render",
    value: function render() {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Context.Provider, {
        value: _objectSpread({}, this.state, {
          changeSearchTerm: this.changeSearchTerm
        })
      }, this.props.children);
    }
  }]);

  return Provider;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);


/* harmony default export */ __webpack_exports__["default"] = (Context);

/***/ }),

/***/ "./lib/helpers/subjectGroupToIcon.js":
/*!*******************************************!*\
  !*** ./lib/helpers/subjectGroupToIcon.js ***!
  \*******************************************/
/*! exports provided: subjectGroups, getDisplayTitle, getImage, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subjectGroups", function() { return subjectGroups; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDisplayTitle", function() { return getDisplayTitle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getImage", function() { return getImage; });
var subjectGroups = {
  'Arbeit und Beschäftigung': {
    icon: 'hammer',
    image: '/static/images/sachgebiete/arbeit_beschaeftigung'
  },
  'Ausländerpolitik, Zuwanderung': {
    icon: 'add-user',
    image: '/static/images/sachgebiete/auslaenderpolitik'
  },
  'Außenpolitik und internationale Beziehungen': {
    icon: 'planet',
    displayTitle: 'Außenpolitik und intern. Beziehungen',
    image: '/static/images/sachgebiete/aussenpolitik'
  },
  Außenwirtschaft: {
    icon: 'anker',
    image: '/static/images/sachgebiete/aussenwirtschaft'
  },
  'Bildung und Erziehung': {
    icon: 'magic',
    image: '/static/images/sachgebiete/bildung_erziehung'
  },
  Bundestag: {
    icon: 'bundestag',
    image: '/static/images/sachgebiete/bundestag'
  },
  Energie: {
    icon: 'lamp',
    image: '/static/images/sachgebiete/energie'
  },
  Entwicklungspolitik: {
    icon: 'locate',
    image: '/static/images/sachgebiete/entwicklungspolitik'
  },
  'Europapolitik und Europäische Union': {
    icon: 'europe',
    image: '/static/images/sachgebiete/europapolitik'
  },
  'Gesellschaftspolitik, soziale Gruppen': {
    icon: 'society',
    image: '/static/images/sachgebiete/gesellschaft'
  },
  Gesundheit: {
    icon: 'heart',
    image: '/static/images/sachgebiete/gesundheit'
  },
  'Innere Sicherheit': {
    icon: 'camera',
    image: '/static/images/sachgebiete/innere_sicherheit'
  },
  Kultur: {
    icon: 'book',
    image: '/static/images/sachgebiete/kultur'
  },
  'Landwirtschaft und Ernährung': {
    icon: 'settings',
    image: '/static/images/sachgebiete/landwirtschaft_ernaehrung'
  },
  'Medien, Kommunikation und Informationstechnik': {
    icon: 'network',
    displayTitle: 'Medien, Kommunikation, Informationstechnik',
    image: '/static/images/sachgebiete/it'
  },
  'Neue Bundesländer / innerdeutsche Beziehungen': {
    icon: 'puzzle',
    displayTitle: 'Neue Bundesländer',
    image: '/static/images/sachgebiete/neue_bundeslaender'
  },
  'Öffentliche Finanzen, Steuern und Abgaben': {
    icon: 'calculator',
    image: '/static/images/sachgebiete/oeffentliche_finanzen_steuern_und_abgaben'
  },
  'Politisches Leben, Parteien': {
    icon: 'chat',
    displayTitle: 'Politisches Leben',
    image: '/static/images/sachgebiete/politisches_leben_parteien'
  },
  'Raumordnung, Bau- und Wohnungswesen': {
    icon: 'house',
    image: '/static/images/sachgebiete/bauwesen'
  },
  Recht: {
    icon: 'pen',
    image: '/static/images/sachgebiete/recht'
  },
  'Soziale Sicherung': {
    icon: 'umbrella',
    image: '/static/images/sachgebiete/soziale_sicherung'
  },
  'Sport, Freizeit und Tourismus': {
    icon: 'image',
    image: '/static/images/sachgebiete/tourismus'
  },
  'Staat und Verwaltung': {
    icon: 'government',
    image: '/static/images/sachgebiete/staat_verwaltung'
  },
  Umwelt: {
    icon: 'water-drop',
    image: '/static/images/sachgebiete/umwelt'
  },
  Verkehr: {
    icon: 'plane',
    image: '/static/images/sachgebiete/verkehr'
  },
  Verteidigung: {
    icon: 'shield',
    image: '/static/images/sachgebiete/verteidigung'
  },
  Wirtschaft: {
    icon: 'increase-arrow',
    image: '/static/images/sachgebiete/wirtschaft'
  },
  'Wissenschaft, Forschung und Technologie': {
    icon: 'rocket',
    image: '/static/images/sachgebiete/wissenschaft_forschung_technologie'
  }
};

var getDisplayTitle = function getDisplayTitle(subjectGroup) {
  if (subjectGroups[subjectGroup] && subjectGroups[subjectGroup].displayTitle) {
    return subjectGroups[subjectGroup].displayTitle;
  }

  return subjectGroup;
};

var getImage = function getImage(subjectGroup) {
  if (subjectGroups[subjectGroup] && subjectGroups[subjectGroup].image) {
    return subjectGroups[subjectGroup].image;
  } else {
    return '/static/images/sachgebiete/default';
  }
};


/* harmony default export */ __webpack_exports__["default"] = (function (subjectGroup) {
  if (subjectGroups[subjectGroup]) {
    return subjectGroups[subjectGroup].icon;
  }
});

/***/ }),

/***/ "./lib/init-apollo.js":
/*!****************************!*\
  !*** ./lib/init-apollo.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return initApollo; });
/* harmony import */ var apollo_boost__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! apollo-boost */ "apollo-boost");
/* harmony import */ var apollo_boost__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(apollo_boost__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! isomorphic-unfetch */ "isomorphic-unfetch");
/* harmony import */ var isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/config */ "next/config");
/* harmony import */ var next_config__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_config__WEBPACK_IMPORTED_MODULE_2__);






var _getConfig = next_config__WEBPACK_IMPORTED_MODULE_2___default()(),
    publicRuntimeConfig = _getConfig.publicRuntimeConfig,
    serverRuntimeConfig = _getConfig.serverRuntimeConfig;

var GRAPHQL_URL_SERVER = serverRuntimeConfig.GRAPHQL_URL_SERVER;
var GRAPHQL_URL = publicRuntimeConfig.GRAPHQL_URL;
var apolloClient = null; // Polyfill fetch() on the server (used by apollo-client)

if (!process.browser) {
  global.fetch = isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_1___default.a;
}

function create(initialState) {
  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  return new apollo_boost__WEBPACK_IMPORTED_MODULE_0__["ApolloClient"]({
    connectToDevTools: process.browser,
    ssrMode: !process.browser,
    // Disables forceFetch on the server (so queries are only run once)
    link: new apollo_boost__WEBPACK_IMPORTED_MODULE_0__["HttpLink"]({
      uri: process.browser ? GRAPHQL_URL : GRAPHQL_URL_SERVER // Server URL (must be absolute)
      // credentials: 'same-origin', // Additional fetch() options like `credentials` or `headers`

    }),
    cache: new apollo_boost__WEBPACK_IMPORTED_MODULE_0__["InMemoryCache"]({
      dataIdFromObject: function dataIdFromObject(o) {
        switch (o.__typename) {
          case 'Procedure':
            return o.procedureId;

          default:
            return o._id;
        }
      }
    }).restore(initialState || {})
  });
}

function initApollo(initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState);
  } // Reuse client on the client-side


  if (!apolloClient) {
    apolloClient = create(initialState);
  }

  return apolloClient;
}

/***/ }),

/***/ "./lib/with-apollo-client.js":
/*!***********************************!*\
  !*** ./lib/with-apollo-client.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "@babel/runtime/regenerator");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _init_apollo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./init-apollo */ "./lib/init-apollo.js");
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/head */ "next/head");
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_apollo__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-apollo */ "react-apollo");
/* harmony import */ var react_apollo__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_apollo__WEBPACK_IMPORTED_MODULE_4__);



function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




/* harmony default export */ __webpack_exports__["default"] = (function (App) {
  var _class, _temp;

  return _temp = _class =
  /*#__PURE__*/
  function (_React$Component) {
    _inherits(Apollo, _React$Component);

    _createClass(Apollo, null, [{
      key: "getInitialProps",
      value: function () {
        var _getInitialProps = _asyncToGenerator(
        /*#__PURE__*/
        _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(ctx) {
          var Component, router, appProps, apolloState, apollo;
          return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  Component = ctx.Component, router = ctx.router;
                  appProps = {};

                  if (!App.getInitialProps) {
                    _context.next = 6;
                    break;
                  }

                  _context.next = 5;
                  return App.getInitialProps(ctx);

                case 5:
                  appProps = _context.sent;

                case 6:
                  apolloState = {}; // Run all GraphQL queries in the component tree
                  // and extract the resulting data

                  apollo = Object(_init_apollo__WEBPACK_IMPORTED_MODULE_2__["default"])();
                  _context.prev = 8;
                  _context.next = 11;
                  return Object(react_apollo__WEBPACK_IMPORTED_MODULE_4__["getDataFromTree"])(react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(App, _extends({}, appProps, {
                    Component: Component,
                    router: router,
                    apolloState: apolloState,
                    apolloClient: apollo
                  })));

                case 11:
                  _context.next = 16;
                  break;

                case 13:
                  _context.prev = 13;
                  _context.t0 = _context["catch"](8);
                  // Prevent Apollo Client GraphQL errors from crashing SSR.
                  // Handle them in components via the data.error prop:
                  // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-error
                  // eslint-disable-next-line
                  console.error('Error while running `getDataFromTree`', _context.t0);

                case 16:
                  if (!process.browser) {
                    // getDataFromTree does not call componentWillUnmount
                    // head side effect therefore need to be cleared manually
                    next_head__WEBPACK_IMPORTED_MODULE_3___default.a.rewind();
                  } // Extract query data from the Apollo store


                  apolloState.data = apollo.cache.extract();
                  return _context.abrupt("return", _objectSpread({}, appProps, {
                    apolloState: apolloState
                  }));

                case 19:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this, [[8, 13]]);
        }));

        return function getInitialProps(_x) {
          return _getInitialProps.apply(this, arguments);
        };
      }()
    }]);

    function Apollo(props) {
      var _this;

      _classCallCheck(this, Apollo);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Apollo).call(this, props)); // `getDataFromTree` renders the component first, the client is passed off as a property.
      // After that rendering is done using Next's normal rendering pipeline

      _this.apolloClient = props.apolloClient || Object(_init_apollo__WEBPACK_IMPORTED_MODULE_2__["default"])(props.apolloState.data);
      return _this;
    }

    _createClass(Apollo, [{
      key: "render",
      value: function render() {
        return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(App, _extends({}, this.props, {
          apolloClient: this.apolloClient
        }));
      }
    }]);

    return Apollo;
  }(react__WEBPACK_IMPORTED_MODULE_1___default.a.Component), _defineProperty(_class, "displayName", 'withApollo(App)'), _temp;
});

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var next_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/app */ "next/app");
/* harmony import */ var next_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _lib_with_apollo_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/with-apollo-client */ "./lib/with-apollo-client.js");
/* harmony import */ var react_apollo__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-apollo */ "react-apollo");
/* harmony import */ var react_apollo__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_apollo__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var Context_filter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! Context/filter */ "./lib/context/filter.js");
/* harmony import */ var Context_search__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! Context/search */ "./lib/context/search.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




 // Context




var MyApp =
/*#__PURE__*/
function (_App) {
  _inherits(MyApp, _App);

  function MyApp() {
    _classCallCheck(this, MyApp);

    return _possibleConstructorReturn(this, _getPrototypeOf(MyApp).apply(this, arguments));
  }

  _createClass(MyApp, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          Component = _this$props.Component,
          pageProps = _this$props.pageProps,
          apolloClient = _this$props.apolloClient;
      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(next_app__WEBPACK_IMPORTED_MODULE_0__["Container"], null, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react_apollo__WEBPACK_IMPORTED_MODULE_3__["ApolloProvider"], {
        client: apolloClient
      }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(Context_filter__WEBPACK_IMPORTED_MODULE_4__["Provider"], null, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(Context_search__WEBPACK_IMPORTED_MODULE_5__["Provider"], null, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(Component, pageProps)))));
    }
  }]);

  return MyApp;
}(next_app__WEBPACK_IMPORTED_MODULE_0___default.a);

/* harmony default export */ __webpack_exports__["default"] = (Object(_lib_with_apollo_client__WEBPACK_IMPORTED_MODULE_2__["default"])(MyApp)); // democracy.de/ -> List
// democracy.de/details/123/Some-Title-From-Bundestag -> Detail
// democracy.de/123/Some-Title-From-Bundestag -> Detail
// democracy.de/123w/Some-Title-From-Bundestag2 -> Detail
// /gesetz/893842/Some-Title
// /antrag/234234/Some-Title

/***/ }),

/***/ 0:
/*!*****************************!*\
  !*** multi ./pages/_app.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./pages/_app.js */"./pages/_app.js");


/***/ }),

/***/ "@babel/runtime/regenerator":
/*!*********************************************!*\
  !*** external "@babel/runtime/regenerator" ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/regenerator");

/***/ }),

/***/ "apollo-boost":
/*!*******************************!*\
  !*** external "apollo-boost" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("apollo-boost");

/***/ }),

/***/ "isomorphic-unfetch":
/*!*************************************!*\
  !*** external "isomorphic-unfetch" ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("isomorphic-unfetch");

/***/ }),

/***/ "next/app":
/*!***************************!*\
  !*** external "next/app" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next/app");

/***/ }),

/***/ "next/config":
/*!******************************!*\
  !*** external "next/config" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next/config");

/***/ }),

/***/ "next/head":
/*!****************************!*\
  !*** external "next/head" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next/head");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),

/***/ "react-apollo":
/*!*******************************!*\
  !*** external "react-apollo" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-apollo");

/***/ })

/******/ });
//# sourceMappingURL=_app.js.map