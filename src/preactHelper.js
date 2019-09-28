import { h } from "preact";

function shallowDiffers(a, b) {
  for (let i in a) if (!(i in b)) return true;
  for (let i in b) if (a[i] !== b[i]) return true;
  return false;
}

function assign(obj, props) {
  for (let i in props) obj[i] = props[i];
  return /** @type {O & P} */ (obj);
}

export function memo(c, comparer) {
  function shouldUpdate(nextProps) {
    let ref = this.props.ref;
    let updateRef = ref == nextProps.ref;
    if (!updateRef && ref) {
      ref.call ? ref(null) : (ref.current = null);
    }
    return (
      (!comparer
        ? shallowDiffers(this.props, nextProps)
        : !comparer(this.props, nextProps)) || !updateRef
    );
  }

  function Memoed(props) {
    this.shouldComponentUpdate = shouldUpdate;
    return h(c, assign({}, props));
  }
  //Memoed.prototype.isReactComponent = true;
  //Memoed.displayName = 'Memo(' + (c.displayName || c.name) + ')';
  Memoed._forwarded = true;
  return Memoed;
}
