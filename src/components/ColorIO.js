import Color from "color";

import { h } from "preact";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "preact/hooks";

import { memo } from "../preactHelper";

function makeColorText(color, useAlpha, type) {
  let outColor = useAlpha ? color : color.alpha(1);
  if (type === 0) return outColor.toString();
  if (type === 1) return outColor.hex();
  if (type === 2)
    return outColor
      .hsl()
      .hue(Math.round(outColor.hsl().hue()))
      .string();
}

export const ColorIO = memo(
  ({
    useAlpha = false,
    disabled = false,
    defaultColor = "#094",
    onChange = null
  }) => {
    const inputRef = useRef(null);
    const [color, setColor] = useState(() => Color(defaultColor));
    const [type, setType] = useState(0);
    const colorText = useMemo(() => makeColorText(color, useAlpha, type), [
      color,
      type
    ]);
    const onInput = useCallback(e => {
      let newColor = null;
      try {
        newColor = Color(e.currentTarget.value).rgb();
        setColor(newColor);
        onChange && onChange(newColor);
      } catch (e) {}
    }, []);
    const onBlur = useCallback(
      e => {
        e.currentTarget.value = colorText;
      },
      [colorText, color]
    );
    const onDblClick = useCallback(e => {
      e.currentTarget.select();
    }, []);
    const switchType = useCallback(() => {
      setType(c => (c >= 2 ? 0 : c + 1));
    });
    useEffect(() => {
      const color = Color(defaultColor);
      const colorText = makeColorText(color, useAlpha, type);
      if (document.activeElement !== inputRef.current)
        inputRef.current.value = colorText;
      setColor(color);
    }, [type, defaultColor]);
    return (
      <div className={`color-io${disabled ? " color-io--disabled" : ""}`}>
        <button onClick={switchType} disabled={disabled}>
          {
            (useAlpha
              ? ["rgba()", "hex", "hsla()"]
              : ["rgb()", "hex", "hsl()"])[type]
          }
        </button>
        <span className="color-io__input-wrapper">
          <div
            className="color-io__input-wrapper__mark"
            style={{ backgroundColor: colorText }}
          />
          <input
            type="text"
            defaultValue={colorText}
            onInput={onInput}
            onDblClick={onDblClick}
            onBlur={onBlur}
            ref={inputRef}
            disabled={disabled}
          />
        </span>
      </div>
    );
  }
);
