const pointersGesture = {};

class Webcam {
  constructor(element) {
    this.element = {
      image: element.querySelector(".webcam-image"),
      controls: element.querySelector(".webcam-controls")
    };

    this.position = {
      dx: 0,
      scale: 1
    };

    this.initEvents();
  }

  changeBrightness() {}

  scaleCamera() {}

  moveCamera(dx) {
    this.position.dx += dx;

    this.element.image.style.backgroundPosition = this.position.dx + "px";
  }

  initEvents() {
    this.element.image.addEventListener("pointerdown", this.addPointer);

    ["pointerup", "pointerout", "pointerleave"].forEach(event => {
      this.element.image.addEventListener(event, this.removePointer);
    });

    this.element.image.addEventListener(
      "pointermove",
      this.movePointer.bind(this)
    );
  }

  addPointer(e) {
    pointersGesture[e.pointerId] = {
      prevX: e.x
    };
  }

  removePointer(e) {
    delete pointersGesture[e.pointerId];
  }

  movePointer(e) {
    const { pointerId, x } = e;
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

    if (isPartOfTwoPointersMove) {
      // pinch
      // rotate
    }

    pointersGesture[pointerId] = {
      prevX: x
    };
  }
}

export default Webcam;
