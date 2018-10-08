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

// looking for id of the second pointer
function getAnotherPointer(pointerId) {
	let secondGesturePointerId;

	Object.keys(pointersGesture).some(gesturePointerId => {
		if (gesturePointerId !== pointerId) {
			secondGesturePointerId = gesturePointerId;
			return true;
		}

		return false;
	});

	return secondGesturePointerId;
}

const pinchGesture = {
	beginDistance: null
};

const rotateGesture = {
	beginAngle: 0
};

class Webcam {
	constructor(element) {
		this.element = {
			container: element.querySelector(".webcam-field"),
			image: element.querySelector(".webcam-image"),
			brightnessDisplay: element.querySelector(".webcam-info_type-bright .webcam-info__value"),
			scaleDisplay: element.querySelector(".webcam-info_type-zoom .webcam-info__value")
		};

		this.image = {
			height: parseInt(this.element.image.clientHeight)
		};

		this.brightness = {
			MAX: 100,
			MIN: 25
		};

		this.scale = {
			MAX: 1.5,
			MIN: 0.25
		};

		this.settings = {
			dx: 0,
			scale: 1,
			brightness: 50
		};

		this.initEvents();
	}

	renderIndicator(type, value) {
		if (type === "brightness") {
			this.element.brightnessDisplay.innerText = `${value}%`;

			this.element.container.style.filter = `brightness(${value / 100})`;
		}

		if (type === "scale") {
			this.element.scaleDisplay.innerText = `${(value * 100).toFixed(0)}%`;

			this.element.image.style.transform = `scale(${value})`;
		}
	}

	changeBrightness(turnInRadians) {
		// turn on 360 radians - means change brightness from zero to 100
		const mapRadiansToBrightness = radians => {
			const brightness = Math.ceil(100 / radians);

			return brightness;
		};

		const brightnessIncrement = mapRadiansToBrightness(turnInRadians);

		// TODO: refactoring, [min, max]
		if (this.settings.brightness + brightnessIncrement > this.brightness.MAX) {
			this.settings.brightness = this.brightness.MAX;
		} else if (this.settings.brightness + brightnessIncrement < this.brightness.MIN) {
			this.settings.brightness = this.brightness.MIN;
		} else {
			this.settings.brightness += brightnessIncrement;
		}

		this.renderIndicator("brightness", this.settings.brightness);
	}

	scaleCamera(nextScaleRatio) {
		// нужно понять, как превратить dy в scale изображения
		// сейчас проблема в том, что я прибавляю scaleRatio к предыдущему значению

		// TODO: refactoring, [min, max]
		if (nextScaleRatio > this.scale.MAX) {
			this.settings.scale = this.scale.MAX;
		} else if (nextScaleRatio < this.scale.MIN) {
			this.settings.scale = this.scale.MIN;
		} else {
			this.settings.scale = nextScaleRatio;
		}

		// console.log("scale", scaleRatio, `scale(${this.settings.scale})`);

		this.renderIndicator("scale", this.settings.scale);
	}

	moveCamera(dx) {
		this.settings.dx += dx;

		this.element.image.style.backgroundPosition = this.settings.dx + "px";
	}

	initEvents() {
		this.element.container.addEventListener("pointerdown", this.addPointer);

		["pointerup", "pointerout", "pointerleave", "pointercancel"].forEach(event => {
			this.element.container.addEventListener(event, this.removePointer);
		});

		this.element.container.addEventListener("pointermove", this.movePointer.bind(this));
	}

	addPointer(e) {
		pointersGesture[e.pointerId] = {
			prevX: e.x,
			prevY: e.y,
			startX: e.x,
			startY: e.y,
			isPrimary: e.isPrimary,
			id: e.pointerId
		};
	}

	removePointer(e) {
		delete pointersGesture[e.pointerId];

		pinchGesture.beginDistance = null;
		rotateGesture.beginAngle = null;
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
			let secondGesturePointerId = getAnotherPointer(pointerId);

			// TODO: check, that rotate isn't active now
			// rotate gesture is primary, it's  a corner case of pinch

			this.tryPinchGesture({
				event: event,
				firstGesture: pointersGesture[pointerId],
				secondGesture: pointersGesture[secondGesturePointerId]
			});

			// rotate gesture
			this.tryRotateGesture({
				event: event,
				firstGesture: pointersGesture[pointerId],
				secondGesture: pointersGesture[secondGesturePointerId]
			});
		}

		pointersGesture[pointerId].prevX = x;
		pointersGesture[pointerId].prevY = y;
	}

	tryPinchGesture({ event, firstGesture, secondGesture }) {
		if (event.isPrimary) return null;

		if (!pinchGesture.beginDistance) {
			const beginDistance = Math.hypot(firstGesture.startX - secondGesture.startX, firstGesture.startY - secondGesture.startY);

			pinchGesture.beginDistance = beginDistance;
		}

		const currentDistance = Math.hypot(event.x - secondGesture.prevX, event.y - secondGesture.prevY);

		const dy = currentDistance / pinchGesture.beginDistance;

		// pinch down
		this.scaleCamera(dy);
	}

	tryRotateGesture({ event, firstGesture, secondGesture }) {
		// TODO: check distance between pointers,
		// in rotate gesture, distance between pointers should be consistent

		// caclulate beginAngle, angle in moment, when pointers was inited
		if (!rotateGesture.beginAngle) {
			const x1 = firstGesture.startX;
			const y1 = firstGesture.startY;

			const x2 = secondGesture.startX;
			const y2 = secondGesture.startY;

			const dx = x2 - x1;
			const dy = y2 - y1;

			const beginAngle = Math.atan2(dy, dx);

			rotateGesture.beginAngle = beginAngle;
		}

		const x1 = event.x;
		const y1 = event.y;

		const x2 = secondGesture.prevX;
		const y2 = secondGesture.prevY;

		// calculate CURRENT angle between fingers
		const dx = x2 - x1;
		const dy = y2 - y1;

		const currentAngle = Math.atan2(dy, dx);
		const changeAngle = currentAngle - rotateGesture.beginAngle;

		const rotationAngle = changeAngle * 180 / Math.PI;

		this.changeBrightness(rotationAngle);
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