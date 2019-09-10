import Color from "color";

import {h,render,createContext} from 'preact'
import {useCallback,useContext,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'preact/hooks';

function shallowDiffers(a, b) {
	for (let i in a) if (!(i in b)) return true;
	for (let i in b) if (a[i]!==b[i]) return true;
	return false;
}
function assign(obj, props) {
	for (let i in props) obj[i] = props[i];
	return /** @type {O & P} */ (obj);
}
function memo(c, comparer) {
	function shouldUpdate(nextProps) {
		let ref = this.props.ref;
		let updateRef = ref==nextProps.ref;
		if (!updateRef && ref) {
			ref.call ? ref(null) : (ref.current = null);
		}
		return (!comparer
			? shallowDiffers(this.props, nextProps)
			: !comparer(this.props, nextProps)) || !updateRef;
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

const selectableGroupContext=createContext(null);

const SelectableGroupProvider = ({children}) => {
	const [checkedId,setCheckedId]=useState("");
	const state=useMemo(()=>({
		checkedId,
		setCheckedId
	}),[checkedId]);
	return (
		<selectableGroupContext.Provider value={state}>
			{children}
		</selectableGroupContext.Provider>
	);
};

const useSelectableGroup = () => useContext(selectableGroupContext);

const generateRandomId = () => Math.random().toString();

const SelectableFieldset = ({id:fixedId,title,children,checked:defaultChecked}) => {
	const [id]=useState(fixedId?fixedId:generateRandomId);
	const {checkedId,setCheckedId} = useSelectableGroup();
	const checkThis = useCallback(()=>{
		setCheckedId(id);
	},[]);
	const stopPropagation = useCallback((e)=>{
		e.stopPropagation();
	},[]);
	useLayoutEffect(()=>{
		if(defaultChecked)checkThis();
	},[defaultChecked]);
	const isChecked=checkedId===id;
	return (
		<div className={`selectable-fieldset${isChecked?" selectable-fieldset--checked":""}`} onClick={checkThis}>
			<div className="selectable-fieldset__wbox">
				<div className="selectable-fieldset__title"><div className="selectable-fieldset__radio"/>{title}</div>
				<div className="selectable-fieldset__cbox" onClick={stopPropagation}>
					{children}
				</div>
			</div>
		</div>
	);
};

function calcluateColorText(color,useAlpha,type){
		let outColor=useAlpha?color:color.alpha(1);
		if(type===0)return outColor.toString();
		if(type===1)return outColor.hex();
		if(type===2)return outColor.hsl().hue(Math.round(outColor.hsl().hue())).string();
}

const ColorIO = memo(({useAlpha=false,disabled=false,defaultColor="#094",onChange=null}) => {
	const inputRef = useRef(null);
	const [color,setColor]=useState(()=>Color(defaultColor));
	const [type,setType]=useState(0);
	const colorText = useMemo(()=>calcluateColorText(color,useAlpha,type),[color,type]);
	const onInput = useCallback((e)=>{
		let newColor=null;
		try{
			newColor=Color(e.currentTarget.value).rgb();
			setColor(newColor);
			onChange&&onChange(newColor);
		}catch(e){
		}
	},[]);
	const onBlur = useCallback((e)=>{
		e.currentTarget.value=colorText;
	},[colorText,color]);
	const onDblClick = useCallback((e)=>{
		e.currentTarget.select();
	},[]);
	const switchType = useCallback(() => {
		setType(c=>c>=2?0:c+1);
	});
	useEffect(()=>{
		const color=Color(defaultColor);
		const colorText=calcluateColorText(color,useAlpha,type);
		if(document.activeElement!==inputRef.current)inputRef.current.value=colorText;
		setColor(color);
	},[type,defaultColor]);
	return (
		<div className={`color-io${disabled?" color-io--disabled":""}`}>
			<button onClick={switchType} disabled={disabled}>{(useAlpha?["rgba()","hex","hsla()"]:["rgb()","hex","hsl()"])[type]}</button>
			<span className="color-io__input-wrapper">
				<div className="color-io__input-wrapper__mark" style={{backgroundColor:colorText}}/>
				<input type="text" defaultValue={colorText} onInput={onInput} onDblClick={onDblClick} onBlur={onBlur} ref={inputRef} disabled={disabled}/>
			</span>
		</div>
	);
});

const RangeInputWithValue = ({defaultValue=0,onChange:onChangeArg,normalizer,...args}) => {
	const [value,setValue]=useState(defaultValue);
	const onChange = useCallback((e)=>{
		setValue(e.currentTarget.value);
		onChangeArg&&onChangeArg(e);
	},[]);
	useEffect(()=>{
		setValue(defaultValue);
	},[defaultValue]);
	return (
		<span>
			<input type="range" {...args} value={value} onChange={onChange}/>
			<span>{normalizer?normalizer(value):value}</span>
		</span>
	);
};
const ColorPreview = ({base,mix,mixAlpha}) => {
	const baseRGBA = useMemo(()=>Color(base).rgb().toString(),[base]);
	const mixRGBA = useMemo(()=>Color([...mix,mixAlpha]).rgb().toString(),[mix,mixAlpha]);
	return (
		<div className="color-preview">
			<div style={{backgroundColor:baseRGBA}}/>
			<div style={{backgroundColor:mixRGBA}}/>
		</div>
	);
};

function clamp255(n){
	if(isNaN(n))return 0;
	n=Math.round(n);
	if(n<0)return 0;
	if(n>255)return 255;
	return n;
}
function clampRatio(n){
	if(isNaN(n))return 0;
	if(n<0)return 0;
	if(n>1)return 1;
	return n;
}

function filterValidAlpha(arr){
	const strictValid=arr.filter(c=>!isNaN(c)&&0<=c&&c<=1);
	if(strictValid.length!==0)return strictValid;
	const probablyValid=arr.filter(c=>!isNaN(c)&&c!==0&&c!==1);
	if(probablyValid.length!==0)return probablyValid;
	const maybeValid=arr.filter(c=>!isNaN(c));
	if(probablyValid.length!==0)return probablyValid;
	return arr;
}

const guessColor = (colors, type) => {
	try{
	const {base,mix,mixAlpha,mixed}=colors;
	if(type===guessTargetID_baseColor){
		colors.base=mix.map((mixChunk,i)=>{
			const mixedChunk=mixed[i];
			return (mixedChunk-mixChunk*mixAlpha)/(1-mixAlpha);
		}).map(clamp255);
	}else if(type===guessTargetID_mixColor){
		colors.mix=base.map((baseChunk,i)=>{
			const mixedChunk=mixed[i];
			return baseChunk+(mixedChunk-baseChunk)/mixAlpha;
		}).map(clamp255);
	}else if(type===guessTargetID_mixAlpha){
		const resultArray=filterValidAlpha(base.slice(0,3).map((baseChunk,i)=>{
			const mixChunk=mix[i];
			const mixedChunk=mixed[i];
			return (mixedChunk-baseChunk)/(mixChunk-baseChunk);
		})).map(clampRatio);
		if(resultArray.length!==0){
			colors.mixAlpha=resultArray.reduce((a,c)=>a+c,0)/resultArray.length;
		}
	}else if(type===guessTargetID_mixedColor){
		colors.mixed=base.map((baseChunk,i)=>{
			const mixChunk=mix[i];
			return baseChunk+(mixChunk-baseChunk)*mixAlpha;
		}).map(clamp255);
	}
	}catch(e){console.log(e);}
	return colors;
}

const DarkmodeSwitcher = () => {
	const [isDarkmode,setDarkmode]=useState(()=>document.documentElement.classList.contains("darkmode"));
	const toggleDarkmode = useCallback(() => {
		setDarkmode(isDarkmode=>{
			document.documentElement.classList.add("darkmode-switcher_switch");
			document.documentElement.classList[isDarkmode?"remove":"add"]("darkmode");
			return !isDarkmode;
		});
	},[]);
	return (
		<span onClick={toggleDarkmode} class="darkmode-switcher">{isDarkmode?"🌙":"☀"}</span>
	);
};

const guessTargetID_baseColor=1;
const guessTargetID_mixColor=2;
const guessTargetID_mixAlpha=3;
const guessTargetID_mixedColor=4;

const rangeNormalizer=(val)=>`${(val-0).toFixed(2)}(${Math.round(val*255)})`;
const AppView = () => {
	const {checkedId:guessTarget} = useSelectableGroup();
	const guessTargetRef = useRef(guessTarget);
	useEffect(()=>{
		guessTargetRef.current=guessTarget;
		setColors(colors=>guessColor({...colors},guessTarget));
	},[guessTarget]);
	const [colors,setColors]=useState({
		base:[0,153,0],
		mix:[0,10,255],
		mixAlpha:0.5,
		mixed:[0,82,128],
	});
	const onChangeBaseColor = useCallback((color)=>{
		setColors(colors=>guessColor({...colors,base:color.array()},guessTargetRef.current));
	},[]);
	const onChangeMixAlpha = useCallback((e)=>{
		const mixAlpha=e.currentTarget.value-0;
		setColors(colors=>guessColor({...colors,mixAlpha},guessTargetRef.current));
	},[]);
	const onChangeMixColor = useCallback((color)=>{
		setColors(colors=>{
			const mix = color.array();
			const newColors= {...colors, mix};
			if(mix[3]&&mix[3]!==1)colors.mixAlpha=mix[3];
			return guessColor(newColors,guessTargetRef.current)
		});
	},[]);
	const onChangeMixedColor = useCallback((color)=>{
		setColors(colors=>guessColor({...colors,mixed:color.array()},guessTargetRef.current));
	},[]);
	return (
		<article id="guess-mixed-color-view">
			<h1><DarkmodeSwitcher/>重ねた色から元の色を計算するやつ</h1>
			<p>ラジオボタンで補完対象を選択し、残り3つの値を入力すれば、選択した対象を補完してくれます</p>
			<p>注: 計算誤差により、補完される値と元の値は必ずしも一致しません</p>
			<div>
				<SelectableFieldset id={guessTargetID_baseColor} title="基本色"><ColorIO defaultColor={colors.base} onChange={onChangeBaseColor}/></SelectableFieldset>
			</div>
			<div>
				<SelectableFieldset id={guessTargetID_mixColor} title="合成色"><ColorIO defaultColor={colors.mix} onChange={onChangeMixColor}/></SelectableFieldset>
				<SelectableFieldset id={guessTargetID_mixAlpha} title="合成色(透明度)"><RangeInputWithValue normalizer={rangeNormalizer} onChange={onChangeMixAlpha} min="0" max="1" defaultValue={colors.mixAlpha} step="0.01"/></SelectableFieldset>
			</div>
			<div>
				<SelectableFieldset id={guessTargetID_mixedColor} title="結果色" checked><ColorIO defaultColor={colors.mixed} onChange={onChangeMixedColor}/></SelectableFieldset>
			</div>
			<div><ColorPreview base={colors.base} mix={colors.mix} mixAlpha={colors.mixAlpha}/></div>
			<div><small><a href="https://twitter.com/mochiya98">@mochiya98</a></small></div>
		</article>
	);
};

const App = () => {
	return(
		<SelectableGroupProvider>
			<AppView/>
		</SelectableGroupProvider>
	);
}

render(<App />, document.getElementById("app"));

document.body.appendChild(document.createElement("style")).textContent=`

`;