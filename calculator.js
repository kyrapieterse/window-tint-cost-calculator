(() => {
  const worksheet = document.getElementById("worksheet");
  const form = document.getElementById("entry");
  const groups = document.getElementById("pane-groups");
  const template = document.getElementById("pane-template");
  const addButton = document.getElementById("add-group");
  const rate = document.getElementById("rate");
  const extras = document.getElementById("extras");
  const note = document.getElementById("estimate-note");
  const finalPriceNote = note.textContent;
  const status = document.getElementById("announcement");
  const result = {
    total: document.getElementById("total"),
    panes: document.getElementById("pane-count"),
    area: document.getElementById("area"),
    fitting: document.getElementById("fitting"),
    extras: document.getElementById("extra-total")
  };
  const currency = new Intl.NumberFormat("en-ZA", {
    style: "currency", currency: "ZAR", minimumFractionDigits: 2, trailingZeroDisplay: "stripIfInteger"
  });
  const areaFormat = new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 6 });
  const countFormat = new Intl.NumberFormat("en-ZA");
  let nextGroupId = 0;
  let announcementTimer;

  function createGroup(values = { quantity: 1 }) {
    const group = template.content.firstElementChild.cloneNode(true);
    const id = `pane-${++nextGroupId}`;
    group.querySelector("h3").id = id;
    group.setAttribute("aria-labelledby", id);
    for (const input of group.querySelectorAll("input")) {
      const key = input.dataset.key;
      const field = input.closest(".field");
      input.id = `${id}-${key}`;
      field.querySelector("label").htmlFor = input.id;
      field.querySelector(".field-error").id = `${input.id}-error`;
      input.setAttribute("aria-describedby", `${input.id}-error`);
      input.value = values[key] ?? "";
    }
    groups.append(group);
    return group;
  }

  function labelGroups() {
    Array.from(groups.children).forEach((group, index) => {
      const title = `Pane group ${index + 1}`;
      group.querySelector("h3").textContent = title;
      const remove = group.querySelector("[data-remove]");
      remove.hidden = groups.childElementCount === 1;
      remove.setAttribute("aria-label", `Remove pane group ${index + 1}`);
    });
  }

  function fieldMessage(input) {
    if (input.validity.valid) return "";
    if (input === rate) return "Enter a rate above R0 with up to two decimal places.";
    if (input === extras) return "Enter R0 or more with up to two decimal places, or leave this blank.";
    if (input.dataset.key === "quantity") return "Enter a whole number of panes, at least 1.";
    const dimension = input.dataset.key === "widthMm" ? "width" : "height";
    return `Enter the ${dimension} in whole millimetres, at least 1 mm.`;
  }

  function checkFields() {
    let firstIssue = "";
    for (const input of form.querySelectorAll("input")) {
      const message = fieldMessage(input);
      const error = document.getElementById(`${input.id}-error`);
      const showError = Boolean(message && input.dataset.visited);
      input.setAttribute("aria-invalid", String(showError));
      error.hidden = !showError;
      error.textContent = showError ? message : "";
      if (message && !firstIssue) {
        const heading = input.closest(".pane-group")?.querySelector("h3").textContent;
        firstIssue = heading ? `Check ${heading.toLowerCase()}. ${message}` : message;
      }
    }
    return firstIssue;
  }

  function readGroups() {
    return Array.from(groups.children, group => {
      const values = {};
      for (const input of group.querySelectorAll("input")) {
        values[input.dataset.key] = input.valueAsNumber;
      }
      return values;
    });
  }

  function render(announce = true) {
    let message = checkFields();
    let estimate;
    if (!message) {
      try {
        const rateCents = Math.round(rate.valueAsNumber * 100);
        const extraCents = extras.value === "" ? 0 : Math.round(extras.valueAsNumber * 100);
        estimate = calculateEstimate(readGroups(), rateCents, extraCents);
      } catch (error) {
        if (!(error instanceof RangeError)) throw error;
        message = error.message;
      }
    }

    if (estimate) {
      result.panes.textContent = countFormat.format(estimate.paneCount);
      result.area.textContent = `${areaFormat.format(estimate.areaM2)} m²`;
      result.fitting.textContent = currency.format(estimate.fittingCents / 100);
      result.extras.textContent = currency.format(estimate.extraCents / 100);
      result.total.textContent = currency.format(estimate.totalCents / 100);
      note.textContent = rate.valueAsNumber === 450 ? `R450/m² is an example rate. ${finalPriceNote}` : finalPriceNote;
      message = `Estimated total ${result.total.textContent} for ${result.area.textContent} of glass across ${result.panes.textContent} ${estimate.paneCount === 1 ? "pane" : "panes"}.`;
    } else {
      for (const output of Object.values(result)) output.textContent = "—";
      note.textContent = message;
    }

    // Announce the settled total rather than every digit in a measurement.
    clearTimeout(announcementTimer);
    if (announce) {
      announcementTimer = setTimeout(() => {
        if (status.textContent !== message) status.textContent = message;
      }, 400);
    }
  }

  form.addEventListener("submit", event => event.preventDefault());
  form.addEventListener("input", () => render());
  form.addEventListener("focusout", event => {
    if (event.target.matches("input")) {
      event.target.dataset.visited = "true";
      render();
    }
  });
  addButton.addEventListener("click", () => {
    const group = createGroup();
    labelGroups();
    group.querySelector("input").focus();
    render();
  });
  groups.addEventListener("click", event => {
    const remove = event.target.closest("[data-remove]");
    if (!remove || groups.childElementCount === 1) return;
    const group = remove.closest(".pane-group");
    const focusGroup = group.nextElementSibling || group.previousElementSibling;
    group.remove();
    labelGroups();
    focusGroup.querySelector("input").focus();
    render();
  });

  createGroup({ widthMm: 1000, heightMm: 1500, quantity: 4 });
  labelGroups();
  render(false);
  worksheet.hidden = false;
  document.getElementById("view-estimate").hidden = false;
})();
