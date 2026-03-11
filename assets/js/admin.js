(function () {
  const form = document.getElementById("upload-form");
  const slotSelect = document.getElementById("slot");
  const imageInput = document.getElementById("image");
  const status = document.getElementById("status");
  const slotMapList = document.getElementById("slot-map-list");

  function setStatus(message, type) {
    status.textContent = message;
    status.classList.remove("ok", "error");
    if (type) {
      status.classList.add(type);
    }
  }

  function renderMap(map) {
    const entries = Object.entries(map || {});
    slotMapList.innerHTML = "";

    if (!entries.length) {
      slotMapList.innerHTML = "<li>No image slots found.</li>";
      return;
    }

    entries.forEach(function (entry) {
      const li = document.createElement("li");
      li.textContent = entry[0] + " -> " + entry[1];
      slotMapList.appendChild(li);
    });
  }

  function setSlotOptions(slots) {
    slotSelect.innerHTML = "";
    slots.forEach(function (slot) {
      const option = document.createElement("option");
      if (typeof slot === "string") {
        option.value = slot;
        option.textContent = slot;
      } else {
        option.value = slot.key;
        option.textContent = slot.label || slot.key;
      }
      slotSelect.appendChild(option);
    });
  }

  function loadImageMap() {
    return fetch("/api/image-map")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Could not load slot map.");
        }
        return response.json();
      })
      .then(function (map) {
        const slots = Object.keys(map || {});
        if (slots.length) {
          setSlotOptions(slots);
          renderMap(map);
          return;
        }

        return fetch("/api/slots")
          .then(function (response) {
            if (!response.ok) {
              throw new Error("Could not load image slots.");
            }
            return response.json();
          })
          .then(function (payload) {
            setSlotOptions(payload.slots || []);
            renderMap(map);
          });
      })
      .catch(function (error) {
        setStatus(error.message, "error");
      });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!imageInput.files || !imageInput.files[0]) {
      setStatus("Please choose an image first.", "error");
      return;
    }

    const slot = slotSelect.value;

    const data = new FormData();
    data.append("slot", slot);
    data.append("image", imageInput.files[0]);

    setStatus("Uploading image...", "");

    fetch("/api/upload", {
      method: "POST",
      body: data
    })
      .then(function (response) {
        return response.json().then(function (payload) {
          return { ok: response.ok, payload };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          throw new Error(result.payload.error || "Upload failed.");
        }

        setStatus("Upload complete. Slot updated: " + result.payload.slot, "ok");
        form.reset();
        renderMap(result.payload.map);
      })
      .catch(function (error) {
        setStatus(error.message, "error");
      });
  });

  loadImageMap();
})();
