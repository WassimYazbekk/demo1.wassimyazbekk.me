export default function setupDropdown(
  _setKeyboard: (arg0: "qwerty" | "dvorak") => void,
) {
  const trigger = document.getElementById("dropdown-trigger");
  const dropdownContent = document.getElementById("dropdown-content");
  const qwertyBtn = document.getElementById("qwerty");
  const dvorakBtn = document.getElementById("dvorak");
  let hidden = true;

  function openDropdown() {
    dropdownContent?.classList.remove("hidden");
    hidden = false;
  }

  function closeDropdown() {
    dropdownContent?.classList.add("hidden");
    hidden = true;
  }

  function setKeyboard(keyboard: "qwerty" | "dvorak") {
    _setKeyboard(keyboard);
    if (trigger) trigger.innerHTML = keyboard.toString().toUpperCase();
    closeDropdown();
  }

  trigger?.addEventListener("click", function () {
    if (hidden) {
      openDropdown();
    } else {
      closeDropdown();
    }
  });

  qwertyBtn?.addEventListener("click", function () {
    setKeyboard("qwerty");
  });
  dvorakBtn?.addEventListener("click", function () {
    setKeyboard("dvorak");
  });
}
