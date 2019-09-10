import { h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";

export const RangeInputWithValue = ({
  defaultValue = 0,
  onChange: onChangeArg,
  normalizer,
  ...args
}) => {
  const [value, setValue] = useState(defaultValue);
  const onChange = useCallback(e => {
    setValue(e.currentTarget.value);
    onChangeArg && onChangeArg(e);
  }, []);
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);
  return (
    <span>
      <input type="range" {...args} value={value} onChange={onChange} />
      <span>{normalizer ? normalizer(value) : value}</span>
    </span>
  );
};
