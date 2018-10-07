import throttle from "./throttle";

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
  prevDistance: null
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
      )
    };

    this.image = {
      height: parseInt(this.element.image.clientHeight)
    };

    this.position = {
      dx: 0,
      scale: 1,
      brightness: 50
    };

    this.initEvents();

    this.tryPinchGesture = throttle(this.tryPinchGesture, 50);
  }

  renderIndicator(type, value) {
    if (type === "brightness") {
      this.element.brightnessDisplay.innerText = `${value}%`;

      this.element.container.style.filter = `brightness(${value / 100})`;
    }
  }

  changeBrightness(turnInRadians) {
    // turn on 360 radians - means change brightness from zero to 100
    const mapRadiansToBrightness = radians => {
      const brightness = Math.ceil(100 / (radians + 180));

      return brightness;
    };

    const brightnessIncrement = mapRadiansToBrightness(turnInRadians);

    // TODO: refactoring, [min, max]
    if (this.position.brightness + brightnessIncrement > 100) {
      this.position.brightness = 100;
    } else if (this.position.brightness + brightnessIncrement < 0) {
      this.position.brightness = 0;
    } else {
      this.position.brightness += brightnessIncrement;
    }

    console.log(
      "increment",
      turnInRadians,
      brightnessIncrement,
      this.position.brightness
    );

    this.renderIndicator("brightness", this.position.brightness);
  }

  scaleCamera(dy) {
    const scaleRatio = dy / this.image.height;

    this.position.scale += scaleRatio;

    // console.log("scale", scaleRatio, `scale(${this.position.scale})`);

    this.element.image.style.transform = `scale(${this.position.scale})`;
  }

  moveCamera(dx) {
    this.position.dx += dx;

    this.element.image.style.backgroundPosition = this.position.dx + "px";
  }

  initEvents() {
    this.element.container.addEventListener("pointerdown", this.addPointer);

    ["pointerup", "pointerout", "pointerleave", "pointercancel"].forEach(
      event => {
        this.element.container.addEventListener(event, this.removePointer);
      }
    );

    this.element.container.addEventListener(
      "pointermove",
      this.movePointer.bind(this)
    );
  }

  addPointer(e) {
    pointersGesture[e.pointerId] = {
      prevX: e.x,
      prevY: e.y,
      startX: e.x,
      startY: e.y
    };
  }

  removePointer(e) {
    delete pointersGesture[e.pointerId];

    pinchGesture.prevDistance = null;
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
        secondGesture: pointersGesture[secondGesturePointerId]
      });

      // rotate gesture
      this.tryRotateGesture({
        event: event,
        firstGesture: pointersGesture[pointerId],
        secondGesture: pointersGesture[secondGesturePointerId]
      });
    }

    pointersGesture[pointerId] = {
      prevX: x,
      prevY: y
    };
  }

  tryPinchGesture({ event, secondGesture }) {
    const currentDistance = Math.hypot(
      secondGesture.prevX - event.x,
      secondGesture.prevY - event.y
    );

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

    pinchGesture.prevDistance = currentDistance;
  }

  tryRotateGesture({ event, firstGesture, secondGesture }) {
    // TODO: check distance between pointers,
    // in rotate gesture, distance between pointers should be consistent

    // caclulate beginAngle, angle in moment, when pointers was inited
    if (!pinchGesture.beginAngle) {
      const x1 = firstGesture.startX;
      const y1 = firstGesture.startY;

      const x2 = secondGesture.startX;
      const y2 = secondGesture.startY;

      const dx = x2 - x1;
      const dy = y2 - y1;

      const beginAngle = Math.atan2(dy, dx);

      pinchGesture.beginAngle = beginAngle;
    }

    const x1 = event.x;
    const y1 = event.y;

    const x2 = secondGesture.prevX;
    const y2 = secondGesture.prevY;

    // calculate CURRENT angle between fingers
    const dx = x2 - x1;
    const dy = y2 - y1;

    const currentAngle = Math.atan2(dy, dx);
    const changeAngle = currentAngle - pinchGesture.beginAngle;

    const rotationAngle = (changeAngle * 180) / Math.PI;

    this.changeBrightness(rotationAngle);
  }
}

export default Webcam;
