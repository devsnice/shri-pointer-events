import throttle from "./throttle";

const pointersGesture = {};

const pinchGesture = {
  prevDistance: null,
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
    this.tryPinchGesture = throttle(this.tryPinchGesture, 50);
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

      // looking for id of the second pointer
      Object.keys(pointersGesture).some(gesturePointerId => {
        if (gesturePointerId !== pointerId) {
          secondGesturePointerId = gesturePointerId;
          return true;
        }

        return false;
      });

      // try to figure out, there is a pinch
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
}

export default Webcam;
