import Webcam from "../components/webcam/webcam.js";

const webcamElement = document.getElementById("webcam");

if (webcamElement) {
  const homeWebcam = new Webcam(webcamElement);
}
