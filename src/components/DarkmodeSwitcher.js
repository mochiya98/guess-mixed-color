import { h } from "preact";
import { useCallback, useState } from "preact/hooks";

export const DarkmodeSwitcher = () => {
  const [isDarkmode, setDarkmode] = useState(() =>
    document.documentElement.classList.contains("darkmode")
  );
  const toggleDarkmode = useCallback(() => {
    setDarkmode(isDarkmode => {
      document.documentElement.classList.add("darkmode-switcher_switch");
      document.documentElement.classList[isDarkmode ? "remove" : "add"](
        "darkmode"
      );
      return !isDarkmode;
    });
  }, []);
  return (
    <span onClick={toggleDarkmode} class="darkmode-switcher">
      {isDarkmode ? "🌙" : "☀"}
    </span>
  );
};
