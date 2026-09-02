// Powers the checklist "options" popup: any checklist item with an
// `options: [{ name, link }]` list in its data renders as a
// <button class="checklist-name checklist-name-has-options"
// data-options="[...]"> instead of a plain <span>. Clicking it opens the
// single shared #checklist-options-overlay (built once in the travel
// layout), populated here with a table of the item's options — each name
// links out (target="_blank") to its `link`.

(function () {
  function closeModal(overlay) {
    overlay.hidden = true;
  }

  function openModal(overlay, description, options) {
    var title = overlay.querySelector(".checklist-options-title");
    var tbody = overlay.querySelector("tbody");
    title.textContent = description;
    tbody.innerHTML = "";

    options.forEach(function (option, i) {
      var tr = document.createElement("tr");

      var numCell = document.createElement("td");
      numCell.textContent = i + 1;
      tr.appendChild(numCell);

      var nameCell = document.createElement("td");
      var link = document.createElement("a");
      link.href = option.link;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = option.name;
      nameCell.appendChild(link);
      tr.appendChild(nameCell);

      tbody.appendChild(tr);
    });

    overlay.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var overlay = document.getElementById("checklist-options-overlay");
    if (!overlay) return;

    document.querySelectorAll(".checklist-name-has-options").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var options;
        try {
          options = JSON.parse(btn.getAttribute("data-options"));
        } catch (e) {
          return;
        }
        // The trailing 🔗 icon span is part of the button's own text content —
        // strip it so the modal title shows just the checklist description.
        var description = btn.childNodes[0] ? btn.childNodes[0].textContent : btn.textContent;
        openModal(overlay, description, options);
      });
    });

    overlay.querySelector(".checklist-options-close").addEventListener("click", function () {
      closeModal(overlay);
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal(overlay);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) closeModal(overlay);
    });
  });
})();
