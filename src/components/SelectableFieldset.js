import { h, createContext } from "preact";
import {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState
} from "preact/hooks";

const selectableGroupContext = createContext(null);

const generateRandomId = () => Math.random().toString();

export const useSelectableGroup = () => useContext(selectableGroupContext);

export const SelectableGroupProvider = ({ children }) => {
  const [checkedId, setCheckedId] = useState("");
  const state = useMemo(
    () => ({
      checkedId,
      setCheckedId
    }),
    [checkedId]
  );
  return (
    <selectableGroupContext.Provider value={state}>
      {children}
    </selectableGroupContext.Provider>
  );
};

export const SelectableFieldset = ({
  id: fixedId,
  title,
  children,
  checked: defaultChecked
}) => {
  const [id] = useState(fixedId ? fixedId : generateRandomId);
  const { checkedId, setCheckedId } = useSelectableGroup();
  const checkThis = useCallback(() => {
    setCheckedId(id);
  }, []);
  const stopPropagation = useCallback(e => {
    e.stopPropagation();
  }, []);
  useLayoutEffect(() => {
    if (defaultChecked) checkThis();
  }, [defaultChecked]);
  const isChecked = checkedId === id;
  return (
    <div
      className={`selectable-fieldset${
        isChecked ? " selectable-fieldset--checked" : ""
      }`}
      onClick={checkThis}
    >
      <div className="selectable-fieldset__wbox">
        <div className="selectable-fieldset__title">
          <div className="selectable-fieldset__radio" />
          {title}
        </div>
        <div className="selectable-fieldset__cbox" onClick={stopPropagation}>
          {children}
        </div>
      </div>
    </div>
  );
};
