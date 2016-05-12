// Route Engin
(function() {
    var RouteAttrDefValue = { name: "", url: "", urlType: "site", type: "GET" };

    function urlItemFn(columns, urlDef) {
        return IX.loop(columns, {}, function(acc, name, idx) {
            var _value = urlDef.length > idx ? urlDef[idx] : null;
            if (IX.isEmpty(_value))
                _value = RouteAttrDefValue[name];
            acc[name] = _value;
            return acc;
        });
    }
    // columns : ["name", "url", "urlType"] , // or  ["name", "url", "urlType", "type"]
    function UrlStore(columns) {
        var _routes = new IX.IListManager();
        var _urlItemFn = function(urlDef) {
            var routeName = urlDef[0];
            if (!IX.isEmpty(routeName))
                _routes.register(routeName, urlItemFn(columns, urlDef));
        };
        return {
            map: function(urlList) { IX.iterate(urlList, _urlItemFn); },
            getAll: _routes.getAll,
            get: _routes.get
        };
    }

    var urlEngine = IX.urlEngine,
        ajaxEngine = IX.ajaxEngine;
    var urlStore = new UrlStore(["name", "url", "urlType"]),
        ajaxStore = new UrlStore(["name", "url", "urlType", "type"]);
    var urlGenerator = null; //function(name, params){return "";};
    function _urlGenerator(name, params) {
        return IX.isFn(urlGenerator) ? urlGenerator(name, params) : "";
    }

    /** routeDef : "routeName" or  {
     * 		name:  "routeName",
     * 		channel: "",
     * 		url : function(params){},
     * 		preAjax : function(name, params){return paramsl;}, // default null;
     * 		postAjax : function(name, params, cbFn){}, //default null;
     * 		onsuccess : function(data,cbFn, params), 
     * 		onfail : function(data, failFn, params) // default null;
     *  }
     */
    function createEntries(routes, isCaller, postParamsFn) {
        return ajaxEngine[isCaller ? "createCaller" : "createRouter"](IX.map(routes, function(routeDef) {
            var isRef = IX.isString(routeDef);
            return IX.inherit(ajaxStore.get(isRef ? routeDef : routeDef.name), isRef ? {} : routeDef);
        }), function(res) {
            var resultcode = $XP(res, 'resultcode', '');
            if (resultcode == 'FP10005') {
                document.location.href = Hualala.PageRoute.createPath('login');
                return false;
            }
            if (resultcode == 'RELOGIN001') {
                setTimeout(function() {
                    document.location.href = '/';
                }, 1000);
                return false;
            }
            return true;
        }, postParamsFn);
    }

    function initEngine(cfg) {
        urlEngine.init(cfg);
        ajaxEngine.init(cfg);
    }

    IX.ns("Hualala");

    Hualala.urlEngine = {
        init: initEngine,
        reset: initEngine,
        /**  urlList : [ [name, url, urlType], ...]  */
        mappingUrls: function(urlList) {
            urlStore.map(urlList);
            urlGenerator = urlEngine.createRouter(urlStore.getAll());
        },
        genUrls: function(names) {
            return IX.map(names, _urlGenerator); },
        genUrl: function(name, params) {
            return _urlGenerator(name, params); }
    };
    Hualala.getGroupID = function() {
        var getSessionFn = Hualala.getSessionSite,
            groupID = IX.isFn(getSessionFn) ? $XP(getSessionFn(), 'groupID', '') : '',
            groupName = IX.isFn(getSessionFn) ? $XP(getSessionFn(), 'groupName', '') : '';
        var getSessionUserFn = Hualala.getSessionUser,
            role = IX.isFn(getSessionUserFn) ? $XP(getSessionUserFn(), 'role', '') : '',
            loginName = IX.isFn(getSessionUserFn) ? $XP(getSessionUserFn(), 'loginName', '') : '';
        if (role != '' && role) { role = role.join(',') };
        return groupID ? { _groupID: groupID, _role: role, _loginName: loginName, _groupName: groupName } : {};
    };
    Hualala.ajaxEngine = {
        init: initEngine,
        reset: initEngine,
        /**  urlList : [ [name, url, urlType, type], ...]  */
        mappingUrls: ajaxStore.map, //function(urlList)

        createCaller: function(routes) {
            return createEntries(routes, true, Hualala.getGroupID); },
        createRoute: createEntries
    };
})();

// CommonFn
(function($) {
    IX.ns("Hualala.Common");
    /**
     * 根据图片服务器上的原始资源图片,按照配置信息，返回缩放、剪裁、水印等效果的图片链接
     * 图片地址：
     * [protocol] [domain] [path] [fileName] [extension]
     * [http://] [res.hualala.com] [/group1/M00/1E/3B/][wKgBZE5Izt6pUY8WAAD2HTq6pjo419][.jpg]
     * @param {String} path 图片资源的路径(必须)
     * @param {Object} cfg 对于图片的配置信息
     *         cfg : {
     *         		//控制是否加水印
     *         		watermark : true|false 	(是否需要打水印,默认为false)
     *         		//控制缩放规则
     *         		scale : 	'percent'(百分比缩放) | 
     *         				'lockMin'(锁定比例按照最小值缩放)(默认) | 'lockMax'(锁定比例按照最大值缩放) | 'unlock'(取消锁定比例) |
     *         				'lockMinZoomOut'(锁定比例，按照固定尺寸取小值缩小*只允许缩小*) | 
     *         				'lockMinZoomIn'(锁定比例，按照固定尺寸取小值放大*只允许放大*) |
     *         				'lockMaxZoomOut'(锁定比例，按照固定尺寸取大值缩小*只允许缩小*) |
     *         				'lockMaxZoomIn'(锁定比例，按照固定尺寸取大值放大*只允许放大*) | 
     *         				'unlockZoomOut'(取消锁定比例，按照固定尺寸缩小*只允许缩小*) | 
     *         				'unlockZoomIn'(取消锁定比例，按照固定尺寸放大*只允许放大*) 
     *         		width : 300,
     *         		height : 200,
     *         		//控制截取规则 
     *         		//NOTE：一旦cut不为空，缩放规则自动取消
     *         		cut : 	null(不截取) | 'normal'(正常截取图片) | 'max'(最大化截取图片矩形区域)
     *         		offsetX : 0,
     *         		offsetY : 0,
     *         		//控制图片旋转
     *         		rotate :  degree(顺时针0~360) | null
     *         		//控制图片的质量
     *         		quality : (图片质量百分数1-100) | null
     *         }
     * @return {String} 返回图片地址
     */
    Hualala.Common.getSourceImage = function(path, cfg) {
        var settings = IX.inherit({
            watermark: false,
            scale: 'lockMin',
            width: null,
            height: null,
            cut: null,
            offsetX: null,
            offsetY: null,
            rotate: null,
            quality: null
        }, cfg);
        var imgDomain = !$XP(settings, 'watermark', false) ?
            Hualala.Global.IMAGE_RESOURCE_DOMAIN : Hualala.Global.IMAGE_RESOURCE_WATERMARK_DOMAIN;
        if (!path || IX.isObject(path)) return '';
        var lastSlash = path.lastIndexOf('/');
        fileName = path.slice(lastSlash + 1),
            suffix = '',
            path = path.slice(0, lastSlash);
        suffix = fileName.replace(/^(.*)\.(jpg|jpeg|png|gif|ico)/i, '$2');
        fileName = fileName.replace(/^(.*)\.(jpg|jpeg|png|gif|ico)/i, '$1');

        var w = $XP(settings, 'width', null),
            h = $XP(settings, 'height', null),
            x = $XP(settings, 'offsetX', null),
            y = $XP(settings, 'offsetY', null);

        var scale = $XP(settings, 'scale'),
            scaleE = '';
        var cut = $XP(settings, 'cut', null),
            cutE = '';
        var rotate = $XP(settings, 'rotate', null),
            quality = $XP(settings, 'quality', null),
            paramE = [];
        var scaleRule = {
            // 协议类型< width- >x< height- >
            'percent': '-',
            // 协议类型< width >x< height >
            'lockMin': '',
            // 协议类型< width >x< height>_ 例如：300x200_
            'lockMax': '_',
            // 协议类型 < width >x< height>! 例如：300x200!
            'unlock': '!',
            // 协议类型 < width >x< height>) 例如：600x200)
            'lockMinZoomOut': ')',
            // 协议类型 < width >x< height>( 例如：600x200(
            'lockMinZoomIn': '(',
            // 协议类型 < width >x< height>)_ 例如：600x200)_
            'lockMaxZoomOut': ')_',
            // 协议类型 < width >x< height>(_ 例如：600x200(_
            'lockMaxZoomIn': '(_',
            // 协议类型 < width >x< height>)! 例如：600x200)!
            'unlockZoomOut': ')!',
            // 协议类型 < width >x< height>(! 例如：600x200(!
            'unlockZoomIn': '(!',
        };
        var cutRule = {
            // 协议类型 c< width >x< height>+< offset_x>+< offset_y>
            'normal': 'c',
            'max': 'C'
        };
        // 获取scale表达式
        if (IX.isEmpty(w) && IX.isEmpty(h)) {
            scaleE = '';
        } else if (IX.isEmpty(w) || IX.isEmpty(h)) {
            scaleE = scale == 'percent' ?
                ('=' + (IX.isEmpty(w) ? h : w) + scaleRule[scale]) : '';
        } else {
            scaleE = '=' + w + (scale == 'percent' ? scaleRule[scale] : '') + 'x' + h + scaleRule[scale];
        }

        // 获取截取参数
        // NOTE:一旦截取图片功能开启，缩放功能无效
        if (!IX.isEmpty(cut)) {
            scaleE = '';
            if (IX.isEmpty(w) || IX.isEmpty(h)) {
                cutE = '';
            } else {
                cutE = cutRule[cut] + w + 'x' + h + '+' + (x || 0) + '+' + (y || 0);
            }
        } else {
            cutE = '';
        }

        // 获取旋转图片参数
        if (!IX.isEmpty(rotate) && rotate > 0) {
            paramE.push('rotate=' + rotate);
        }
        // 获取图片的质量参数
        if (!IX.isEmpty(quality) && quality > 0) {
            paramE.push('quality=' + quality);
        }
        paramE = paramE.join('&');
        var ret = imgDomain + '/' + path + '/' + fileName + scaleE + cutE + '.' + suffix + (paramE.length > 0 ? ('?' + paramE) : '');
        return ret;
    };
})(jQuery);


// CommonFn
(function($) {
    IX.ns("Hualala.Common");
    // Image Oprater
    var CacheTypes = {
        logo: "logo",
        photo: "user",
        docThumb: "thumb"
    };
    Hualala.Common.loadImageErr = function(imgEl, type) {
        if (!imgEl || !imgEl.parentNode)
            return;
    };
    var defaultPhotoImg = null;
    Hualala.Common.avatarFn = function(src, type, clz) {
        if (IX.isEmpty(src)) {
            if (!defaultPhotoImg) {
                defaultPhotoImg = Hualala.Global.getDefaultImage("photo");
            }
            src = defaultPhotoImg;
        }
        return '<img src="' + src + '" class="' + (clz || "avatar-32") +
            '" onerror="Hualala.Common.loadImageErr(this, ' + "'" + (type || "photo") + "'" + ');"/>';
    };

    // Date
    Hualala.Date = IX.Util.Date;
    /**
     * 格式化Ajax返回给前端的日期时间数据
     * 后端返回前端时间日期数据格式为：yyyyMMddHHmmss，
     * 我们要将这种奇怪的日期字符串格式转化为统一的标准的日期字符串格式yyyy/MM/dd HH:mm:ss
     * @param  {String} v 	奇怪的日期时间数据字符串：yyyyMMddHHmmss
     * @return {String}		统一的标准时间日期数据字符串 ： yyyy/MM/dd HH:mm:ss
     */
    Hualala.Common.formatDateTimeValue = function(v) {
        if (IX.isEmpty(v) || !IX.isString(v)) return '';
        var fullLen = 14,
            l = v.length,
            r = '00000000000000';
        if (l < fullLen) {
            v += r.slice(0, (fullLen - l));
        }
        return v.replace(/([\d]{4})([\d]{2})([\d]{2})([\d]{2})([\d]{2})([\d]{2})/g, '$1/$2/$3 $4:$5:$6');
    };

    Hualala.Common.formatDateStr = function(str, l, sp) {
        sp = sp || '/';
        l == l || 8;
        var ln = str.length;
        if (ln < 8) return '';
        var ret = [str.substr(0, 4), str.substr(4, 2), str.substr(6, 2)].join(sp);
        if (l == 12 && ln >= 12)
            ret += ' ' + str.substr(8, 2) + ':' + str.substr(10, 2);
        else if (l == 14) {
            if (ln >= 12)
                ret += ' ' + str.substr(8, 2) + ':' + str.substr(10, 2);
            if (ln >= 14)
                ret += ':' + str.substr(12, 2);
        }

        return ret;
    }

    /**
     * 设置垂直居中位置
     * offset : {top : [int], left : [int]}
     */
    Hualala.Common.setCenter = function(el, parentEl, offset) {
        !parentEl && (parentEl = document.documentElement || document.body);
        !offset && (offset = {});
        el.style.top = (((parentEl.clientHeight - el.clientHeight) / 2) + (offset.top || 0)) + 'px';
        el.style.left = (((parentEl.clientWidth - el.clientWidth) / 2) + (offset.left || 0)) + 'px';
    };

    /**
     * 获取字符串的字节长度
     * str : [String]
     */
    Hualala.Common.strByteLength = function(str) {
        var i, sum = 0;
        for (i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i);
            if ((charCode >= 0) & (charCode <= 255)) {
                sum += 1;
            } else {
                sum += 2;
            }
        }
        return sum;
    };

    /**
     * 按字节数截取字符串
     * str : [String], n : [int]
     */
    Hualala.Common.substrByte = function(str, n) {
        var s2 = str.slice(0, n),
            i = s2.replace(/[^\x00-\xff]/g, "**").length;
        if (i <= n) return s2;
        i -= s2.length;
        switch (i) {
            case 0:
                return s2;
            case n:
                return str.slice(0, n >> 1);
            default:
                var k = n - i,
                    s3 = str.slice(k, n),
                    j = s3.replace(/[\x00-\xff]/g, "").length;
                return j ? str.slice(0, k) + Hualala.Common.substrByte(s3, j) : str.slice(0, k);
        }
    };

    /*
     * 把input框里输入的中文逗号用替换成英文逗号
     * */
    Hualala.Common.replaceZhComma = function(str) {
        return (str || '').replace(/，/g, ',');
    };


    /**
     * 获取浏览器品牌及版本号信息
     * @return {Object} {browserName:version}
     */
    Hualala.Common.Browser = (function() {
        var browser = {},
            ua = navigator.userAgent.toLowerCase(),
            match = null;
        (match = ua.match(/rv:([\d.]+)\) like gecko/)) ? browser['ie'] = match[1]:
            (match = ua.match(/msie ([\d.]+)/)) ? browser['ie'] = match[1] :
            (match = ua.match(/chrome\/([\d.]+)/)) ? browser['chrome'] = match[1] :
            (match = ua.match(/firefox\/([\d.]+)/)) ? browser['firefox'] = match[1] :
            (match = ua.match(/opera.([\d.]+)/)) ? browser['opera'] = match[1] :
            (match = ua.match(/version\/([\d.]+).*safari/)) ? browser['safari'] = match[1] : 0;
        return browser;
    })();

    /**
     * 获取事件间隔选项数据
     * @param  {Object} cfg {startLabel, start, end}
     *          cfg : {
     *          	startLabel : 第一个选项的label，
     *          	end : 结束的分钟
     *          }
     * @return {[type]}     [description]
     */
    Hualala.Common.getMinuteIntervalOptions = function(cfg) {
        var startLabel = $XP(cfg, 'startLabel', '不限'),
            end = $XP(cfg, 'end', (Hualala.Constants.SecondsOfDay / 60)),
            list = Hualala.TypeDef.MinuteIntervalOptions(end);
        return _.map(list, function(el, i) {
            return IX.inherit(el, {
                label: i == 0 ? startLabel : $XP(el, 'label', '')
            });
        });
    };

    /**
     * 将表单里内容转换为 plainObject
     * @param  {DOM | jQuery Objuect | selector string} form
     * @return {Object | null}    { formFiledName1: value1, formFiledName2: value2, ... }
     */
    Hualala.Common.parseForm = function(form) {
        var $form = $(form);
        if (!$form[0]) return null;

        var fields = $form.serializeArray();
        if (!fields.length) return null;

        var result = {};
        $.each(fields, function(i, o) { result[o.name] = o.value; });

        return result;

    };

    //根据对象的一个属性检查某个对象是否在一个对象数组中
    Hualala.Common.inArray = function(arr, obj, key) {
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i][key] == obj[key]) return i;
        }
        return -1;
    }

    /**
     * 号码遮罩
     * @param  {String} code  需要进行遮罩的字符串
     * @param  {Int} start 开始遮盖的字符串位置
     * @param  {Int} end   遮盖结束位置
     * @return {Object}		返回遮盖操作后的字符串和原始字符串{orig, val}       
     */
    Hualala.Common.codeMask = function(code, start, end) {
        code = !code ? '' : code.toString();
        var len = code.length,
            str = '';
        start = IX.isEmpty(start) ? 0 : parseInt(start);
        end = IX.isEmpty(end) ? len : parseInt(end);
        str = code.slice(0, start) + code.slice(start, end).replace(/[\w]/g, '*') + code.slice(end);
        return {
            orig: code,
            val: str
        };
    };

    /**
     * 根据银行代码获取银行基本信息
     * @param  {String} bankCode 银行代码
     * @return {Object}          银行信息{code, name, icon_16, icon_32, icon_48, icon_64}
     */
    Hualala.Common.mapBankInfo = function(bankCode) {
        var banks = Hualala.TypeDef.BankOptions,
            bankHT = new IX.IListManager(),
            iconSizes = [16, 32, 48, 64];
        _.each(banks, function(el) {
            var c = $XP(el, 'value'),
                n = $XP(el, 'label');
            var icons = {};
            _.each(iconSizes, function(el) {
                icons['icon_' + el] = 'icon-' + c + '-' + el;
            });
            bankHT.register(c, IX.inherit({
                code: c,
                name: n
            }, icons));
        });
        return bankHT.get(bankCode);
    };

    /**
     * 获取性别数据
     * @param  {Int} 性别值
     * @return {Object} 	{value(性别值), valueStr(性别字符值), label（性别）}
     */
    Hualala.Common.getGender = function(v) {
        if (IX.isEmpty(v)) return null;
        var l = Hualala.TypeDef.GENDER;
        var m = _.find(l, function(el) {
            var id = $XP(el, 'value');
            return id == v;
        });
        return m;
    };

    /**
     * 获取订单状态信息
     * @param  {订单状态值} v
     * @return {Object} 订单状态信息{value, label}
     */
    Hualala.Common.getOrderStatus = function(v) {
        if (IX.isEmpty(v)) return null;
        var l = Hualala.TypeDef.OrderStatus;
        var m = _.find(l, function(el) {
            return $XP(el, 'value') == v;
        });
        return m;
    };

    /**
     * 获取账单状态信息
     * @param  {订单状态值} v
     * @return {Object} 订单状态信息{value, label}
     */
    Hualala.Common.getBillSubType = function(v) {
        if (IX.isEmpty(v)) return null;
        var l = Hualala.TypeDef.BillSettingDataSet.BillSubType;
        var m = _.find(l, function(el) {
            return $XP(el, 'value') == v;
        });
        return m;
    };

    /**
     * 根据shopID获得店铺在哗啦啦www上的店铺URL
     * @param  {String} shopID 店铺ID
     * @return {String}    店铺URL
     */
    Hualala.Common.getShopUrl = function(shopID) {
        return Hualala.Global.HualalaWebSite + '/shop_' + shopID;
    };

})(jQuery);

// Common Math Fn
(function($) {
    // 提高数字的易读性，在数字每隔3位处增加逗号
    var prettyNumeric = function(num, separator) {
        if (isNaN(num)) return num.toString();
        var s = num.toString().split('.'),
            isNegative = num < 0 ? true : false,
            s1 = isNegative ? s[0].replace('-', '') : s[0],
            s2 = s[1] || '',
            l = s1.length,
            r = '';
        separator = !separator ? ',' : separator;
        if (l > 3) {
            var l1 = parseInt(l / 3),
                idx = l % 3;
            r = idx == 0 ? '' : s1.slice(0, idx) + separator;
            for (var i = 0; i < l1; i++) {
                r += s1.slice(idx + (i * 3), (idx + (i + 1) * 3)) + separator;
            }
            r = (isNegative ? '-' : '') + r.slice(0, -1) + (s2.length > 0 ? ('.' + s2) : '');
        } else {
            r = num;
        }
        return r;
    };
    // 如果字符串是易读的数字模式，使用这个函数可以还原成正常数字模式
    var restoreNumeric = function(str, separator) {
        separator = !separator ? ',' : separator;
        var s = str.split(separator).join('');
        return isNaN(s) ? str : Number(s);
    };
    // 美化价格显示，如果价格为整数，不现实小数点后的部分，如果价格为小数，显示小数点后2位
    var prettyPrice = function(price) {
        price = parseFloat(price).toFixed(2).toString();
        price = price.replace(/0+$/, '');
        var dot = price.indexOf('.');
        if (dot == price.length - 1) {
            price = price.substr(0, dot);
        }
        return price;
    };

    // 标准价格显示，自动补齐小数点后两位；标准价格显示：[整数部分].[角][分]
    var standardPrice = function(price) {
        if (isNaN(price)) return price;
        price = parseFloat(price).toFixed(2).toString();
        return price;
    };

    var add = function() {
        var baseNum = 0,
            args = $XA(arguments);
        var ret = 0;
        _.each(args, function(v) {
            var v1 = 0;
            try {
                v1 = v.toString().split('.')[1].length;
            } catch (e) {
                v1 = 0;
            }
            baseNum = v1 > baseNum ? v1 : baseNum;
        });
        // 使用字符串移动小数点方式规避javascript中由于精度差异导致的无法精确表示浮点数的bug
        // baseNum = Math.pow(10, baseNum);
        _.each(args, function(v) {
            // ret += v * baseNum;
            ret += Number(v.toString().movePoint(baseNum));
        });
        // return ret / baseNum;
        return Number(ret.toString().movePoint(-baseNum));
    };
    var sub = function() {
        var baseNum = 0,
            args = $XA(arguments),
            // 精度
            precision;
        var ret = 0;
        _.each(args, function(v) {
            var v1 = 0;
            try {
                v1 = v.toString().split(".")[1].length;
            } catch (e) {
                v1 = 0;
            }
            baseNum = v1 > baseNum ? v1 : baseNum;
        });
        precision = baseNum;
        // 使用字符串移动小数点方式规避javascript中由于精度差异导致的无法精确表示浮点数的bug
        // baseNum = Math.pow(10, baseNum);

        _.each(args, function(v, i) {
            // ret = i == 0 ? (v * baseNum) : (ret - v * baseNum);
            ret = i == 0 ?
                Number(v.toString().movePoint(baseNum)) : (ret - Number(v.toString().movePoint(baseNum)));
            // if (i == 0) {
            // 	// ret += v * baseNum;
            // 	ret += Number(v.toString().movePoint(baseNum));
            // } else {
            // 	// ret -= v * baseNum;
            // 	ret -= Number(v.toString().movePoint(baseNum));
            // }
        });
        // return (ret / baseNum).toFixed(precision);
        return Number(numberToFixed(Number(ret.toString().movePoint(-baseNum)), precision));
    };
    var multi = function() {
        var baseNum = 0,
            args = $XA(arguments);
        var ret = 1;
        _.each(args, function(v) {
            try {
                baseNum += v.toString().split('.')[1].length;
            } catch (e) {

            }
        });
        _.each(args, function(v) {
            ret *= Number(v.toString().replace(".", ""));
        });
        // 使用字符串移动小数点方式规避javascript中由于精度差异导致的无法精确表示浮点数的bug
        // return ret / Math.pow(10, baseNum);
        return Number(ret.toString().movePoint(-baseNum));
    };
    var div = function() {
        var baseNum = [],
            baseNum1 = [],
            args = $XA(arguments);
        var ret = 1,
            scale = 0;
        _.each(args, function(v) {
            try {
                baseNum.push(v.toString().split(".")[1].length);
            } catch (e) {
                baseNum.push(0);
            }
        });
        with(Math) {
            _.each(args, function(v, i) {
                var v1 = Number(v.toString().replace(".", ""));
                ret = i == 0 ? v1 : (ret / v1);
            });
            _.each(baseNum, function(v, i) {
                scale = i == 0 ? v : (scale - v);
            });
            // 使用字符串移动小数点方式规避javascript中由于精度差异导致的无法精确表示浮点数的bug
            // return ret * pow(10, scale);
            return Number(ret.toString().movePoint(-scale));
        }
    };
    var numberToFixed = function(num, scale) {
        var s, s1, s2, start;
        scale = scale || 0;
        s1 = num + "";
        start = s1.indexOf('.');
        s = s1.movePoint(scale);
        if (start >= 0) {
            s2 = Number(s1.substr(start + scale + 1, 1));
            if (s2 >= 5 && num >= 0 || s2 < 5 && num < 0) {
                s = Math.ceil(s);
            } else {
                s = Math.floor(s);
            }
        }
        return Number(s.toString().movePoint(-scale));
    };
    IX.ns("Hualala.Common");
    Hualala.Common.Math = {
        prettyNumeric: prettyNumeric,
        restoreNumeric: restoreNumeric,
        prettyPrice: prettyPrice,
        standardPrice: standardPrice,
        add: add,
        sub: sub,
        multi: multi,
        div: div,
        numberToFixed: numberToFixed
    };
})(jQuery);

// CommonFn Scroll
(function($) {
    IX.ns("Hualala.Common");
    // 平滑滚动到obj元素顶部
    function smoothScroll(obj, during, fn) {
        $(document.body).animate({ scrollTop: $(obj).offset().top }, during, 'swing', fn);
    };
    // 平滑滚动到obj元素中部
    function smoothScrollMiddle(obj, during, fn) {
        var $obj = $(obj),
            t = $obj.offset().top,
            oh = $obj.height(),
            wh = $(window).height();
        $(document.body).animate({ scrollTop: t + oh / 2 - wh / 2 }, during, 'swing', fn);
    };
    Hualala.Common.smoothScroll = smoothScroll;
    Hualala.Common.smoothScrollMiddle = smoothScrollMiddle;

    /**
     * 获取当前页面的角色权限
     * @return {Object} 角色权限数据
     * @param {String} name 当前页面名称
     * @param {String} parentName 父级页面名称
     * @param {Array} roles 当前用户的角色
     * @param {NULL|Object} right 用户在当前页面的权限, null：证明没有权限访问页面
     *        @param {String} name 页面名称
     *        @param {String} url 页面链接
     *        @param {NULL|Array} enabled 有权限进行的操作入口名称
     *        @param {NULL|Array} disabled 无权限进行的操作入口名称
     */
    var getCurPageUserRight = function() {
        var curPageCxt = Hualala.PageRoute.getPageContextByPath(location.href),
            parentName = $XP(curPageCxt, 'parentName', ''),
            name = $XP(curPageCxt, 'name', '');
        var roles = $XP(Hualala.getSessionUser(), 'role', []),
            userRights = Hualala.getSessionUserRight(),
            ht = new IX.IListManager();
        _.each(userRights, function(el) {
            ht.register(el.name, el);
        });
        var right = ht.get(name);
        return {
            name: name,
            parentName: parentName,
            roles: roles,
            right: right
        };
    };
    Hualala.Common.getCurPageUserRight = getCurPageUserRight;

    /**
     * 对AJAX接口调用的封装
     * @return {Object} jQuery Deferred 对象
     * @param {String} api Hualala.Globel命名空间下的AJAX接口名称
     * @param {Object} params 调用AJAX接口传递的参数
     */
    function loadData(api, params, data, path) {
        var df = $.Deferred();

        if (data) df.resolve(data);
        else Hualala.Global[api](params, function(rsp) {
            if (rsp.resultcode != '000') {
                rsp.resultmsg && Hualala.UI.TopTip({ msg: rsp.resultmsg, type: 'danger' });
                df.reject(rsp);
                return;
            }
            if (path === false) {
                df.resolve(rsp);
                return;
            }
            path = path || 'data.records';
            var sucData = rsp,
                paths = path.split('.'),
                l = paths.length - 1;

            for (var i = 0; i < l; i++)
                sucData = sucData[paths[i]] || {};

            df.resolve(sucData[paths[l]]);
        });

        return df.promise();
    }
    Hualala.Common.loadData = loadData;

    /*
    处理textarea空行问题
    参数：string
    返回 string
    */
    //编码textarea的内容
    function encodeTextEnter(text) {
        if (!text || typeof text != 'string') return text;
        return text.trim().replace(/[\n]/g, '<br/>');
    }
    Hualala.Common.encodeTextEnter = encodeTextEnter;
    //解码textarea的内容
    function decodeTextEnter(text) {
        if (!text) return text;
        return text.replace(/<br\/>/g, '\n');
    }
    Hualala.Common.decodeTextEnter = decodeTextEnter;

    Hualala.Common.removeModal = function() {
        var modal = $('.modal');
        if (modal) modal.remove();
        Hualala.UI.clearEditors();
    };

    function createDateSelect($container, startYear, endYear) {
        var getDigitalSelectData = function(name, label, start, count) {
            var optionValues = _.times(count, function(i) {
                    return i + start; }),
                options = _.map(optionValues, function(val) {
                    return { value: val < 10 ? '0' + val : val + '', name: val + label };
                });
            return { name: name, options: name == 'year' ? options.reverse() : options };
        };
        var selectTpl = Handlebars.compile(Hualala.TplLib.get('tpl_select')),
            yearStart = startYear ? startYear : 0,
            yearEnd = endYear ? endYear : 0,
            yearCount = yearEnd - yearStart + 1,
            yearData = getDigitalSelectData('year', '年', startYear, yearCount > 0 ? yearCount : 0),
            monthData = getDigitalSelectData('month', '月', 1, 12),
            dayData = getDigitalSelectData('day', '日', 1, 31),
            $yearSelect = $XP(yearData, 'options', []).length > 0 ? selectTpl(yearData) : '',
            $monthSelect = selectTpl(monthData),
            $daySelect = selectTpl(dayData);
        _.each([$yearSelect, $monthSelect, $daySelect], function($select) {
            $container.append($select);
        });
        $container.on('change', 'select', function() {
            var $this = $(this),
                thisName = $this.attr('name'),
                year = '',
                month = '',
                day = '',
                newDayData = [],
                dayLength = 31;
            switch (thisName) {
                case 'year':
                    day = $this.siblings('select[name="day"]').val();
                    month = $this.siblings('[name="month"]').val();
                    year = $this.val();
                    break;
                case 'month':
                    day = $this.siblings('select[name="day"]').val();
                    month = $this.val();
                    year = $this.siblings('[name="year"]').val();
                    break;
                case 'day':
                    day = $this.val();
                    month = $this.siblings('select[name="month"]').val();
                    year = $this.siblings('[name="year"]').val();
                    break;
            }
            if (month == 2) {
                dayLength = (year && (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))) ? 29 : 28;
                day = parseInt(day) > dayLength ? '01' : day + '';
            } else if ((month < 8 && month % 2 != 0) || (month >= 8 && month % 2 == 0)) {
                dayLength = 31;
            } else {
                dayLength = 30;
                day = day == 31 ? '01' : day + '';
            }
            var $parent = $this.parent();
            if (thisName != 'day') {
                newDayData = getDigitalSelectData('day', '日', 1, dayLength);
                _.findWhere(newDayData.options, { value: day }).selected = 'selected';
                $this.siblings('[name="day"]').remove();
                $parent.append(selectTpl(newDayData));
            }
        });
        return $container;
    }
    Hualala.Common.createDateSelect = createDateSelect;

    //只适交换了dom元素的子元素
    var swapDom = function($dom1, $dom2) {
        var $dom1Children = $dom1.children(),
            $dom2Children = $dom2.children();
        $dom1.empty().append($dom2Children);
        $dom2.empty().append($dom1Children);
    };
    Hualala.Common.SwapDom = swapDom;
    //验证名称重复提交的双ajax请求
    //参数：ajax1和ajax2为发送请求的名称，
    //		data1和data2分别为发送请求所需的参数  callbackFn回调的函数
    var nestedAjaxCall = function(ajax1, ajax2, data1, data2, callbackFn) {
        var G = Hualala.Global,
            topTip = Hualala.UI.TopTip;
        G[ajax1](data1, function(rsp) {
            if (rsp.resultcode == '000') {
                G[ajax2](data2, function(res) {
                    if (res.resultcode == "000") {
                        callbackFn(res);
                    } else {
                        res.resultmsg && topTip({ msg: res.resultmsg, type: 'danger' });
                        return;
                    }
                });
            } else {
                rsp.resultmsg && topTip({ msg: rsp.resultmsg, type: 'danger' });
                return;
            }
        });
    };
    Hualala.Common.NestedAjaxCall = nestedAjaxCall;


    /* 
     *	获得时间差
     * 	时间格式为 年-月-日 小时:分钟:秒 或者 年/月/日 小时：分钟：秒 
     * 	年月日为全格式，例如 ： 2010-10-12 01:00:00 
     * 	返回精度为：秒，分，小时，天
     */
    var GetDateDiff = function(startTime, endTime, diffType) {
        //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式 
        startTime = startTime.replace(/\-/g, "/");
        endTime = endTime.replace(/\-/g, "/");
        //将计算间隔类性字符转换为小写
        diffType = diffType.toLowerCase();

        var sTime = new Date(startTime); //开始时间
        var eTime = new Date(endTime); //结束时间
        //作为除数的数字
        var divNum = 1;
        switch (diffType) {
            case "second":
                divNum = 1000;
                break;
            case "minute":
                divNum = 1000 * 60;
                break;
            case "hour":
                divNum = 1000 * 3600;
                break;
            case "day":
                divNum = 1000 * 3600 * 24;
                break;
            default:
                break;
        }
        return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
    }
    Hualala.Common.GetDateDiff = GetDateDiff;

    /*
     * jquery插件：屏蔽双击操作效果
     * 使用方法：$('buttons').onlySingleClick(callback(index,el));
     */
    jQuery.fn.extend({
        onlySingleClick: function(fn) {
            var t = null;
            return $(this).each(function(index, el) {
                $(el).on('click', function(event) {
                	clearTimeout(t);
                    t = setTimeout(function() {
                        fn(index, el);
                    }, 300);
                });
                $(el).on('dblclick', function(event) {
                    //clearTimeout(t);
                    //newfn(index, el);
                }); 
            });
        }
    });
    

    /*
     * 下载修正，防止闪屏
     * @param url {string}  下载文件地址
     */
    function fileDownload(url) {
        $('<iframe></iframe>')
            .css('display', 'none')
            .appendTo('body').prop("src",url);
    }
    Hualala.Common.fileDownload = fileDownload;

})(jQuery);
