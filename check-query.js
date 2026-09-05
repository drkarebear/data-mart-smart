"use strict";

const form = document.getElementById('audit-form');
      const checkButton = document.getElementById('check-button');
      const resetButton = document.getElementById('reset-button');
      const result = document.getElementById('audit-result');

      function renderResult() {
        const boxes = [...form.querySelectorAll('input[name="audit"]')];
        const checked = boxes.filter(box => box.checked).length;
        const total = boxes.length;
        let message = "";

        if (checked === total) {
          message = "<strong>All " + total + " checks are complete.</strong> Your setup is ready for interpretation, assuming the underlying report definitions support your choices. Save your method before you publish the result.";
        } else if (checked >= 6) {
          message = "<strong>You completed " + checked + " of " + total + " checks.</strong> You are close. Review the unchecked items before calculating, ranking, or drawing conclusions.";
        } else {
          message = "<strong>You completed " + checked + " of " + total + " checks.</strong> Several methodological questions are still open. Resolve those first; they could materially change the result.";
        }

        result.innerHTML = message;
        result.hidden = false;
        result.focus();
      }

      checkButton.addEventListener('click', renderResult);
      resetButton.addEventListener('click', () => {
        result.hidden = true;
        result.innerHTML = "";
      });
