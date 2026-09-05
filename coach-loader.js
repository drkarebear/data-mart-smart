"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("loadCoachButton");
  const container = document.getElementById("coachFrameContainer");
  const frame = container ? container.querySelector("iframe[data-src]") : null;
  if (!button || !container || !frame) return;
  button.addEventListener("click", () => {
    if (!frame.src) frame.src = frame.dataset.src;
    container.hidden = false;
    button.hidden = true;
    frame.focus();
  }, { once: true });
});
