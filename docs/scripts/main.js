/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
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
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/pages/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/components/webcam/webcam.js":
/*!*****************************************!*\
  !*** ./src/components/webcam/webcam.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const pointersGesture = {};

const pinchGesture = {
  prevDistance: null,
  inWork: false,
  lastTime: 0
};

class Webcam {
  constructor(element) {
    this.element = {
      container: element.querySelector(".webcam-field"),
      image: element.querySelector(".webcam-image"),
      controls: element.querySelector(".webcam-controls")
    };

    this.image = {
      height: parseInt(this.element.image.clientHeight)
    };

    this.position = {
      dx: 0,
      scale: 1
    };

    this.initEvents();
  }

  changeBrightness() {}

  scaleCamera(dy) {
    const scaleRatio = dy / this.image.height;

    this.position.scale += scaleRatio;

    console.log("scale", scaleRatio, `scale(${this.position.scale})`);

    this.element.image.style.transform = `scale(${this.position.scale})`;
  }

  moveCamera(dx) {
    this.position.dx += dx;

    this.element.image.style.backgroundPosition = this.position.dx + "px";
  }

  initEvents() {
    this.element.container.addEventListener("pointerdown", this.addPointer);

    ["pointerup", "pointerout", "pointerleave"].forEach(event => {
      this.element.container.addEventListener(event, this.removePointer);
    });

    this.element.container.addEventListener("pointermove", this.movePointer.bind(this));
  }

  addPointer(e) {
    pointersGesture[e.pointerId] = {
      prevX: e.x,
      prevY: e.y
    };
  }

  removePointer(e) {
    delete pointersGesture[e.pointerId];
    pinchGesture.prevDistance = null;
  }

  movePointer(e) {
    const { pointerId, x, y } = e;
    const gesture = pointersGesture[pointerId];

    if (!gesture) {
      return null;
    }

    const isOnePointerMove = Object.keys(pointersGesture).length === 1;
    const isPartOfTwoPointersMove = Object.keys(pointersGesture).length === 2;

    // one pointer means camera move gesture
    if (isOnePointerMove) {
      const dx = x - gesture.prevX;

      this.moveCamera(dx);
    }

    // two pointers can be rotate or pinch gesture
    if (isPartOfTwoPointersMove) {
      let secondGesturePointerId;

      Object.keys(pointersGesture).some(gesturePointerId => {
        if (gesturePointerId !== pointerId) {
          secondGesturePointerId = gesturePointerId;
          return true;
        }

        return false;
      });

      // try to figure out, there is pinch
      this.tryPinchGesture({
        event: event,
        secondGesture: pointersGesture[secondGesturePointerId]
      });
    }

    pointersGesture[pointerId] = {
      prevX: x,
      prevY: y
    };
  }

  tryPinchGesture({ event, secondGesture }) {
    if (pinchGesture.inWork) {
      return null;
    } else {
      pinchGesture.inWork = true;
    }

    const currentDistance = Math.hypot(secondGesture.prevX - event.x, secondGesture.prevY - event.y);

    if (pinchGesture.prevDistance > 0) {
      const dy = Math.abs(currentDistance - pinchGesture.prevDistance);

      if (pinchGesture.prevDistance < currentDistance) {
        // pinch up
        this.scaleCamera(dy);
      }

      if (pinchGesture.prevDistance > currentDistance) {
        // pinch down
        this.scaleCamera(-dy);
      }
    }

    pinchGesture.inWork = false;
    pinchGesture.prevDistance = currentDistance;
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Webcam);

/***/ }),

/***/ "./src/pages/index.js":
/*!****************************!*\
  !*** ./src/pages/index.js ***!
  \****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_webcam_webcam_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../components/webcam/webcam.js */ "./src/components/webcam/webcam.js");


const webcamElement = document.getElementById("webcam");

if (webcamElement) {
  const homeWebcam = new _components_webcam_webcam_js__WEBPACK_IMPORTED_MODULE_0__["default"](webcamElement);
}

/***/ })

/******/ });
//# sourceMappingURL=main.js.map