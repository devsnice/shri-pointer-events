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
			brightnessDisplay: element.querySelector(
				".webcam-info_type-bright .webcam-info__value"
			),
			scaleDisplay: element.querySelector(".webcam-info_type-zoom .webcam-info__value")
		};

		this.image = {
			height: parseInt(this.element.image.clientHeight)
		};

		this.brightness = {
			MAX: 100,
			MIN: 0
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

	scaleCamera(dy) {
		// нужно понять, как превратить dy в scale изображения
		// сейчас проблема в том, что я прибавляю scaleRatio к предыдущему значению

		const scaleRatio = dy * 0.001;

		// TODO: refactoring, [min, max]
		if (this.settings.scale + scaleRatio > this.scale.MAX) {
			this.settings.scale = this.scale.MAX;
		} else if (this.settings.scale + scaleRatio < this.scale.MIN) {
			this.settings.scale = this.scale.MIN;
		} else {
			this.settings.scale += scaleRatio;
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
		if (!pinchGesture.beginDistance) {
			const beginDistance = Math.hypot(
				firstGesture.startX - secondGesture.startX,
				firstGesture.startY - secondGesture.startY
			);

			pinchGesture.beginDistance = beginDistance;
		}

		const currentDistance = Math.hypot(
			event.x - secondGesture.prevX,
			event.y - secondGesture.prevY
		);

		const dy = currentDistance - pinchGesture.beginDistance;

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

		const rotationAngle = (changeAngle * 180) / Math.PI;

		this.changeBrightness(rotationAngle);
	}
}

export default Webcam;
