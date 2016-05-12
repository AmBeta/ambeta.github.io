/* 
 * Shortcut list: 
$X = IX.get;
$XA = IX.cvtToArray;
$XD = IX.Dom;
$XE = IX.err;
$XF = IX.getPropertyAsFunction;
$XH = IX.HtmlDocument;
$XP = IX.getProperty;
 *
*/

/**
 *  IX is a basic library which provider following functions: {
 *  	isEmpty(param) : return if param is undefined, null or empty string.
 *  	isObject(parma) : return if param is an instance of object.
 *  	isString(param) : return if param is an instance of string. Empty string will not be taken as String.
 *  	isFn(param): return if param is an instance of string.
 *  	isBoolean(param): return if param is an Boolean.
 *  	isArray(param) : return if param is an instance of Array.
 *		getClass(param) : return param's type with toLowerCase
 *  
 *  	hasProperty(object, propertyName)
 *  	setProperty(object, propertyName, defaultValue)
 *  	getProperty(object, propertyName, defaultValue): 
 *  			if object has a property named as propertyName, return its value no matter if it is null or empty;
 *  			otherwise return the defaultValue; 
 *  	getPropertyAsFunction
 *		clone(object): create a duplicate object and return it. 
 *				The new object is totally different with object although the value is same.
 *
 *		ns(namespaceName): check if namespaceName is existed in current page window. 
 *				If not, create it to keep. 
 *		nsExisted(namespaceName) : return if namespaceName is existed in current page wilndow.
 *		getNS(namespaceName): check if namespaceName is existed in current page window,
 *				If yes, return the object identified by namespaceName. Otherwise, return false.
 *
 *		iterate(arrayObject, fn): iterate to call fn for every elements in arrayObject by sequence.
 *				fn is a function to accept such object and index of object in arrayObject. 
 *				it can be defined as function(item, indexOfItemInArray)
 *		fnIterate(arrayObject, fnName): similar with iterate function, but no need to provide function.

 *				fnName should be a string to identified a function for each element in array.
 *		loop(arrayObject, accumulator, iterateFunction): iterate to do accumulation for every elements in arrayObject by sequence.
 *				iterateFunction can be defined as function(oldAccumulator, item, indexOfItemInArray), its task is
 *					deal with the item and the oldAccumulator and return the newAccumulator to help loop function to 
 *					get the result of accumulation.
 * 		partLoop(arrayObject, startIndex, endIndex, accumulator, iterateFunction):  basically, it is same as loop function.
 * 				But it will not deal with all elements by the elements from startIndex to endIndex(not include endIndex).
 * 					If the startIndex or endIndex is over-ranged, it just uses the proper index. 
 *      loopDsc(arrayObject, accumulator, iterateFunction): basically, it is same as loop function. 
 *      		But it will deal with element from the last one to the first one.
 *      each(object, accumulator, iterateFunction) : it will deal with all properties for object and return the accumulated result.
 *      		 iterateFunction can be defined as function(oldAccumulator, propertyValue, propertyName, indexOfPropertyInObject), 
 *      			its task is	deal with the property and the oldAccumulator and return the newAccumulator to help each function to 
 *					get the result of accumulation.
 *		
 *		extend(dst, src): copy all properties from src to dst no matter if the property has existed in dst. 
 *				After copying, return new dst. src will not be changed but dst should be changed.
 *		inherit(src, ...): create a new object, copy all properties from each src by sequence.
 *				After copying, return new object. Each src will not be changed.
 *
 *		isMSIE: the value to indicate if current browser is MicroSoft IE.
 *		isMSIE7: the value to indicate if current browser is MicroSoft IE 7.0.
 *		isSafari: the value to indicate if current browser is Safari.
 *		getUrlParam(key, defaultValue) : try to return the value of parameter identified by key in current URL. 
 *				If current URL has not included the key, return the default value.
 *		listen(type, target, eventName,  handerFunction): try to attach/detach an event handler on specified target.
 *				type: "attach" or "detach"
 *				target: should be a DOM object.
 *				eventName:  for example "click", "mousemove",...
 *				handlerFunction : an event handler.
 *
 *		toAnchor(anchorName): let current focus jump to specified anchor named as anchorName.
 *
 *		emptyFn: just a function shell but do nothing.
 *		execute(functionName, arguments): find the object which namespace is functionName. 
 *				If it is function, call it using the given arguments which is array.
 *		tryFn(functionObject): try to execute the given functionObject. If the given object is not function, do nothing.
 *
 *		get(domEl): try to get a DOM element by domEl which can be element or id of element.	
 *  }
 */
window.IX = (function(){
	var currentVersion="1.0";
	
	var isEmptyFn = function(str){
		return (str===undefined||str===null||str==="");		
	};
	var BaseTypes = {
		"object": Object,
		"function": Function,
		"string":String,
		"boolean":Boolean,
		"number": Number
	};
	var isTypeFn = function(type){
		var fn =function(obj){
			return (!isEmptyFn(obj) && (typeof(obj)==type || obj instanceof BaseTypes[type]));
		};
		return fn; 
	};

	var typeUtils = {
		isEmpty : isEmptyFn,
		isBoolean : isTypeFn("boolean"),
		isObject : isTypeFn("object"),
		isString : isTypeFn("string"),
		isNumber : isTypeFn("number"),
		isFn : isTypeFn("function"),
		isArray : function(ob) {return (!!ob && ob instanceof Array);},
		isElement: function(el){return el.nodeType===1;},
		getClass : function (ob) { return Object.prototype.toString.call(ob).match(/^\[object\s(.*)\]$/)[1].toLowerCase();}
	};
	
	var loopFn = function(varr,sIdx,eIdx, acc0, fun, isAscLoop) {
		if (varr==null ||varr.length==0){
			return acc0;
		}
		var len=varr.length;
		eIdx = (eIdx==-1)?len: eIdx;
		if (sIdx>=eIdx){
			return acc0;
		}
		var acc = acc0, min = Math.max(0, sIdx), max = Math.min(len, eIdx);
		var xlen = len -1;
		for (var i=0; i<=xlen; i+=1) {
			var idx = isAscLoop?i:(xlen-i);
			//try{
			if (idx>=min && idx <max && (idx in varr)){
				acc = fun(acc, varr[idx], idx);
			}
			//}catch(e){
				//alert(e);
			//}
		}
		return acc;
	};
	var iterateFn = function(arr, fun){
		if (isEmptyFn(arr))
			return;
		var len = arr.length;
		for (var i=0; i<len; i+=1)			
			fun(arr[i], i);
	};
	var loopUtils = {
		iterate: iterateFn,
		fnIterate :function(arr, fname){
			iterateFn(arr, function(item){
				if ((fname in item) && typeUtils.isFn(item[fname]))
					item[fname]();
			});
		},
		loop:function(varr, acc0, fun) {
			return loopFn(varr, 0, -1, acc0, fun, true);
		},
		loopbreak: function(varr, fun) {
			try{
				loopFn(varr, 0, -1, 0, fun, true);
			}catch(_ex){
				//log(_ex);
			}
		},
		partLoop:function(varr,sIdx,eIdx, acc0, fun) {
			return loopFn(varr,sIdx,eIdx, acc0, fun, true);
		},
		loopDsc:function(varr, acc0, fun) {
			return loopFn(varr,0, -1, acc0, fun, false);
		},
		map : function(arr, fun){
			return loopFn(arr, 0, -1, [], function(acc, item, idx){
				acc.push(fun(item,idx));
				return acc;
			}, true);
		},
		each:function(obj, acc0, fun){
			var acc = acc0, p="", idx = 0;
			for (p in obj){
				acc = fun(acc, obj[p], p, idx);
				idx+=1;
			}
			return acc;
		}
	};

	var arrUtils = {
		cvtToArray : function (iterable) {
			if (!iterable)
				return [];
			if (iterable.toArray)
				return iterable.toArray();
	
			var results = [];
			var len = iterable.length;
			for (var i = 0; i < len; i++)
				results.push(iterable[i]);
		    return results;
		}
	};
	
	/**
	 * Creates a deep copy of an object.
	 * Attention: there is no support for recursive references.
	 * @param {Object} object The object to be cloned.
	 * @returns {Object} The object clone.
	 * @example
	 * var obj =  {
	 *         name : 'John',
	 *         cars : {
	 *                 Mercedes : { color : 'blue' },
	 *                 Porsche : { color : 'red' }
	 *         }
	 * };
	 * var clone = IX.clone( obj );
	 * clone.name = 'Paul';
	 * clone.cars.Porsche.color = 'silver';
	 * alert( obj.name );	// John
	 * alert( clone.name );	// Paul
	 * alert( obj.cars.Porsche.color );	// red
	 * alert( clone.cars.Porsche.color );	// silver
	 */
	var cloneFn =function(obj) {
		var clone;

		// Array.
		if (typeUtils.isArray(obj)) {
			clone = [];
			for (var i = 0; i < obj.length; i++)
				clone[i] = cloneFn(obj[i]);
			return clone;
		}

		// "Static" types.
		if (obj === null || (typeof(obj) != 'object') || (obj instanceof String) || (obj instanceof Number)
				|| (obj instanceof Boolean) || (obj instanceof Date) || (obj instanceof RegExp)) {
			return obj;
		}

		// Objects.
		clone = new obj.constructor();
		for (var propertyName in obj) {
			var property = obj[propertyName];
			clone[propertyName] = cloneFn(property);
		}
		return clone;
	};

	/*
		deepCompare
	*/
    var deepCompare = function (y, x) {
        if (x == null || y == null || x == undefined || y == undefined) return x == y;
        for (p in y) {
            if (!(p in x) || typeof (x[p]) == 'undefined')
                return false;
            if (y[p]) {
                if (typeof (x[p]) != typeof (y[p])) return false;
                switch (typeof (y[p])) {
                    case 'object':
                        if (!deepCompare(y[p], x[p]))
                            return false;
                        break;
                    case 'function':
                        if (typeof (x[p]) == 'undefined' || y[p].toString() != x[p].toString())
                            return false;
                        break;
                    default:
                        if (y[p] != x[p])
                            return false;
                }
            }
            else if (x[p])
                return false;
        }
        for (p in x) {
            if (!(p in y) || typeof (y[p]) == 'undefined')
                return false;
        }
        return true;
    };
	var propertyUtils = {
		hasProperty : function(obj, pName){
			if (!obj)
				return false;
			try{
				if(pName in obj) return true;
			}catch(ex){}
			var names = pName.split(".");
			var pObj = obj;
			var len = names.length;
			for (var i=0; i<len; i++) {
				try{
					if (pObj && (names[i] in pObj)) 
						pObj = pObj[names[i]];
					 else 
						return false;
				}catch(_ex){
					return false;
				}
			}
			return true;
		},
		getProperty : function(obj, pName, defV) {
			var v = (defV!=undefined) ? defV : null;
			if (obj==null)
				return v;
			try{
				if(pName in obj) return obj[pName];
			}catch(ex){}
			var names = pName.split(".");
			var pObj = obj;
			var len = names.length;
			for (var i=0; i<len; i++) {
				try{
					if (pObj && (names[i] in pObj)) {
						pObj = pObj[names[i]];
					} else {
						return v;
					}
				}catch(_ex){
					return v;
				}
			}
			return pObj;
		},
		setProperty : function(obj, pName, v){
			try{
				if(pName in obj) {
					obj[pName] = v;
					return;
				}
			}catch(ex){}
			var names = pName.split(".");
			var pObj = obj, _name = names.pop();
			var len = names.length;
			for (var i=0; i<len; i++) {
				var _sname = names[i];
				try{
					if (!(_sname in pObj) || !pObj[_sname] || typeof pObj[_sname] !="object" )
						pObj[_sname] = {};
				} catch(e){
					pObj[_sname] = {};
				}
				pObj = pObj[_sname];
			}
			pObj[_name] = v;
		},
		getPropertyAsFunction:function(obj, fName){
			var fn = IX.getProperty(obj, fName);
			return IX.isFn(fn)?fn : IX.emptyFn;
		},
		clone :cloneFn,
		deepCompare: deepCompare
	};

	var nsLoopFn = function(nsname, fn){
		var names = nsname.split(".");
		if (names[0]=="window")
			names.shift();
		var nsObj = window, flag = true, i=0, len = names.length; 
		while(i<len && flag){
			var curname = names[i];
			flag = fn(curname, nsObj);
			if(flag)
				nsObj = nsObj[curname];
			i++;
		}
		return flag;
	};
	var namespaceUtils = {
		ns : function(nsname){
			nsLoopFn(nsname, function(name, obj){
				if (!(name in obj))
					obj[name] = {};
				return true;
			});
		},
		nsExisted : function(nsname){
			return nsLoopFn(nsname, function(name, obj){
				return obj && (name in obj);
			});
		},
		setNS : function(nsname, obj){
			var names = nsname.split(".");
			if (names[0]=="window")
				names.shift();
			if (names.length==0 || IX.isEmpty(names[0]))
				return;
			var nsObj = window, len = names.length;
			for (var i=0; i<len-1; i++){
				var curname = names[i];
				if (!(curname in nsObj))
					nsObj[curname] = {};
				nsObj = nsObj[curname];
			}
			nsObj[names[len-1]] = obj;
		},
		getNS :function(objName) {
			return nsLoopFn(objName, function(name, obj){
				return (name in obj)?obj[name]:false;
			});
		}
	};

	var extendFn = function(dst, src) {
		if (dst==null || dst==undefined)
			dst = {};
		for (var _p in src)
			dst[_p] = src[_p];
		return dst;
	};
	var extendUtils = {
		// obj = IX.extend(dst, src);
		// obj will has all members in both dst and src, 
		// in same time, dst will has all members in src. 
		extend: extendFn,
		// obj = IX.inherit(src1, src2, src3,...);
		// obj will has all members in all src*, 
		// and all src* will not be changed. 
		inherit : function(){
			return loopUtils.loop(arrUtils.cvtToArray(arguments), {}, function(acc, item){
				return extendFn(acc, item);
			});
		},

		/**
		 * [extendArr(dstArr, src) extend each object in dstArr with src.]
		 * @param  {Array} dstArr  [an array of objects to extend to]
		 * @param  {Object} src    [an object to extend from]
		 * @return {Array}         [an array of objects extended]
		 */
		extendArr : function(dstArr, src) {
			return loopUtils.map(dstArr, function(item, idx) {
				if (!typeUtils.isObject(item)) return item;
				return extendFn(item, src);
			});
		}
	};

	var getTimeInMS = function() {return (new Date()).getTime();};
	var ua = navigator.userAgent.toLowerCase();
	var checkUA = function(keywords){
		return ua.indexOf(keywords)!=-1;
	};
	var hasEventListener = ("addEventListener" in window) ;
	var _handlerWrapper = function(handler) {
		var fn = function(evt){
			var e = evt || window.event;
			if (!("target" in e))
				e.target = e.srcElement; // for IE hack
			return handler(e);
		};
		return fn;
	};
	var _bindHandlers = function(el, handlers, isBind, isOnce){
		if(!el) return;
				
		isBind&&(el._EVENTNAMES||(el._EVENTNAMES={}));
		IX.iterate(["click", "dblclick", "focus", "blur", "keyup", "keydown", "mouseover", "mouseout", "resize", "scroll" ,"mousedown", "mousemove", "mouseup","touchstart", "touchend", "touchmove"], function(eventName){
			if (eventName in handlers){								
				if(isBind){
					if(isOnce&&el._EVENTNAMES[eventName])
						return;			
					el._EVENTNAMES[eventName] = true;
				}

				IX[isBind?"attachEvent":"detachEvent"](el, eventName, _handlerWrapper(handlers[eventName]));
			}			
		});
	};
	var browserUtils = {
		isMSIE7:(document.all && checkUA("msie 7.0")),
		isSafari:(window.openDatabase && checkUA("safari")),
		
		isMSIE: checkUA("msie") && !checkUA("opera"),    //匹配IE浏览器

		isOpera : checkUA("opera"),   //匹配Opera浏览器
		isChrome: checkUA("chrome"),   //匹配Chrome浏览器
		isFirefox: checkUA("firefox") && !checkUA("webkit"),   //匹配Firefox浏览器
		// isYunfisClient: checkUA("Yunfis") || !checkUA("yunfis"),   //匹配yunfis客户端
		
		isMSWin : checkUA("windows"),
		
		getTimeInMS : getTimeInMS,
		
		getComputedStyle : (document.defaultView && "getComputedStyle" in document.defaultView) ? function(el){
			return document.defaultView.getComputedStyle(el);  
		}:function(el){		
			return el.currentStyle || el.style; 
		},
		
		getUrlParam :function (key, defV){
			var paramList = window.location.search.substring(1).split("&");
			var len = paramList.length;
			for(var i=0; i<len; i+=1){
				var _p = paramList[i]; 
				if(_p.indexOf(key+"=")==0)
					return _p.substring(key.length+1);
			}
			return defV;
		},
		/** low performance. should not use it */
		listen : function(type, target, eName, fn){
			var _p = hasEventListener ?  {
				fname : type=="detach"?"removeEventListener":"addEventListener",
				etype  :eName
			} :{
				fname : type+ "Event",
				etype : "on" + eName
			};
			target[_p.fname](_p.etype, fn, false);
		},
		attachEvent : hasEventListener?function(target, eName, fn){
				target.addEventListener(eName, fn, false);
			}:function(target, eName, fn){
				target.attachEvent("on" + eName, fn);
			},
		detachEvent : hasEventListener?function(target, eName, fn){
				target.removeEventListener(eName, fn, false);
			}:function(target, eName, fn){
				target.detachEvent("on" + eName, fn);
			},
		bind : function(el, handlers) {_bindHandlers(el, handlers, true);},		
		//unbind : function(el, handlers) {_bindHandlers(el, handlers, false);}, //TODO: invalid	
		//Attach a handler to an event for the element. The handler is executed at most once per element.
		bindOnce: function(el, handlers){			
			_bindHandlers(el, handlers, true,true);
		},
		on : function(target, eName, fn) {
			target["on" + eName] = fn;
		}
	};
	
	var locationUtils = {				
		toAnchor : function(name){
			window.location.hash = "#" + name;
		}		
	};
	
	var emptyFn=function(){/**Empty Fn*/};
	var selfFn = function(o){return o;};
	/**
	 *  _config :{
	 *     maxAge : timeInMSec, default no limit;
	 *     expire:
	 *  } 
	 */
	var checkReadyFn = function(condFn, execFn, period, _config){		
		var _period = Math.max(20, period || 100);
		var maxAge = $XP(_config, "maxAge", null), expireFn = $XF(_config, "expire"), startTick = null;
		if (isNaN(maxAge))
			maxAge = null;		
		function _checkFn(){			
			if (condFn())
				execFn();
			else if (maxAge!=null && (getTimeInMS()-startTick)>maxAge)
				expireFn();
			else
				setTimeout(_checkFn, _period);
		}
		if (maxAge!=null)
			startTick = getTimeInMS();
		_checkFn();
	};
	var executeUtils = {
		emptyFn : emptyFn,
		selfFn: selfFn,
		safeExec : function(fn){
			//try {
				fn();
			//}catch(e){
			//	alert(IX.Test.listProp(e));
			//}
		},
		execute : function(fname, args) {
			var fn = namespaceUtils.getNS(fname);
			if (typeUtils.isFn(fn)){
				fn.apply(null, args);
			}
		},
		checkReady : checkReadyFn, 
		tryFn : function(fn){
			return (typeUtils.isFn(fn))? fn() : emptyFn();
		}
	};
	
	var domUtils = {
		decodeTXT : function(txt){
			return (txt+"").replaceAll("&nbsp;", ' ').replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
		},
		encodeTXT : function(txt){
			return (txt+"").replaceAll('&', '&amp;').replaceAll("<","&lt;").replaceAll(">", "&gt;").replaceAll(" ", "&nbsp;");
		},
		createDiv : function(id,clz){
//			log ("createDiv :" + id + " " + clz);
			var node = document.createElement('div');
			if (!IX.isEmpty(clz))
				node.className = clz;
			node.id = id;
			document.body.appendChild(node);
			return node;
		},
		get : function(domEl){
			if (IX.isEmpty(domEl))
				return null;
			if (typeUtils.isString(domEl) || typeUtils.isNumber(domEl) )
				return document.getElementById(domEl);
			if ("ownerDocument" in domEl)
				return domEl;
			return null;	
		}
	};
	var errUtils = {
		err : function(errMsg) {
			alert(errMsg);
		}
	};
	var mathUtils = {
		inRange : function(x, x1, x2){return (x-x1)*(x-x2)<=0;}	
	};
	
	var _idx = 0;
	var idUtils = {
		id : function(){
			_idx ++;
			return "ix"+_idx;
		}	
	};

	var ifRectIntersect = function (_rect1, _rect2) {
        return Math.abs(_rect1.maxx + _rect1.minx - _rect2.minx - _rect2.maxx) <= _rect2.maxx - _rect2.minx + _rect1.maxx - _rect1.minx
            && Math.abs(_rect1.maxy + _rect1.miny - _rect2.miny - _rect2.maxy) <= _rect2.maxy - _rect2.miny + _rect1.maxy - _rect1.miny;
    };
	
	return extendUtils.inherit(typeUtils, arrUtils, propertyUtils, namespaceUtils, loopUtils, 
			extendUtils, browserUtils, locationUtils, executeUtils,domUtils,errUtils, mathUtils, idUtils, {
		version: currentVersion,
		ifRectIntersect: ifRectIntersect
	});
})();
$X = IX.get;
/**
 * $XA is an shortcut to IX.cvtToArray.	
 * @param {} iterable : an object which can be iterated.
 * @return : Array object
 */
$XA = IX.cvtToArray;
$XE = IX.err;
/**
 * $XP is an shortcut for IX.getProperty. For example:
 * 		var myId = $XP(config, "id", 123)
 * 		it means assign config.id to myId, if config has no property named as "id", assign 123 to myId. 
 *  
 */
$XP = IX.getProperty;
/**
 * $XF is an shortcut for IX.getPropertyAsFunction. For example:
 * 		var closeFn = $XF(config, "close")
 * 		it means assign config.close to closeFn, if config has no property named as "close", assign IX.emptyFn to closeFn. 
 *  
 */
$XF = IX.getPropertyAsFunction;

IX.Test =(function(){
	var detectAttrsFn = function(obj, checkFn, injectorFn) { // injectorFn: function(result, name, value)
		var count = 0;
		return  IX.each(obj, "", function(acc, item, nc){
			try{
				if (checkFn(item,nc)){
					count += 1;
					return injectorFn(acc,  nc, item) + (count%5==4?"\r\n":"");
				}
			}catch(e){alert(e);}
			return acc;
		});
	};
	var listFn = function(obj, matchorFn, type){
		if (type!="fun" && IX.isString(obj)){
			return "String:" + obj.toString();
		}
		var isListFn = type=="fun"; 
		return (isListFn?"Funcs:":"Props:") + detectAttrsFn(obj, function(o){
				return (((!isListFn && !IX.isFn(o)) || (isListFn && IX.isFn(o))));
			}, function(r, n, v) {
				return [r, n, isListFn?"": [':"', (""+v).trunc(60), '" '].join(""), ", "].join("");
			}
		);
	};
	return {
		listProp:function(obj, matchor) {
			return listFn(obj, matchor, "");
		},
		listFun:function(obj, matchor) {
			return listFn(obj, matchor, "fun");
		}
	};
})();

window.log = ("IXDEBUG" in window)? function(s){
	if (console)
		console.log(s);
} : IX.emptyFn;

// Debug 当IXDEBUG为true时，可以进入Debug模式
IX.Debug = (function () {
	return {
		info : function (s) {
			if ("IXDEBUG" in window && window.IXDEBUG === true && console) {
				console.log(s);
			}
		}
	};
})();

//////////////////////////////////////////////////// TEST-Utils finished////////

/**
 *  IX.Array is a supplement for Array.prototype. It includes: {
 *  	init(length, defaultValue): create a new Array that each element is set to defaultValue.
 *  	isFound(element, arrayObject, equalFn): return if element is in current arrayObject by equalFn.
 *  			For equalFn, should be defined as function(a,b) and return boolean value; 
 *  			if the caller don't provide the function and a has equal operator, use a.equal to compare.
 *  			otherwise, using default operator "==".
 *  	toSet(arrayObject, equalFn): return unduplicated array of arrayObject by equalFn.
 *  	isSame(arrayObject1, arrayObject2, equalFn): return if arrayObject1 is same set as arrayObject2 no matter thr order of array elements.
 *  	compact(arrayObject, validFn):return an array object which remove all not valid elements from arrayObject by validFn. 	 
 *  	remove(arrayObject, element, equalFn): return new array object which removed matched elements from arrayObject.
 *  	pushx(arrayObject, item): return arrayObject which add item as last element.
 *  	indexOf(arrayObject, matchFn): return the index of first matched element. If no matched, return -1;
 *  	splice(arrayObject, startIndex, deleteCount, insertArrayObject): 
 *  			delete "deleteCount" elements from startIndex in arrayObject and insert insertArrayObject into startIndex of arrayObject
 *  			after all, return the new array object.   
 *  }
 * 
 */
IX.Array = (function(){
	var getEqualFn = function(equalFn){
		return IX.isFn(equalFn)?equalFn:function(a, b) {
			return (IX.isObject(a) &&("equal" in a) &&  IX.isFn(a.equal))?a.equal(b):(a==b);
		};
	};
	
	var isFoundFn = function(elem, arr, equalFn){
		if (arr==null ||arr.length==0)
			return false;
		for (var i=arr.length-1; i>=0; i--) {
			if (equalFn(elem, arr[i]))
				return true;
		}
		return false;
	};
	/** merge arr1 and and arr2 into new arr:
	 * 	arr1: [1,3,5,7,9, 19,21,22], arr2: [2,3,4, 18,19,20]
	 * merge[arr1,arr2] = [2,1,  3,  4,18, 5,7,9,  19, 21,22, 20] 
	 *  3 and 19 are key points:  
	 */ 
	var _merge = function(arr1, arr2, equalFn){
		var _arr1 = arr1 ||[], _arr2 = arr2 ||[];
		var i=0, j=0, k=0, arr = [];
		var len1= _arr1.length, len2 = _arr2.length;
		for(i=0; i<len2; i++){
			for (j=0; j<len1; j++){
				if (equalFn(_arr2[i], _arr1[j])) {
					for (k=0; k<i; k++)
						arr.push(_arr2.shift());
					_arr2.shift();
					for (k=0; k<=j; k++)
						arr.push(_arr1.shift());
					return arr.concat(_merge(_arr1, _arr2, equalFn));
				}
			}
		}
		return arr.concat(_arr1, _arr2);
	};
	
	var _self = null;
	_self = {
		init : function(len, defV){
			var arr = [];
			for (var i=0; i<len; i++)
				arr[i] = IX.clone(defV);
			return arr;
		},
		isFound : function(elem, arr, equalFn){
			return isFoundFn(elem, arr, getEqualFn(equalFn));
		},
		toSet : function(arr, equalFn) {
			var fn = getEqualFn(equalFn);
			return IX.loop(arr, [], function(acc, item){
				if (!_self.isFound(item, acc, fn))
					acc.push(item);
				return acc;
			});
		},
		sort : function(arr, cmpFn){
			var arr1 = IX.map(arr, function(item){return item;});
			return arr1.sort(cmpFn);
		},
		isSameSet:function(_arr1, _arr2, equalFn){
			var arr1 = _self.toSet(_arr1), arr2 = _self.toSet(_arr2);
			if (arr1==null && arr2==null)
				return true;
			if (arr1==null || arr2==null || arr1.length!=arr2.length)
				return false;
			if (arr1.length==0 && arr2.length==0)
				return true;
			
			var fn = getEqualFn(equalFn);
			for (var i=arr1.length-1; i>=0; i--){
				if (!isFoundFn(arr1[i], arr2, fn))
					return false;
			}
			return true;
		},
		compact: function(arr, validFn) {
			var fn = IX.isFn(validFn)?validFn:function(item){return item;};
			return IX.loop(arr, [], function(acc, item) {
				if (fn(item))
					acc.push(item);
				return acc;
			});
		},
		remove:function(arr, elem, equalFn){
			var fn = getEqualFn(equalFn);
			return IX.loop(arr, [], function(acc, item){
				if (!fn(elem, item))
					acc.push(item);
				return acc;
			});
		},
		pushx:function(arr, item){
			arr.push(item);
			return arr;
		},
		
		flat : function(arr) {
			return IX.isArray(arr)?IX.loop(arr, [], function(acc, item){
				return acc.concat(_self.flat(item));
			}) : [arr];
		},
		indexOf :function(arr, matchFn) {
			if(!arr || arr.length==0)
				return -1;
			var len = arr.length;
			for (var i=0; i<len; i++) {
				if (matchFn(arr[i]))
					return i;
			}
			return -1;
		},

		// exmaples:
		// arr= ["a", "b", "c", "d"]
		// (arr, 4) : return []
		// (arr, 3):  remove 1 elem: arr[3]; return ["a", "b", "c"];
		// (arr, 3, 4) : return []
		// (arr, 1, 2) : remove 2 elems: arr[1], arr[2]; return ["a", "d"];
		// (arr, 1, 2, ["g", "k", "l"]) : remove 2 elems: arr[1], arr[2] and add 3 elems; 
		//              return ["a", "g", "k", "l", "d"];
		// (arr, 1, 0, ["g", "k", "l"]) : remove 0 elems and add 3 elems; 
		//              return ["a", "g", "k", "l", "b", "c", "d"];
		splice:function(arr, start, deleteCount, insertArray) {
			var count = isNaN(deleteCount)?1:deleteCount;
			var len = arr.length;
			if (start<0 || start>len || count<0 || (start+count)>len){
				return [];
			}
			var iArr = insertArray?insertArray:[];
			return [].concat(arr.slice(0, start), iArr, arr.slice(start+count));
		},
		
		/** merge arr1 and and arr2 into new arr:
		 * 	arr1: [1,3,5,7,9, 19,21,22], arr2: [2,3,4, 18,19,20]
		 * merge[arr1,arr2] = [2,  1,3,  4,18, 5,7,9,19, 21,22, 20] 
		 *  3 and 19 are key points:  
		 */ 
		merge : function(arr1, arr2, equalFn){
			return _merge(arr1, arr2, getEqualFn(equalFn));
		}
	};
	return _self;
})();

IX.IState = (function(){
	return {
		toggle :function(origStat, newStat){
			return (newStat==undefined)?!origStat : newStat;
		}
	};
})();

IX.IManager = function(){
	var _ht = {};
	return {
		isRegistered : function(name){
			return (name in _ht) && (_ht[name]);
		},
		register: function(name, obj) {
			_ht[name] = obj;
		},
		unregister : function(name){
			_ht[name] = null;
		},
		get: function(name){
			return (name in _ht)?_ht[name]: null;
		},
		clear : function() {
			_ht = {};
		},
		destroy : function() {
			delete _ht;
		}
	};
};

IX.IList = function(){
	var _keyList = [];
	var IXArray =  IX.Array;
	var indexOfFn = function(key) {
		return key ? IXArray.indexOf(_keyList, function(item) {
			return item == key;
		}) : -1;
	};
	var removeFn = function(idx) {
		if (idx >= 0 && idx<_keyList.length)
			_keyList = _keyList.slice(0, idx).concat(_keyList.slice(idx+1));
	};
	var appendFn = function(key){
		if (!_keyList || _keyList.length == 0)
			_keyList = [key];
		else {
			var idx = indexOfFn(key);
			removeFn(idx);
			_keyList.push(key);
		}
	};
	return {
		isEmpty :function(){return _keyList.length==0;},
		isLast : function(k){return _keyList.length>0 && k==_keyList[_keyList.length-1];},
		getList : function(){return _keyList;},
		getSize: function(){return _keyList.length;},
		indexOf : indexOfFn,
		remove : removeFn,
		tryRemove : function(key){
			removeFn(indexOfFn(key));
		},
		append : appendFn,
		tryAdd :function(key){
			if (!_keyList || _keyList.length == 0)
				_keyList = [key];
			else if (indexOfFn(key) <0)
				_keyList.push(key);
		},
		insertBefore : function(key, dstKey) {
			// find the dstKey, if not exist, append current key to the end of list.
			var dstIdx = indexOfFn(dstKey);
			if (dstIdx == -1) {
				appendFn(key);
				return;
			}
			// find the key, if current key is before dstKey, do nothing.
			var idx = indexOfFn(key);
			if (idx != -1 && dstIdx - idx == 1)
				return;
			// else remove the existed record and insert it before dstKey.
			if (idx >= 0) {
				removeFn(idx);
				dstIdx = indexOfFn(dstKey);
			}
			_keyList = _keyList.slice(0, dstIdx).concat([key], _keyList.slice(idx));
		},
		clear : function(){
			_keyList = [];
		},
		destroy : function(){
			delete _keyList;
		}
	};
};
IX.I1ToNManager = function(eqFn) {
	var _eqFn = IX.isFn(eqFn)?eqFn : function(item, value){return item==value;};
	
	var _mgr = new IX.IManager();
	
	var hasEntryFn = function(key) {
		var list = _mgr.get(key);
		return list && list.length>0;		
	};
	var indexOfFn = function(arr, value) {
		return IX.Array.indexOf(arr, function(item){return _eqFn(item, value);});
	};
	
	return IX.inherit(_mgr, {
		hasValue :hasEntryFn,
		put : function(k, v) {
			if (!hasEntryFn(k)) {
				_mgr.register(k, [v]);
				return;
			}
			var list = _mgr.get(k);
			if (indexOfFn(list, v)==-1)
				_mgr.register(k, list.concat(v));
		},
		remove : function(k, v){
			var list = _mgr.get(k);
			var idx = indexOfFn(list, v);
			if (idx >= 0)
				_mgr.register(k, IX.Array.splice(list, idx));	
		}	
	});
};
IX.IListManager = function() {
	var _super = new IX.IManager();
	var _list = new IX.IList();
	
	var registerFn = function(key, obj) {		
		_super.register(key, obj);
		var idx = _list.indexOf(key);
		if (obj) {
			if (idx == -1)
				_list.append(key);
		} else 
			_list.remove(idx);
	};
	var listFn = function(keys) {
		return IX.map(keys, function(item) {return _super.get(item);});
	};
	return IX.inherit(_super, {
		// register should not change the sequence of key.
		register : registerFn,
		unregister : function(key){registerFn(key);},
		isEmpty :function(){return _list.isEmpty();},
		getSize : function(){return _list.getSize();},
		hasKey : _super.isRegistered,
		isLastKey : function(key){return _list.isLast(key);},
		getKeys : function() {return _list.getList();},
		getByKeys : function(keys){return listFn(keys);},
		getAll : function() {return listFn(_list.getList());},
		iterate: function(fn){IX.iterate(_list.getList(), function(item){fn(_super.get(item));}); },
		getFirst : function() {
			var arr = _list.getList();
			if (!arr || arr.length == 0)
				return null;
			var len = arr.length;
			for (var i = 0; i < len; i++) {
				var inst = _super.get(arr[i]);
				if (inst) 
					return inst;
			}
			return null;
		},
		// only for key. append will remove existed record in keyList and append it to the end
		append : _list.append,
		insertBefore : _list.insertBefore,
		remove : function(key) {registerFn(key);},
		
		clear : function(){
			_super.clear();
			_list.clear();
		},
				
		destroy : function() {
			_super.destroy();
			delete _super;
			_list.destroy();
			delete _list;
		}
	});
};

/**
 * data : {
 * 		type : "array"/"json", [option; default :"json"]
 * 		// for array:
 * 		fields :["name1", "name2", ...],
 * 		items:[ [value1, value2, ...], ...]
 * 		// for json:
 * 		items : [{name1: value1, name2: value2},...]
 *  }
 *  return: [{name1: value1, name2: value2},...]
 */
IX.DataStore = function(data){
	var _items = $XP(data, "items", []);
	if (_items.length>0 && $XP(data, "type", "json")!="json"){
		var _fields = $XP(data, "fields", []);
		_items =  IX.map(_items, function(row){
			return IX.loop(_fields, {}, function(acc, col, idx){
				acc[col] = IX.isArray(row)?row[idx]:row[col];
				return acc;
			});
		});
	}
	
	return IX.map(_items, function(item){
		var id = $XP(item, "id");
		if (IX.isEmpty(id))
			item.id = IX.id();
		return item;
	});
};

IX.Date = (function(){
	var _isUTC = false;
	var fields4Day = ["FullYear", "Month", "Date"], fields4Time = ["Hours", "Minutes", "Seconds"];
	var ds = "-", ts = ":";
	
	var _formatStr = function(str, sp) {
		if (IX.isEmpty(str))
			return "";
		str = str.split(sp, 3);
		return IX.map(sp==ds?[4,2,2]:[2,2,2], function(item, idx){
			var nstr = (str.length>idx?str[idx]:"");
			return ("0".multi(item) + nstr).substr(nstr.length, item);
		}).join(sp);
	}; 
	
	var _format = function(date, fields, sp){
		var getPrefix = "get" + (_isUTC?"UTC":"");
		var str = IX.map(fields, function(item){
			return date[getPrefix + item]()*1 + (item=="Month"?1:0);
		}).join(sp);
		return _formatStr(str, sp);
	};
	
	var format = function(date, type) {
		if (type=="Date")
			return _format(date, fields4Day, ds);
		if (type=="Time")
			return _format(date, fields4Time, ts);
		return _format(date, fields4Day, ds) + " " + _format(date,fields4Time, ts);
	};

	var checkData =function(acc, item, idx){
		return acc || isNaN(item) || item.indexOf(".")>=0 || (idx==0 && item.length!=4) || (idx>0 && item.length>2);
	};
	var checkTime =function(acc, item, idx){
		return acc || isNaN(item) || item.indexOf(".")>=0 || item.length>2;
	};
	var isValid = function(str, type){
		var isDate = type == "Date";
		var sps  = str.split(isDate?ds :ts, 3);
		if (sps.length!=3 || IX.loop(sps, false, isDate?checkData:checkTime))
			return false;
		if (isDate){
			var m = sps[1]*1;
			var d = sps[2]*1;
			return !(m<=0 || m>12 || d<=0 || d>31);
		}
		var h = sps[0]*1;
		var m = sps[1]*1;
		var s = sps[2]*1;
		return  !(h<0||h>23 || m<0||m>59 || s<0|| s>59);
	};
	
	return {
		setDS : function(v){ds = v;},
		setTS : function(v){ts = v;},
		setUTC : function(isUTC){
			_isUTC= isUTC;
		}, 
		getDS : function(){return ds;},
		getTS : function(){return ts;},
		isUTC :function(){
			return _isUTC;
		},
		// return YYYY/MM/DD hh:mm:ss 
		format:format,
		// return YYYY/MM/DD
		formatDate:function(date) {
			return format(date, "Date");
		},
		// return hh:mm:ss
		formatTime:function(date) {
			return format(date, "Time");
		},
		
		// return YYYY/MM/DD hh:mm:ss 
		formatStr:function(str) {
			str = (str + " ").split(" ");
			return _formatStr(str[0], ds) + " " + _formatStr(str[1], ts);
		},
		// return YYYY/MM/DD
		formatDateStr:function(str){
			return _formatStr(str, ds);
		},
		// return hh:mm:ss
		formatTimeStr:function(str){
			return _formatStr(str, ts);
		},
		
		getDateText : function(olderTSInSec, tsInSec) {
			var interval = tsInSec -olderTSInSec ;
			if (interval<10)
				return "刚才";
			if (interval<60)
				return Math.round(interval) + "秒钟前";
			interval /= 60;	
			if (interval<60)
				return Math.round(interval) + "分钟前";
			interval /= 60;
			if (interval<24)
				return Math.round(interval) + "小时前";
			interval /= 24;	
			if (interval<7)
				return Math.round(interval) + "天前";			
			interval /= 7;	
			if (interval<4.33)
				return Math.round(interval) + "周前";
			interval /= 4.33;
			if (interval<12)
				return Math.round(interval) + "个月前";
			return Math.round(interval/12) + "年前";		
		},
		
		// accept YYYY/MM/DD hh:mm:ss return true/false;
		isValid : function(dateStr, type) {
			var dt = dateStr.split(" ");
			if (type=="Date" ||type=="Time")
				return dt.length==1 && isValid(dt[0], type);
			
			return dt.length==2 && isValid(dt[0], "Date") && isValid(dt[1], "Time");
		},
		/*
			para: 
				_date: date string, e.g. 2010-01-01 9:20:30 or 2010/01/01 9:20:30
				_format: format string, e.g. "yyyy-MM-dd HH:mm:ss"
			return 
				string
		*/
		getDateByFormat: function (_dateStr, _formatType) {
            try {
            	if(_dateStr == null || _dateStr === "") return "";
                var _dateObj = typeof _dateStr == "number" ? new Date(_dateStr) : typeof _dateStr == "string" ? new Date((_dateStr+"").replace(/-/g, "/")) : _dateStr, dateFormat = _formatType || "yyyy-MM-dd HH:mm:ss";

                dateFormat = dateFormat.replace("yyyy", _dateObj.getFullYear());
                var _month = _dateObj.getMonth() + 1,
					_day = _dateObj.getDate(),
					_hour = _dateObj.getHours(),
					_minute = _dateObj.getMinutes(),
					_second = _dateObj.getSeconds();
                dateFormat = dateFormat.replace("MM", _month > 9 ? _month : ("0" + _month));
                dateFormat = dateFormat.replace("dd", _day > 9 ? _day : ("0" + _day));
                dateFormat = dateFormat.replace("HH", _hour > 9 ? _hour : ("0" + _hour));
                dateFormat = dateFormat.replace("mm", _minute > 9 ? _minute : ("0" + _minute));
                dateFormat = dateFormat.replace("ss", _second > 9 ? _second : ("0" + _second));

                return dateFormat;
            } catch (ex) {
                return _dateStr;
            }
        },
        getTimeTickInSec : function (_dateStr) {
        	var _str = IX.Date.getDateByFormat(_dateStr, 'yyyy/MM/dd HH:mm:ss');
        	return parseInt((new Date(_str)).getTime() / 1000);
        }
	};
})();
/**
 *	IX.Net is a library for networking. It includes: {
 *		loadFile(url, responseHandler): active AJAX requirement and let responseHandler deal with response(Text).
 *		loadCss(cssUrl): load CSS and  apply to current document.
 *		loadJsFiles(jsFileUrlArray, postHandler): load all js files in array, and execute postHandler after all jsFiles are loaded.
 *		tryFn(fnName, argsArray,  dependency): try to execute function fnName with parameters argsArray.
 *				If the function is not existed, resolve the dependency and try it again.
 *				dependency:{
 *					beforeFn: function before applying dependency.
 *					cssFiles: all required CSS files for current function call.
 *					jsFiles: all required JS files for current function call.
 *					afterFn: function after executing current function call.
 *					delay: the milliseconds for waiting after js files are loaded.
 *				}
 *	}
 */
IX.Net = (function(){
	var head= document.getElementsByTagName('head')[0];
	var getRequestFn = function(){
		if ("XMLHttpRequest" in window) {
			return new XMLHttpRequest();
		}
		if ("ActiveXObject" in window){
			return new ActiveXObject("Microsoft.XMLHTTP");
		}
		return null;
	};
	var loadFn = function(durl, cbFun){
		var request = getRequestFn();
		if(!request){
			$XE("unsupport AJAX. Failed");return;
		}
		request.onreadystatechange  = function(){
			if (request.readyState == 4){
				if (request.status == 200){
					if (IX.isFn(cbFun)){cbFun(request.responseText);}
				} else { 
					$XE("There was an error: (" + request.status + ") " + request.statusText);
				}
			}
		};
		request.open("GET", durl, true);
		request.send("");
	};
	var loadJsFn = function(durl, nextFn){
		var script= document.createElement('script');
		script.type= 'text/javascript';
		script.src= durl;
		if (IX.isFn(nextFn)){
			if (script.readyState){ // IE
				script.onreadystatechange= function () {
					log("STATE: [" +durl +"]:" +  this.readyState);
					if (script.readyState == 'complete' || script.readyState=='loaded') {
						script.onreadystatechange = null;
						nextFn();
					}
				};
			} else {
				script.onload= nextFn;
			}
		}
		head.appendChild(script);
	};
	var loadJsFilesInSeqFn = function(jsFiles, nextFn){
		var _nextFn = IX.isFn(nextFn)?nextFn:IX.emptyFn;
		if (!jsFiles || jsFiles.length==0)
			return _nextFn();
		var n = jsFiles.length;
		var idx =0;
		var fn = function(){
			loadJsFn(jsFiles[idx], function(){
				idx +=1;
				return (idx<n)?fn():_nextFn();
			});
		};
		fn();
	};
	var loadCssFn = function(cssFile){
		var cssNode = document.createElement('link');
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.href = cssFile;
		cssNode.media = 'screen';
		head.appendChild(cssNode);
	};
	return {
		loadFile:loadFn,
		loadCss:loadCssFn,
		loadJsFiles:function(jsFiles, nextFun, mode){
			//if (!mode || mode=="seq" ){
				loadJsFilesInSeqFn(jsFiles, nextFun);
			//}
		},
		tryFn:function(fnName, argList,dependencyConfig){
			var fn = function(){				
				IX.execute(fnName, argList);
				IX.tryFn(dependencyConfig.afterFn);
			};
			if (!IX.nsExisted(fnName)){
				if (!dependencyConfig){
					return;
				}
				var config = dependencyConfig;
				IX.tryFn(config.beforeFn);
				IX.iterate(config.cssFiles, loadCssFn);
				var delay = config.delay || 100;
				loadJsFilesInSeqFn(config.jsFiles, function(){
					setTimeout(fn,delay);
				});
			} else
				fn();
		}
	};
})();

IX.win = (function(){
	var fnHT = {}, eventFnHT = {}, handlersHT = IX.I1ToNManager();
	var keySn = 0;
	var genKey = function(){return "f_" + (keySn++);};
	
	var hasEventListener = ("addEventListener" in window) ;
	var attachEvent = hasEventListener?function(target, eName, fn){
		target.addEventListener(eName, fn, false);
	}:function(target, eName, fn){
		target.attachEvent("on" + eName, fn);
	};
	var detachEvent = hasEventListener?function(target, eName, fn){
		target.removeEventListener(eName, fn, false);
	}:function(target, eName, fn){
		target.detachEvent("on" + eName, fn);
	};
	
	var executeEvent = function(eName, e){
		IX.iterate(handlersHT.get(eName), function(fKey){
			//try{
			if (IX.isFn(fnHT[fKey]))
				fnHT[fKey](e);
			//}catch(ex){
			//	console.log(ex);
			//}
		});
	};
	
	var _register = function(eName, fn){
		var _key = genKey();

	 	if(!fn._key){
	 		fn._key = _key;
			fnHT[_key] = fn;
			handlersHT.put(eName, _key);		
		}

		if (eName in eventFnHT)
			return _key;
		eventFnHT[eName] = function(evt){
			var e = evt || window.event;
			if (!("target" in e))
				e.target = e.srcElement; // for IE hack
			return executeEvent(eName, e);
		};
		attachEvent(window, eName, eventFnHT[eName]);
		return _key;
	};
	var _unregister = function(eName, fnKey){
		fnHT[fnKey] = null;
		handlersHT.remove(eName, fnKey);
		if (handlersHT.hasValue(eName))
			return;
		detachEvent(window, eName, eventFnHT[eName]);
		eventFnHT[eName] = null;
	};
	
	var _bindHandlers = function(handlers, isBind){
		var bindFn = isBind?_register: _unregister;
		var ids = IX.loop(["click", "resize", "scroll" ,"mousedown", "mouseover", "mouseout"], {}, function(acc, eventName){
			if (eventName in handlers)
				acc[eventName] = bindFn(eventName, handlers[eventName]);
			return acc;
		});
		if (isBind)
			return ids;
	};
	return {
		/**
		 * handlers :{
		 * 		click : fun
		 * 		resize : fun
		 * }
		 * return {
		 * 		click : handlerId1,
		 * 		resize : handlerId2
		 * }
		 */
		bind : function(handlers){return _bindHandlers(handlers, true);},
		/**
		 * handlerIds {
		 * 		click : handlerId1,
		 * 		resize : handlerId2
		 * }
		 */
		unbind : function(handlerIds){_bindHandlers(handlerIds, false);},
		scrollTo : function(x,y){
			window.scrollTo(x, y);
			executeEvent("scroll", null);
		}
	};
})();

$Xw = IX.win;

(function() {	
function defaultParamFn(_name, _params){return _params;}
function defaulRspFn(data, cbFn){IX.isFn(cbFn) && cbFn(data);}
function getFunProp(_cfg, _name, defFn){
	var _fn = $XP(_cfg, _name);
	return IX.isFn(_fn)?_fn :defFn;
}

function ajaxRouteFn(callerRouteDef){
	return {
		channel : $XP(callerRouteDef, "channel", callerRouteDef.name),
		type : $XP(callerRouteDef, "type", "POST"),
		dataType : $XP(callerRouteDef, "dataType", "form"),
		onsuccess : getFunProp(callerRouteDef, "onsuccess", defaulRspFn),
		preAjax : getFunProp(callerRouteDef, "preAjax", defaultParamFn),
		postAjax : $XF(callerRouteDef, "postAjax"),
		onfail : getFunProp(callerRouteDef, "onfail", defaulRspFn)
	};
}
function urlRouteFn(routeDef, ifAjax){
	var _url = $XP(routeDef, "url");
	if (IX.isEmpty(_url))
		return null;
	var route = ifAjax ? ajaxRouteFn(routeDef) : {};
	route.url = _url;
	route.urlType = $XP(routeDef, "urlType", "base") + "Url";	
	return route;	
}
function createRouteHT(routes, ifAjax){
	return IX.loop(routes, {}, function(acc, routeDef){
		var _name = $XP(routeDef, "name");
		if (IX.isEmpty(_name))
			return acc;
		var route = urlRouteFn(routeDef, ifAjax);
		if (route)
			acc [_name] = route;
		return acc;
	});
}

function UrlRouter(routes, urlFac){
	var _routeHT = createRouteHT(routes);
	var r = function(_name, params){
		return urlFac.genUrl(_routeHT[_name], params);
	};
	return r;
}

function tryLockChannel(channel){
	var id = "ajaxChannel_" + channel;
	if ($X(id))
		return false;
	IX.createDiv(id, "ajax-channel");
	//console.log ("lock channel: " + channel);
	return true;
}
function unlockChannel(channel){
	var el = $X("ajaxChannel_" + channel);
	if (el)
		el.parentNode.removeChild(el);
	//console.log ("unlock channel: " + channel);
}
function AjaxCaller(routes, _ajaxFn, urlFac, chkRes, postParamsFn){
	var _callerHT = createRouteHT(routes, true);
	var c = function(_name, params, cbFn, failFn){
		var _caller = _callerHT[_name];
		if (!_caller)
			return;

		var channel = params && params._channel_ ? params._channel_ : _caller.channel;
		if (!$XP(params, '_t')) {
			params = IX.inherit(params, {_t : ''});
		}
        if(IX.isFn(postParamsFn) && postParamsFn()) {
            params = IX.inherit(params, postParamsFn());
        }
		if (!tryLockChannel(channel)){
			_caller.onfail({
				code : 0,
				err : "channel in using:"+ channel
			}, failFn, params);			
			return;
		}
		var _cbFn = IX.isFn(cbFn) ? cbFn : IX.emptyFn;
		var _contentType =  _caller.dataType == 'json' ? 'application/json; charset=UTF-8' : 'application/x-www-form-urlencoded; charset=UTF-8';
		var _data = _caller.preAjax(_name, params);
		_data = _caller.dataType == 'json' ? JSON.stringify(_data) : _data;
		_ajaxFn({
			url : urlFac.genUrl(_caller, params),
			type :  _caller.type,
			contentType : _contentType,
			data : _data,
			success : function(data) {
				unlockChannel(channel);
				// if (IX.isFn(chkRes) && !chkRes(data)) return ;
				IX.isFn(chkRes) && chkRes(data);
				_caller.onsuccess(data, _cbFn, params);
			},
			fail: function(data){
				unlockChannel(channel);
				_caller.onfail(data, failFn, params);
			},
			error: function(data){
				unlockChannel(channel);
				_caller.onfail(data, failFn, params);
			}
		});
		_caller.postAjax(_name, params, _cbFn);
	};
	return c;
}

function UrlFactory(){
	var _urls = {};
	var genUrl = function(_route, params){
		if (!_route)
			return "";
		var url = _route.url;
		var _url = IX.isFn(url)?url(params):url.replaceByParams(params);
		var _urlBase = (_route.urlType in _urls)?_urls[_route.urlType] : _urls.baseUrl;
		return _urlBase + _url;
	};
	return {
		init : function(cfg){_urls = IX.inherit(_urls, cfg);},
		genUrl : genUrl
	};
}

function UrlEngine(ifAjax){  
	var _ajaxFn = null, _urlFac = new UrlFactory();
	
	var init = function(cfg){
		if (ifAjax && IX.isFn(cfg.ajaxFn))
			_ajaxFn = cfg.ajaxFn;
		_urlFac.init(cfg);		
	};
	return IX.inherit({
		/** cfg : {
		 * 		ajaxFn :function(ajaxParams)
		 * 		baseUrl : "https://...",
		 * 		[name]Url : "https: //...."
		 * }
		 */
		init : init, // function(cfg)
		reset : init,	
		/** routes : [{ 
		 * 		name : "page.entry",
		 * 		url : "/session" / function(params){return "/abc";},
		 * 		urlType : "urlName", //default "base"
		 * 	}]	
		 *  return : function(name, params){}
		 */
		createRouter : function(routes){
			return new UrlRouter(routes, _urlFac);
		}	
	}, ifAjax?{
		/** routes : [{ 
		 * 		name : "signIn",
		 * 		url : "/session" / function(params){return "/abc";},
		 * 		urlType : "urlName", //default "base"
		 * 
		 * 		channel : "named-channel", //default common
		 * 		type : "POST"/"GET"/"DELETE" , //default "POST"
		 * 		preAjax : function(name, params){return params;}, // default null;
		 * 		postAjax : function(name, params, cbFn){}, //default null;
		 * 		onsuccess : function(data,cbFn, params), 
		 * 		onfail : function(data, failFn, params) // default null;
		 * 	}]	
		 * return : function(name, params, cbFn, failFn){}
		 */
		createCaller: function(routes, chkRes, postParamsFn){
			return new AjaxCaller(routes, function(ajaxParam){
				if (IX.isFn(_ajaxFn)) _ajaxFn(ajaxParam);
			}, _urlFac, chkRes, postParamsFn);
		}
	} : {});
}
 
IX.urlEngine = new UrlEngine();
IX.ajaxEngine = new UrlEngine(true);
})();
/**
 * 	IX.Xml is a library to deal with XML string or document. It includes: {
 * 		parser(xmlString): it convert xmlString to XML document object and return.
 * 		getXmlString(xmlDocument) : it convert XML document to string and return.
 *  	duplicate(xmlDocument) : it duplicate xml document object and return.
 * 	}
 */
IX.Xml = (function(){return {
	parser:function(str){
		str = IX.isString(str)?str:"";
		var doc = null;
		if ("DOMParser" in window) {
			doc = (new DOMParser()).parseFromString(str, "text/xml");
		}else if ("ActiveXObject" in window){
			doc=new ActiveXObject("Microsoft.XMLDOM");
			doc.async="false";
			doc.loadXML(str);
		} else {
			$XE("this browser can't support XML parser.");
		}
		return doc;
	},
	getXmlString:function(xmlDoc){
		if(!xmlDoc==null){
			return "";
		}
		if(IX.nsExisted("document.implementation.createDocument")) {
			return (new XMLSerializer()).serializeToString(xmlDoc);
		}else if ("ActiveXObject" in window){
			return xmlDoc.xml;
		} else {
			$XE("this browser can't support XML parser.");
		}
		return "";
	},
	duplicate:function(xmlDoc){
		return this.parser(this.getXmlString(xmlDoc));
	}
};})();

/**
 * 	IX.Dom is a library to deal with DOM. It includes :{
 * 		first(node, tagN): try to get the first child of DOM element node which tag name is tagN.
 * 		next(node, tagN): try to get the first next sibling of DOM element node which tag name is tagN.
 * 		cdata(node, tagN): try to get the text of DOM element node which is involved by CDATA tag.
 * 		text (node, tagN): try to get the text of DOM element node.
 * 		attr (node, attN): try to get the value of attribute of DOM element node which name is attrN.
 * 		
 * 		inTag(tagN, content, attrs): 
 * 		inPureTag(tagN, content, attrs): 
 * }
 */
IX.Dom = (function(){
	var loopFn = function(node, type, checkFn, valueFn) {
		if (!node) return valueFn(null);
		var cnode = ("firstChild" in node)?node[type=="first"?"firstChild":"nextSibling"]:null;
		while(cnode!=null && !checkFn(cnode))
			cnode = cnode.nextSibling;
		return valueFn(cnode);
	};
	
	var getFn = function(node, tagN, type){
		return IX.isString(tagN)?loopFn(node, type, function(cnode){
					return cnode.nodeName.toLowerCase()==tagN;
				},function(cnode){
					return cnode;
				}
			):null;
	};
	var textFn = IX.isMSIE?function(node){return node? node.innerText:"";}:function(node){return node?node.textContent:"";};
	
	var cdataFn = function(node){
		if (!node)
			return "";
		return loopFn(node,"first",function(cnode){
				return cnode.nodeType==4;
			},function(cnode){
				return cnode?cnode.nodeValue:"";
			}
		);
	};
	var firstFn = function(node,tagN) {
		return getFn(node,tagN, "first");
	};
		
	var inTagFn = function(tag, content, attrs){//attrs should like [[pramName, paramValue],...
		var _attrs = IX.loop(attrs, [],  function(acc, item){
			return acc.concat(' ', item[0], '="', item[1], '"');
		});
		var arr = [].concat("<", tag, _attrs, ">", content, "</", tag, ">");
		return arr.join("");
	};
	var inPureTagFn = function(tag, content, attrs){
		return inTagFn(tag, ["<![CDATA[", content, "]]>"].join(""),  attrs);
	};
	var attrFn = function(node, attN){
		if(!node)
			return "";
		var val = node.getAttribute(attN);
		return IX.isEmpty(val)?"":val;
	};
	var setAttrFn = function(node, attN, val){
		if(!node)
			return;
		if (val)
			node.setAttribute(attN, val);
		else
			node.removeAttribute(attN);			
	};
	return {
		first:firstFn,
		next:function(node, tagN){
			return getFn(node, tagN,"next");
		},
		cdata:function(node, tagN){
			return cdataFn(firstFn(node, tagN));
		},
		text:function(node, tagN){
			return textFn(firstFn(node, tagN));
		},
		attr:attrFn,
		setAttr:setAttrFn,
		dataAttr :function(node, name){
			return attrFn(node, "data-" + name);
		},
		setDataAttr : function(node, name, val){
			setAttrFn(node, "data-" + name, val);
		},
		remove: function(node){
			if(node)
				if(node.parentNode)
					node.parentNode.removeChild(node);
		},
		isAncestor : function(node, ancestor){
			var el = node;
			while(el){				
				if (el== ancestor)
					return true;
				var nodeName = el.nodeName.toLowerCase();
				el = (nodeName=="body")? null: el.parentNode;
			}
			return false;
		},
		ancestor : function(node, tagName){
			if (!node)
				return null;
			var el =  node;
			while(el){
				var nodeName = el.nodeName.toLowerCase();
				if (nodeName==tagName)
					break;
				el =(nodeName=="body")? null: el.parentNode;
			}
			return el;
		},
		is : function(el, tagName){
			return el.nodeName.toLowerCase() == tagName;
		},
		inTag : inTagFn,
		inPureTag : inPureTagFn
	};
})();
$XD = IX.Dom;
/*
*		getStyle(node, styleName): get node's style. e.g. $XD.getStyle(node, "border-left-width"), $XD.getStyle(node, "font-size")
*/
IX.HtmlDocument = (function(){
	var hasFn = function(el, clzName){
		return el!=null && ("className" in el)&& IX.Array.isFound(clzName, (el.className+"").split(" "));
	};
	var removeFn = function(el, clzName){
		if (!el) return;
		var clz = IX.Array.remove(el.className.split(" "), clzName);
		el.className = clz.join(" ");
	};
	var addFn = function(el, clzName) {
		if (!el) return;
		var clzs = IX.Array.toSet(el.className.split(" ").concat(clzName));
		el.className = clzs.join(" ");
	};
	var nextFn = function(node, clzName){
		if (!node)
			return null;
		var el = node.nextSibling;
		while(el){
			if (hasFn(el, clzName))
				return el;
			el = el.nextSibling;
		}
		return el;
	};

	var getStyle = function(_elem,styles){
        var _value=null, elem= IX.get(_elem);
        styles = styles != "float" ? styles : document.defaultView ? "float" : "styleFloat";
        if(styles == "opacity"){
        	if(elem.filters){//IE, two ways to get opacity because two ways to set opacity and must be set opacity before get
        		if(elem.filters.length > 0){
		            try {
		                _value = elem.filters['DXImageTransform.Microsoft.Alpha'].opacity / 100;
		            }catch(e) {
		                try {
		                    _value = elem.filters('alpha').opacity;
		                } catch(err){}
		            }
	        	}else{
	        		_value = "1";
	        	}
        	}else{//w3c
        		_value = elem.style.opacity;
        	}
        }else{
	        _value=elem.style[styles] || elem.style[styles.camelize()];
	        if(!_value){
	             if (document.defaultView && document.defaultView.getComputedStyle) {
	                var _css=document.defaultView.getComputedStyle(elem, null);
	                _value= _css ? _css.getPropertyValue(styles) : null;
	             }else if (elem.currentStyle){
	                _value = elem.currentStyle[styles.camelize()];
	             }
	        }
	        if(_value=="auto" && IX.Array.indexOf(["width","height"], function(_i){return styles == _i;}) > -1 && elem.style.display!="none"){
	            _value=elem["offset"+styles.capitalize()]+"px";
	        }
        }
        return _value=="auto" ? null :_value;
    };
	return {
		getStyle : getStyle,
		hasClass : hasFn,
		removeClass : removeFn,
		addClass : addFn,
		toggleClass : function(el, clzName){
			if (!el) return;
			if (hasFn(el, clzName))
				removeFn(el, clzName);
			else addFn(el, clzName);
		},
		next :nextFn,
		first : function(parentEl, clzName){
			if (!parentEl)
				return null;
			var el = parentEl.firstChild;
			return hasFn(el, clzName)?el: nextFn(el, clzName);
		},
		isAncestor : function(node, pnode) {
			if (!node)
				return false;
			var el =  node;
			while(el!=null){
				if (el==pnode)
					return true;
				el = el.parentNode;
				if (el && el.nodeName.toLowerCase()=="body")
					break;
			}
			return false;
		},
		ancestor : function(node, clzName){
			if (!node)
				return null;
			var el =  node;
			while(el!=null && !hasFn(el, clzName)){
				el = el.parentNode;
				if (el && el.nodeName.toLowerCase()=="body")
					el = null;
			}
			return el;
		},
		
		getWindowScreen : function(){
			var body = document.documentElement;
			var win = window;
			var _scrollX = "scrollX" in win?win.scrollX:body.scrollLeft,
				_scrollY = "scrollX" in win?win.scrollY:body.scrollTop;
			
			return {
				scroll : [_scrollX, _scrollY, body.scrollWidth, body.scrollHeight],
				size : [body.clientWidth, body.clientHeight]
			};
		},
		getScroll: function(_dom){
            if (_dom && _dom.nodeType != 9){//not document
            	return {
                    scrollTop: _dom.scrollTop,
                    scrollLeft: _dom.scrollLeft
                };
            }
            var _window = !_dom ? window : _dom.defaultView || _dom.parentWindow;
            return { scrollTop: _window.pageYOffset
				    || _window.document.documentElement.scrollTop
				    || _window.document.body.scrollTop
				    || 0,
                scrollLeft: _window.pageXOffset
				    || _window.document.documentElement.scrollLeft
				    || _window.document.body.scrollLeft
				    || 0
            };
		},
		getZIndex : function(el) {
			var style = null, zIndex = null;
			while(el && el.tagName.toLowerCase()!="body"){
				style = IX.getComputedStyle(el);				
				if (style.zIndex !="auto")
					return style.zIndex - 0;
				el = el.offsetParent;
			}
			return 0;
		},
		/* ri : [ left, top, width, height] */
		rect : function(el, ri){
			IX.iterate(["left", "top", "width", "height"], function(attr, idx){
				if (ri[idx]!=null)
					el.style[attr] = ri[idx] + "px";
			});
		},
		getWindowScrollTop : function() {
			return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop	|| 0;
		},
		getPosition : function(el, isFixed){
			// getBoundingClientRect : Supported by firefox,chrome,IE8+,opera,safari
			// Return {top, left, right, bottom[, width, height]}
			// width and height are not supported in IE
			// top|left|right|bottom are offset value for visible part of window.
			var rect = el.getBoundingClientRect(),
				doc = document.documentElement || document.body;
			return [
				rect.left + (isFixed ? 0 : window.scrollX || doc.scrollLeft),
				rect.top + (isFixed ? 0 : window.scrollY || doc.scrollTop),
				el.offsetWidth,
				el.offsetHeight
			];
		}
	};	
})();
$XH = IX.HtmlDocument;

IX.Cookie = (function(){
	var getOptions = function(options){
		if (!options)
			return [];
		var vals = [];
		if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
			var date;
			if (typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			vals.push('; expires=' + date.toUTCString()); // use expires attribute, max-age is not supported by IE
		}
		if ("path" in options)vals.push('; path=' + options.path);
		if ("domain" in options)vals.push('; domain=' + options.domain);
		if ("secure" in options)vals.push('; secure=' + options.secure);
		vals.push(';HttpOnly');
		return vals;
	};
	var _set = function(name, value, options){
		var vals = [name, '=', encodeURIComponent(value)].concat(getOptions(options));
		document.cookie = vals.join('');	
	};
	
	return {
		get : function(name){
			if (IX.isEmpty(document.cookie))
				return "";
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookieN = cookies[i].trim();
				// Does this cookie string begin with the name we want?
				if (cookieN.substring(0, name.length + 1) == (name + '='))
					return decodeURIComponent(cookieN.substring(name.length + 1));
	        }
	        return "";
		},
		set : _set,
		remove : function(name){
			_set(name, '', {
				expires: -1
			});
		}
	};
})();

/** interval : n milliseconds */
IX.Task = function(taskFn, interval, times){
	var ts = -1;
	var h = null;
	var execFlag = false;
	var _times = 0, _total = isNaN(times)?-1:times;
	var getTimeInMS = IX.getTimeInMS;
	function _fn(){
		if (!execFlag)
			return;
		taskFn(_times);
		_times ++ ;
		if (_total>0 && _times>=_total)
			return;
		var _ts = getTimeInMS();
		h= setTimeout(_fn, ts + 2 * interval - _ts);
		ts = _ts; 
	}
	
	return {
		start : function(){
			ts = getTimeInMS();
			execFlag = true;
			_times = 0;
			h = setTimeout(_fn, interval);
		},
		stop : function(){
			execFlag = false;
			clearTimeout(h);
			h = null;
			ts = -1;	
		}
	};
};
(function(){
/**
 * 
 * @param {} config 
 *  tpl :  the HTML template definition.
 *  tplDataFn : the function to provide data to tpl[tplId]
 *  
 * @return {}
 */
var tplRegex = new RegExp('(?:<tpl.*?>)|(?:<\/tpl>)', 'img');
var rpRegex = /([#\{])([\u4E00-\u9FA5\w\.-]+)[#\}]/g;
var idRegex = /['"]/;

var regSplit = function(str, reg){
	var _splitArr = [], _matchArr = str.match(reg), _len = _matchArr ? _matchArr.length : 0;
	for(var i = 0;i < _len;i++){
		var _arr = _matchArr[i], _idx = str.indexOf(_arr);
		if(_idx == -1)
			continue;
		_splitArr.push(str.substring(0,_idx));
		str = str.substring(_idx + _arr.length);
	}
	_splitArr.push(str);
	return {separate : _splitArr, arr : _matchArr};
};
var parseTpl = function(tplstr){
	var tplMgr = {};
	var newTpl = function(name, html){tplMgr[name] = {name : name,tpl : [html]};};
	var appendTpl = function(name, html){tplMgr[name].tpl.push(html);};
	var reformTpl = function(name){
		var curTpl = tplMgr[name];
		var html =  curTpl.tpl.join("");
		curTpl.tpl = html; 
		curTpl.list =  IX.Array.toSet(html.match(rpRegex)).sort();
	};
	var _openTpl = function(acc, newName, html){
		var newTplName = acc[0] + "." + newName;
		appendTpl(acc[0], "#"+ newName + "#");
		acc.unshift(newTplName);
		newTpl(newTplName, html);
		return acc;	
	};
	var _closeTpl = function(acc, html){
		reformTpl(acc[0]);
		acc.shift();
		appendTpl(acc[0], html);				
		return acc;
	};
	var _regSplit = tplstr.regSplit(tplRegex);
	var tplArr = _regSplit.arr, contentArr = _regSplit.separate;
	newTpl("root", contentArr[0]);
	var nameArr = IX.loop(tplArr, ["root"], function(acc, item, idx) {
		if (item=="</tpl>")
			return _closeTpl(acc, contentArr[idx + 1]);
		var arr = item.split(idRegex);
		return _openTpl(acc, arr[1], contentArr[idx + 1]);
	});
	reformTpl("root");
	
	return (nameArr.length==1 && nameArr[0]=="root")?tplMgr : null;
};

var emptyTpl = {
	render:function(){return "";},
	renderData:function(){return "";},
	destroy : function() {},
	getTpl: function(){return "";}
};
IX.ITemplate = function(config){
	var _tpl = $XP(config, "tpl", []);
	_tpl = [].concat(_tpl).join("");	
	if(IX.isEmpty(_tpl))
		return emptyTpl;	
	var tplMgr = parseTpl(_tpl);
	if (!tplMgr) {
		alert("unformated Tpl: " + _tpl);
		return emptyTpl;
	}
	
	var _dataFn = $XP(config, "tplDataFn");
	if (!IX.isFn(_dataFn))
		_dataFn = function(){return null;};
	
	var getProps = function(data, name){
		if (!IX.hasProperty(data,name))
			return null;
		var v = $XP(data, name);
		return IX.isEmpty(v)?"":v;
	};
	var renderFn = function(tplId, data){
		var tpl = tplMgr[tplId];
		if (!tpl) {
			alert("can't find templete by name: " + tplId);
			return "";
		}
		var html = tpl.tpl;
		var arr = IX.loop(tpl.list, [], function(acc, item){
			var t = item.charAt(0);
			var _name = item.substring(1, item.length-1);
			if (t=='{') {
				var v = getProps(data, _name);
				if (v!=null)
					acc.push([item, v]);			
			} else if (t=='#') {
				var h = IX.map($XP(data, _name, []), function(itm, idx) {
					var idata = IX.inherit(itm, {idx: idx});
					return renderFn(tplId+ "." + _name, idata);
				}).join("");
				acc.push([item, h]);
			}
			
			return acc;
		});
		return html.loopReplace(arr);
	};

	var _render = function(tplId, data){
		var id = "root";		
		if (!IX.isEmpty(tplId)) 
			id = tplId.indexOf("root")==0?tplId : ("root." + tplId);
		
		return renderFn(id, data?data:_dataFn(id)).replace(/\[(\{|\})\]/g, "$1");
	};	
	return IX.inherit({		
		render : function(tplId){return _render(tplId);},
		renderData : function(tplId, data){return _render(tplId, data);},
		destroy : function() {
			tplMgr.destroy();
			tplMgr = null;
		},
		getTpl: function(tplId){
			if(!tplId)
				return _tpl;

			var _get_p_tpl = function(_id){
				var tm = tplMgr["root." + _id];
				if(!tm) return "";
				var ids = _id.split(".");
				var s = tm.tpl, ci;

				if(!tm.list || tm.list.length == 0)
					return _id == tplId ? s : ("<tpl id = '" + ids[ids.length - 1] + "'>" + s + "</tpl>");
				
				for(var i = 0; i < tm.list.length; i ++){
					ci = tm.list[i].replace(/#/g, "");
					s = s.replace(new RegExp("#" + ci + "#", "img"),  _get_p_tpl(_id + "." + ci));
				}
				return s;
			};

			return _get_p_tpl(tplId);
		}
	});
};

/**
 * 	Extends String.prototype for some tool kits. 
 */
var substrByLength = function(str, maxLength){
	var stringArr = [], matchPRC_regx = /[^\u0020-\u007A]/g, strLen = str.length,
		simpleCharLen = (str.match(/[\u0020-\u007A]/g) || []).length,
		subStringByMaxLength = str.substring(0, maxLength);
	if((subStringByMaxLength.match(matchPRC_regx) || []).length){
		var count = 0;
		for(var i = 0;i < maxLength;i++){
			var key = str[i];
			if(key === undefined || count >= maxLength){
				i < maxLength - 1 && i < strLen && stringArr.push("..");
				break;
			}
			count += key.match(matchPRC_regx) ? 2 : 1;
			stringArr.push(key);
		}
	}else
		stringArr.push(subStringByMaxLength);
	return {
		reString : stringArr.join(""),
		reLength : strLen > maxLength ? maxLength : strLen,
		stringLength : (strLen - simpleCharLen) * 2 + simpleCharLen
	};
};
var UrlRegEx = /\w+:\/\/[\w.]+[^\s\"\'\<\>\{\}]*/g;
//var PwdPattern = /^(\w){6,20}$/;
//var EmailPattern = /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
//var EmailPattern = /^[a-zA-Z0-9]{1}[\.a-zA-Z0-9_-]*[a-zA-Z0-9]{1}@[a-zA-Z0-9]+[-]{0,1}[a-zA-Z0-9]+[\.]{1}[a-zA-Z]+[\.]{0,1}[a-zA-Z]+$/;
//var EmailPattern = /^[_a-zA-Z0-9.]+@(?:[_a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,4}$/;
var EmailPattern = /^[_a-zA-Z0-9.]+[\-_a-zA-Z0-9.]*@(?:[_a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,4}$/;
var ScriptPattern = new RegExp( '(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)', 'img');
var FormPattern = new RegExp( '(?:<form.*?>)|(?:<\/form>)', 'img'); 
var TrimPattern = /(^\s*)|\r/g;
var ReplaceKeyPattern = /{[^{}]*}/g;
IX.extend(String.prototype, {
	camelize: function(){ return this.replace(/\-(\w)/ig, function(B, A) {return A.toUpperCase();}); },
	capitalize: function(){ return this.charAt(0).toUpperCase() + _str.substring(1).toLowerCase(); },
	replaceAll:function(os, ns){return this.replace(new RegExp(os,"gm"),ns);},
	loopReplace:function(varr){return IX.loop(varr, this, function(acc, item){
		return acc.replaceAll(item[0], item[1]);
	});},
		
	trim:function(){
		var str = this.replace(TrimPattern, ""),
			end = str.length-1,
			ws = /\s/;
		while(ws.test(str.charAt(end)))	
			end --;
		return str.substring(0, end+1);
	},
	stripTags:function() {return this.replace(/<\/?[^>]+>/gi, '');},
	stripScripts: function() {return this.replace(ScriptPattern, '');},
	stripFormTag:function(){return this.replace(FormPattern, '');},
	strip:function() {return this.replace(/^\s+/, '').replace(/\s+$/, '');},
	substrByLength : function(len){ return substrByLength(this.toString(), len); },
	isSpaces:function() {return (this.replace(/(\n)|(\r)|(\t)/g, "").strip().length==0);},

	isPassword : function(){return this.length > 5 && this.length < 21;},
	isEmail : function(){
		var email = this.trim();
		return IX.isEmpty(email) || EmailPattern.exec(email);
	},
	
	trunc:function(len){return (this.length>len)?(this.substring(0, len-3)+"..."):this;},
	tail:function(len){return (this.length>len)?(this.substring(this.length-len)):this;},

	dehtml:function(){return this.loopReplace([["&", "&amp;"], ["<", "&lt;"],['"', "&quot;"]]);},
	enhtml:function(){return this.loopReplace([["&lt;", "<"],["&quot;",'"'], ["&amp;", "&"]]);},

	multi:function(len){ return IX.Array.init(len, this).join("");},
	
	pickUrls:function(){return this.match(UrlRegEx);},
	replaceUrls : function(_r, _f){return this.replace(_r || UrlRegEx, _f || function(a){return '<a href="'+ a + '" target="_blank">' + a + '</a>';});},
	regSplit : function(reg){ return regSplit(this, reg); },
	
	pick4Replace : function(){return this.match(ReplaceKeyPattern); },
	replaceByParams : function(data) {
		var items = IX.Array.compact(this.match(ReplaceKeyPattern));
		return IX.loop(items, this, function(acc, item){
			var _key = item.slice(1,-1);
			return IX.isEmpty(_key)?acc:acc.replaceAll(item, $XP(data, _key, ""));
		});
	},
	inPureTag :function(tagN, attrs){return IX.Dom.inPureTag(tagN, this, attrs);},
	inTag :function(tagN, attrs){return IX.Dom.inTag(tagN, this, attrs);},

	toSafe : function(){
		return this.replace(/\$/g, "&#36;");
	},
	/**
	 * 左补齐字符串
	 * @param  {Number} nLen	要补齐的长度
	 * @param  {String} ch 	要补齐的字符
	 * @return {String}		补齐后的字符串
	 */
	padLeft : function (nLen, ch) {
		var len = 0,
			s = this ? this : "";
		// 默认要补齐0
		ch = ch ? ch : '0';
		len = s.length;
		while(len < nLen) {
			s = ch + s;
			len++;
		}
		return s;
	},
	/**
	 * 右补齐字符串
	 * @param  {Number} nLen	要补齐的长度
	 * @param  {String} ch 		要补齐的字符
	 * @return {String}			补齐后的字符串
	 */
	padRight : function (nLen, ch) {
		var len = 0,
			s = this ? this : "";
		// 默认要补齐0
		ch = ch ? ch : '0';
		len = s.length;
		while(len < nLen) {
			s = s + ch;
			len++;
		}
		return s;
	},
	/**
	 * 左移小数点的位置（用于数学计算，相当于除以Math.pow(10, scale)）
	 * @param  {Number} scale 	要移位的刻度
	 * @return {String} 		返回移位后的数字字符串
	 */
	movePointLeft : function (scale) {
		var s, s1, s2, ch, ps, sign;
		ch = '.';
		sign = '';
		s = this ? this : "";
		if (scale <= 0) return s;
		ps = s.split('.');
		s1 = ps[0] ? ps[0] : "";
		s2 = ps[1] ? ps[1] : "";
		if (s1.slice(0, 1) == "-") {
			// 负数
			s1 = s1.slice(1);
			sign = '-';
		}
		if (s1.length <= scale) {
			ch = "0.";
			s1 = s1.padLeft(scale);
		}
		return sign + s1.slice(0, -scale) + ch + s1.slice(-scale) + s2;
	},
	/**
	 * 右移小数点位置（用于数学计算，相当于乘以Math.pow(10, scale)）
	 * @param  {Number} scale 	要移位的刻度
	 * @return {String} 		返回移位后的数字字符串
	 */
	movePointRight : function (scale) {
		var s, s1, s2, ch, ps;
		ch = '.';
		s = this ? this : "";
		if (scale <= 0) return s;
		ps = s.split('.');
		s1 = ps[0] ? ps[0] : "";
		s2 = ps[1] ? ps[1] : "";
		if (s2.length <= scale) {
			ch = '';
			s2 = s2.padRight(scale);
		}
		return s1 + s2.slice(0, scale) + ch + s2.slice(scale, s2.length);
	},
	/**
	 * 移动小数点位置（用于数学计算，相当于（乘以／除以）Math.pow(10, scale)）
	 * @param  {Number} scale 		要移位的刻度（正数表示向右移动；负数表示向左移动；0返回原值）
	 * @return {String} 			返回移位后的数字字符串
	 */
	movePoint : function (scale) {
		if (scale >= 0) {
			return this.movePointRight(scale);
		} else {
			return this.movePointLeft(-scale);
		}
	}
});

/**
 * 		Extends Function.prototype which function bind.
 */
Function.prototype.bind = function() {
	var __method = this, args = $XA(arguments), object = args.shift();
	return function() {return __method.apply(object, args.concat($XA(arguments)));};
};
})();
/**
 * 	IX.UUID is a generator to create UUID.
 */
IX.UUID = (function(){
	var itoh = '0123456789ABCDEF';
	return {
		generate:function() {
			var  s = new Array() ;
			var i=0;
			for (i = 0; i <36; i++)
				s[i] = Math.floor(Math.random()*0x10);
			s[14] = 4;
			s[19] = (s[19] & 0x3) | 0x8;
			
			for (i = 0; i <36; i++) s[i] = itoh[s[i]];
			s[8] = s[13] = s[18] = s[23] = ''; // seperator
			return s.join('');
		}
	};
})();

IX.ns("IX.Util");
// Not be supported by IE serials
IX.Util.Image = (function(){
	var _getImageDataUrl = function(img,cw,ch, w, h){
		var canvas = document.createElement("canvas");
		canvas.width = cw;  
		canvas.height = ch;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(img, (cw-w)/2, (ch-h)/2, w, h);
		var dataURL = canvas.toDataURL("image/png");
		delete canvas;
		return dataURL;
	};
	var getRatioWH = function(w, h, rw, rh){
		var wratio = w/rw, hratio = h/rh;
		if (wratio>=1 && hratio>=1)
			return [rw, rh];
		wratio = Math.min(wratio, hratio);
		return [rw * wratio, rh *wratio];		
	};
	/* cfg : {width, height}
	 * return : {url, w, h, data}
	 */
	var getImageData = function(imgEl, cfg){
		if (!imgEl)
			return null;
		var img = new Image();
		img.src = imgEl.src;
		var wh =getRatioWH($XP(cfg, "width", img.width), $XP(cfg, "height", img.height), img.width, img.height);
		if (wh[0] * wh[1] == 0)
			return null;
		var dataURL = _getImageDataUrl(img, wh[0], wh[1], wh[0], wh[1]);
		delete img;
		return {
			url : imgEl.src,
			w: wh[0], 
			h: wh[1],
			data : dataURL
		};
	};
	var setImageData = function(imgEl, imgData, keepRatio){
		if (!imgEl)
			return;
		var img = new Image();
		img.src = imgData.data;
		var cwEl = keepRatio?imgEl:img;
		var wh =getRatioWH(cwEl.width, cwEl.height, img.width, img.height);
		//console.log(wh +":" + imgEl.width + ":" + imgEl.height);
		var dataURL = _getImageDataUrl(img,cwEl.width, cwEl.height, wh[0], wh[1]);
		delete img;
		imgEl.src = dataURL;
	};
	
	return {
		getData : getImageData,
		setData : setImageData
	};
})();
IX.Util.Date = function(timeInSecond) {
	var date = new Date(timeInSecond*1000);	
	var getFieldValues = function(_time){
		var getPrefix = "get" + (IX.Date.isUTC()?"UTC":"");
		return IX.map(["FullYear", "Month", "Date", "Hours", "Minutes", "Day"], function(f){
			var v  = _time[getPrefix + f]() - (f=="Month"?-1:0);
			if (f!="Hours" && f!="Minutes")
				return v;
			var s = "00"+ v;
			return s.substring(s.length-2);
		});
	};
	var _formatStr = function(x, len) {
		var str = "" + x;
		var l = len || 2;
		return ("0".multi(l) + str).substr(str.length, l);
	}; 
	var time = getFieldValues(date);
	return {
		toText: function(){return IX.Date.format(date);},
		toWeek : function() {return time[5];},
		toDate: function(incYear){
			var curTime = getFieldValues(new Date());
			incYear = incYear || (curTime[0]>time[0]);
			return [incYear?time[0]:"", incYear?"年":"",time[1], "月", time[2], "日"].join("");
		},
		toTime : function(){return [time[3], time[4]].join(":");},
		toShort : function(){
			var ds = IX.Date.getDS(), ts = IX.Date.getTS();
			var curTime = getFieldValues(new Date());
			var strs = new Array();
			var shouldAppend = false;
			if (time[0] != curTime[0]){
				shouldAppend = true;
				strs.push(_formatStr(time[0], 4));
				strs.push(ds);
			}
			if (shouldAppend || time[1] != curTime[1] || time[2] != curTime[2]){
				strs.push(_formatStr(time[1]));
				strs.push(ds);
				strs.push(_formatStr(time[2]));
				strs.push(' ');
			}
			strs.push(_formatStr(time[3]));
			strs.push(ts);
			strs.push(_formatStr(time[4]));	
			return strs.join("");
		},
		toInterval : function(tsInSec){
			var _date = tsInSec?(new Date(tsInSec*1000)) :(new Date());  
			var v = _date.getTime()/1000-timeInSecond;
			if (v< 10)
				return "刚才";
			else if (v<60)
				return Math.round(v)+ "秒之前";
			else if (v<3600)
				return Math.round(v/60) + "分钟前";
			var ds = "/", ts = ":";
			var curTime = getFieldValues(_date);
			var strs = new Array();
			var shouldAppend = false;
			if (time[0] != curTime[0]){
				shouldAppend = true;
				strs.push(_formatStr(time[0], 4));
				strs.push(ds);
			}
			if (shouldAppend || time[1] != curTime[1] || time[2] != curTime[2]){
				strs.push(_formatStr(time[1]));
				strs.push(ds);
				strs.push(_formatStr(time[2]));
				strs.push(' ');
			} else 
				strs.push("今天");
			
			strs.push(_formatStr(time[3]));
			strs.push(ts);
			strs.push(_formatStr(time[4]));	
			return strs.join("");
		},
		toSimpleInterval : function(){
			return IX.Date.getDateText(timeInSecond,IX.getTimeInMS() /1000);
		}
	};
}; 

IX.Util.Event = {
	target: function(e){
		return e.target||e.srcElement;
	},
	stopPropagation : function(e) {
		//如果提供了事件对象，则这是一个非IE浏览器
		if ( e && e.stopPropagation )
			//因此它支持W3C的stopPropagation()方法
			e.stopPropagation();
		else
			//否则，我们需要使用IE的方式来取消事件冒泡
			window.event.cancelBubble = true;
	},
	preventDefault : function( e ) {	//阻止浏览器的默认行为
		//阻止默认浏览器动作(W3C)
		if ( e && e.preventDefault )
			e.preventDefault();
		//IE中阻止函数器默认动作的方式
		else
			window.event.returnValue = false;
		return false;
	},
	stop: function(e){
		IX.Util.Event.preventDefault(e);
		IX.Util.Event.stopPropagation(e);
	}
};
///////////////////////////////////////////////////// UTILS finished///////////
/**
 * 
 * Basic class definition
 * @param {} config {
 * 		id: the identified object(String, number, ...). If not provider, use IX.UUID to create one.
 * 		type: the object type, can be anything which's meaning is assigned by inherit class.
 * }
 * @return {
 * 		getId(): return current object identification.
 * 		setId(id): replace identification's value	
 * 		getType() : return current object type. Maybe null.
 * 		equal(dst) : return if they have same identification.
 * 		destroy(): it is better to have  for each new class.
 * }
 */
/** //Unused temporary 
IX.IObject = function(config){
	var _id = $XP(config, "id", IX.UUID.generate());
	var _type = $XP(config, "type");
	
	return {
		getId:function(){
			return _id;
		},
		setId:function(id){
			_id = id;
		},
		getType:function(){
			return _type;
		},
		equal : function(dst) {
			return _id == dst.getId(); 
		},
		destroy: function(){}
	};
};
*/
var getIXScriptEl = function(){
	if ("scripts" in document) {
		var scripts =document.scripts;
		for(var i=0; i<scripts.length; i++) {
			if (scripts[i].src.indexOf("ixutils.js")>=0)
				return scripts[i];
		}
	}
	var head = $XD.first(document.documentElement, "head");
	var ixEl = $XD.first(head, "script");
	while(ixEl){
		if (ixEl.src.indexOf("ixutils.js")>=0)
			break;			
		ixEl = $XD.next(ixEl, "script");
	}
	return ixEl;
};
(function(){
var ixEl = getIXScriptEl();
var path = ixEl?ixEl.src:"";
IX.SELF_PATH = path;
IX.SCRIPT_ROOT = path.substring(0, path.indexOf("lib/ixutils.js")); 
})();
