import Conductor from "./conductor.js";
import WaveSplitController from "./controller/wave-split-controller.js";
import WaveDrawController from "./controller/wave-draw-controller.js";
import RangeController from "./controller/range-controller.js";

import { lineString, lineIntersect } from "@turf/turf";

let conductor = null;

function init() {
  let controllers = [];

  let waveDrawController, waveDrawSliderController, waveDrawSplitController;

  const textarea = document.querySelector("textarea");

  waveDrawController = new WaveDrawController("wave-draw");
  controllers.push(waveDrawController);

  waveDrawSliderController = new RangeController("wave-draw-slider");
  waveDrawSliderController.animate = false;
  controllers.push(waveDrawSliderController);

  waveDrawSplitController = new WaveSplitController("wave-draw-split");

  textarea.addEventListener("input", () => {
    const content = textarea.value;
    const val = JSON.parse(content);

    const line = lineString(val);

    const pts = [];

    for (let i = 0; i < 128; i++) {
      const percentage = i / 127;

      const itsct = lineString([
        [percentage, 0],
        [percentage, 1],
      ]);

      const r = lineIntersect(line, itsct);

      pts.push(r.features[0].geometry.coordinates[1]);
    }

    waveDrawController.wavePoints = pts.map(
      (el) => el * waveDrawController.height
    );

    waveDrawSplitController.fourierAmt = 0.3;
    waveDrawSplitController.setPath(waveDrawController.normPath);

    document.querySelector("#wave-draw-output").textContent = JSON.stringify(
      [...waveDrawSplitController.fourierData].sort(
        (a, b) => b.amplitude - a.amplitude
      ),
      null,
      4
    );
  });

  waveDrawController.onDrawingStart.push(() => {
    waveDrawSplitController.splitAnim = true;
    waveDrawSplitController.setPath([]);
  });

  waveDrawController.onDrawingEnd.push(() => {
    waveDrawSplitController.splitAnim = true;
    console.log(waveDrawController.normPath);
    waveDrawSplitController.setPath(waveDrawController.normPath);
  });

  waveDrawController.onDrawingStart.push(
    () => (waveDrawSliderController.slider.value = 1)
  );
  waveDrawController.onDrawingEnd.push(
    () => (waveDrawSliderController.slider.value = 1)
  );

  waveDrawSliderController.onValueChange.push((val) => {
    waveDrawSplitController.fourierAmt = val;
    waveDrawSplitController.splitAnim = false;
  });

  controllers.push(waveDrawSplitController);

  conductor = new Conductor(controllers);
  conductor.start();
  // To let me play around with things in the console.
  window.conductor = conductor;
}

function hasElement(id) {
  return document.getElementById(id) != null;
}

init();
