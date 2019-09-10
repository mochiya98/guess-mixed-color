import { h, createContext } from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "preact/hooks";

import { memo } from "../preactHelper";

import { ColorPreview } from "./ColorPreview";
import { DarkmodeSwitcher } from "./DarkmodeSwitcher";
import { RangeInputWithValue } from "./RangeInputWithValue";
import {
  SelectableGroupProvider,
  SelectableFieldset,
  useSelectableGroup
} from "./SelectableFieldset";
import { ColorIO } from "./ColorIO";
import {
  guessColor,
  guessTargetID_baseColor,
  guessTargetID_mixColor,
  guessTargetID_mixAlpha,
  guessTargetID_mixedColor
} from "../guessColor";

const rangeNormalizer = val =>
  `${(val - 0).toFixed(2)}(${Math.round(val * 255)})`;

const AppView = () => {
  const { checkedId: guessTarget } = useSelectableGroup();
  const guessTargetRef = useRef(guessTarget);

  useEffect(() => {
    guessTargetRef.current = guessTarget;
    setColors(colors => guessColor({ ...colors }, guessTarget));
  }, [guessTarget]);

  const [colors, setColors] = useState({
    base: [0, 153, 0],
    mix: [0, 10, 255],
    mixAlpha: 0.5,
    mixed: [0, 82, 128]
  });
  const onChangeBaseColor = useCallback(color => {
    setColors(colors =>
      guessColor({ ...colors, base: color.array() }, guessTargetRef.current)
    );
  }, []);
  const onChangeMixAlpha = useCallback(e => {
    const mixAlpha = e.currentTarget.value - 0;
    setColors(colors =>
      guessColor({ ...colors, mixAlpha }, guessTargetRef.current)
    );
  }, []);
  const onChangeMixColor = useCallback(color => {
    setColors(colors => {
      const mix = color.array();
      const newColors = { ...colors, mix };
      if (mix[3] && mix[3] !== 1) colors.mixAlpha = mix[3];
      return guessColor(newColors, guessTargetRef.current);
    });
  }, []);
  const onChangeMixedColor = useCallback(color => {
    setColors(colors =>
      guessColor({ ...colors, mixed: color.array() }, guessTargetRef.current)
    );
  }, []);

  return (
    <article id="guess-mixed-color-view">
      <h1>
        <DarkmodeSwitcher />
        重ねた色から元の色を計算するやつ
      </h1>
      <p>
        ラジオボタンで補完対象を選択し、残り3つの値を入力すれば、選択した対象を補完してくれます
      </p>
      <p>注: 計算誤差により、補完される値と元の値は必ずしも一致しません</p>
      <div>
        <SelectableFieldset id={guessTargetID_baseColor} title="基本色">
          <ColorIO defaultColor={colors.base} onChange={onChangeBaseColor} />
        </SelectableFieldset>
      </div>
      <div>
        <SelectableFieldset id={guessTargetID_mixColor} title="合成色">
          <ColorIO defaultColor={colors.mix} onChange={onChangeMixColor} />
        </SelectableFieldset>
        <SelectableFieldset id={guessTargetID_mixAlpha} title="合成色(透明度)">
          <RangeInputWithValue
            normalizer={rangeNormalizer}
            onChange={onChangeMixAlpha}
            min="0"
            max="1"
            defaultValue={colors.mixAlpha}
            step="0.01"
          />
        </SelectableFieldset>
      </div>
      <div>
        <SelectableFieldset
          id={guessTargetID_mixedColor}
          title="結果色"
          checked
        >
          <ColorIO defaultColor={colors.mixed} onChange={onChangeMixedColor} />
        </SelectableFieldset>
      </div>
      <div>
        <ColorPreview
          base={colors.base}
          mix={colors.mix}
          mixAlpha={colors.mixAlpha}
        />
      </div>
      <div>
        <small>
          <a href="https://twitter.com/mochiya98">@mochiya98</a>
        </small>
      </div>
    </article>
  );
};

export const App = () => {
  return (
    <SelectableGroupProvider>
      <AppView />
    </SelectableGroupProvider>
  );
};
