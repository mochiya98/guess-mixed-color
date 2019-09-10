import Color from "color";

import { h } from "preact";
import { useMemo } from "preact/hooks";

export const ColorPreview = ({ base, mix, mixAlpha }) => {
  const baseRGBA = useMemo(
    () =>
      Color(base)
        .rgb()
        .toString(),
    [base]
  );
  const mixRGBA = useMemo(
    () =>
      Color([...mix, mixAlpha])
        .rgb()
        .toString(),
    [mix, mixAlpha]
  );
  return (
    <div className="color-preview">
      <div style={{ backgroundColor: baseRGBA }} />
      <div style={{ backgroundColor: mixRGBA }} />
    </div>
  );
};
