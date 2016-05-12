(function($, window) {
    IX.ns("Hualala.UI");
    /**
     * show popover tip for target element
     * @param  {[Object]} cfg [description]
     *         trigger : 'click|hover|focus|manual'
     *         targetEl : popover tip apply on this $tar
     *         msg : tip content
     *         type : tip message type
     *         placement : string|function 
     *         container : selector
     *         afterShow : function 
     *         afterHide : function 
     * @return {[null]}     [description]
     */
    var PopoverMsgTip = function(cfg) {
        var $tar = $XP(cfg, 'targetEl', null);
        if (!$tar) return;
        $tar = $($tar);
        var msg = $XP(cfg, 'msg', ''),
            type = $XP(cfg, 'type', 'warning'),
            placement = $XP(cfg, 'placement', 'left'),
            trigger = $XP(cfg, 'trigger', 'click'),
            title = $XP(cfg, 'title', ''),
            container = $XP(cfg, 'container', false),
            afterShow = $XF(cfg, 'afterShow'),
            afterHide = $XF(cfg, 'afterHide');
        $tar.popover({
            html: true,
            placement: function(popoverEl, triggerEl) {
                // console.info(popoverEl);
                // console.info(triggerEl);
                // console.info(this);
                $(popoverEl).addClass(type);
                return placement;
            },
            trigger: trigger,
            // type : type,
            content: msg,
            container: container
        });
        $tar.on('shown.bs.popover', function() {
            afterShow($tar, type);
        });
        $tar.on('hidden.bs.popover', function() {
            afterHide($tar, type);
            $tar.popover('destroy');
        });
        $tar.popover('show');
    };

    /**
     * show tip message for model window
     * 
     * @param {[Object]} cfg [config params]
     *        msg : "string",
     *        type : "danger|warning|success",
     *        afterClosed : function () {},
     *        afterClose : function () {}
     * @return {[jQuery Obj] } [tip obj]
     */
    var TopTip = function(cfg) {
        var tpl = Handlebars.compile(Hualala.TplLib.get('tpl_site_toptip'));
        var tipEl = $(tpl({
            id: IX.id(),
            type: $XP(cfg, 'type', 'warning'),
            msg: $XP(cfg, 'msg', '')
        }));
        tipEl.appendTo('body');
        tipEl.bind({
            'close.bs.alert': function(e) {
                $XF(cfg, 'afterClose')(e);
            },
            'closed.bs.alert': function(e) {
                $XF(cfg, 'afterClosed')(e);
            }
        });
        tipEl.addClass('popup');
        tipEl.alert();
        var timmer = null,
            count = 0;
        setTimeout(function() {
            if (count <= 1) {
                setTimeout(arguments.callee, count == 0 ? $XP(cfg, 'interval', 2000) : 500);
                count == 1 && tipEl.removeClass('popup').addClass('bubbleover');
                count++;
            } else {
                tipEl.alert('close');
            }

        }, 500);
        // setTimeout(function () {
        // 	tipEl.removeClass('popup').addClass('bubbleover');
        // 	tipEl.alert('close');
        // }, $XP(cfg, 'interval', 3000));
    };

    /**
     * cfg :{
     * 		container : DOM|jQuery Obj //default $('body') 
     * 		id : '',	//default IX.id()
     * 		backdrop : true|false|'static'  //true（默认）:点击窗口外区域自动关闭窗口；false:点击窗口外围不会关闭窗口,半透明蒙版也没有；
     * 											static:点击窗口外围不会关闭窗口,但是半透明蒙版存在
     * 		zIndex : null,	//default null
     * 		dragHandler : null,	//拖动手柄 default null
     * 		containment : null,	//拖动范围容器 default null
     * 		overFlow : false,	//default false
     * 		movable : false	,	//default false
     * 		showTitle : true ,	//default true
     * 		showFooter : true,	//default true
     * 		hideCloseBtn : false,	//default false 默认显示窗口的关闭按钮
     * 		title : '',			//title string
     * 		hideWithRemove : true,	//隐藏时是否删除
     * 		clz : '',			//dialog className
     * 		afterRemove : function () {},
     * 		afterShow : function () {},
     * 		afterHide : function () {},
     * 		onBeforeDrag : function () {},
     * 		onDragging : function () {},
     * 		onAfterDrag : function () {}
     * }
     */
    var ModalDialog = function(cfg) {
        var config = IX.inherit({
            container: null,
            backdrop: true,
            id: null,
            html: '',
            ifDrag: false,
            dragHandler: null,
            containment: null,
            overFlow: false,
            zIndex: null,
            showTitle: true,
            showFooter: true,
            hideCloseBtn: false,
            title: '',
            hideWithRemove: true,
            clz: '',
            sizeCls: '', //modal-lg | modal-sm | ''
            afterRemove: IX.emptyFn,
            afterHide: IX.emptyFn,
            afterShow: IX.emptyFn,
            onBeforeDrag: IX.emptyFn,
            onDragging: IX.emptyFn,
            onAfterDrag: IX.emptyFn
        }, cfg);

        var $self = null,
            $con = null,
            $modal = null,
            isFirst = true;
        var $dialogHead = null,
            $dialogBody = null,
            $dialogFoot = null,
            $closeBtn = null;
        var dialogId = $XP(config, 'id', 'modal_dialog_' + IX.id());
        var dialogTpl = Handlebars.compile(Hualala.TplLib.get('tpl_modal_dialog'));
        var dialogCfg = {
            clz: $XP(config, 'clz', ''),
            id: dialogId,
            title: $XP(config, 'title', ''),
            backdrop: $XP(config, 'backdrop', true)
        };

        var initStyle = function() {
            var _overflow = $XP(config, 'overFlow', false),
                _zIndex = $XP(config, 'zIndex', null);
            // $dialogBody.css({
            // 	"overflow" : !_overflow : 'hidden' : 'auto'
            // });
            if (_zIndex && !isNaN(_zIndex)) {
                $self.css({
                    'z-index': _zIndex
                });
            }
            if (!$XP(config, 'showTitle', false)) {
                $dialogHead.hide();
            }
            if (!$XP(config, 'showFooter', false)) {
                $dialogFoot.hide();
            }
            if (!!$XP(config, 'hideCloseBtn', true)) {
                $closeBtn.hide();
            }
        };

        var bindEvent = function() {
            $self.on('hidden.bs.modal', function(e) {
                $XF(config, 'afterHide')(e);
                if ($XP(config, 'hideWithRemove', false)) {
                    $self.remove();
                }
            });
            $self.on('shown.bs.modal', function(e) {
                $XF(config, 'afterShow')(e);
            });
            if (!config.ifDrag || (!config.showTitle && !config.dragHandler)) return;
            var $handler = $(dragHandler, $self);
            if ($handler.length == 0) return;
            if (!self.draggable) return;
            $self.draggable({
                cursor: 'move',
                containment: config.containment || 'document',
                handle: config.showTitle ? dialogHead : $handler,
                start: config.onBeforeDrag,
                drag: config.onDragging,
                stop: config.onAfterDrag
            });
        };

        var init = function() {
            $con = $XP(cfg, 'container', null);
            $con = !$con ? $('body') : $($con);
            $self = $(dialogTpl(dialogCfg));
            $self.appendTo($con);
            $dialogHead = $self.find('.modal-header');
            $closeBtn = $dialogHead.find('.close');
            $dialogBody = $self.find('.modal-body');
            $dialogFoot = $self.find('.modal-footer');
            config.html && $dialogBody.html(config.html);
            config.sizeCls && $self.find('.modal-dialog').addClass(config.sizeCls);
            _model._ = {
                container: $con,
                dialog: $self,
                header: $dialogHead,
                body: $dialogBody,
                footer: $dialogFoot
            };
            initStyle();
            bindEvent();
        };

        var _hide = function() {
            _model._.dialog.modal('hide');
        };

        var _show = function() {
            _model._.dialog.modal('show');
            return _model;
        };

        var _model = {
            _: {},
            show: _show,
            hide: _hide,
            setTitle: function(title) {
                $dialogHead.find('.modal-title').html(title);
            }
        };
        init();
        return _model;
    };

    /**
     * Alert提示框
     * @param {Object} cfg 	{msg, label, cbFn}
     */
    var Alert = function(cfg) {
        var msg = $XP(cfg, 'msg', ''),
            label = $XP(cfg, 'label', '确定'),
            cbFn = $XF(cfg, 'cbFn');
        var btnTpl = Handlebars.compile(Hualala.TplLib.get('tpl_site_modal_btns'));
        var btns = [{
            clz: 'btn btn-warning',
            name: 'ok',
            label: label
        }];
        var modal = new ModalDialog({
            id: 'ix_alert_' + IX.id(),
            clz: 'x-alert',
            title: '',
            showTitle: false,
            backdrop: 'static',
            afterRemove: function() {

            }
        });
        var $dialog = modal._.dialog,
            $header = modal._.header,
            $body = modal._.body,
            $footer = modal._.footer;
        $body.html(msg);
        $footer.html(btnTpl({ btns: btns }));
        $dialog.on('click', '.btn[name=ok]', function(e) {
            modal.hide();
            cbFn();
        });
        modal.show();
        return modal;
    };
    /**
     * Confirm提示框
     * @param {Object} cfg  {title, msg, okLabel, okFn, cancelLabel, cancelFn}
     */
    var Confirm = function(cfg) {
        var msg = $XP(cfg, 'msg', ''),
            title = $XP(cfg, 'title', ''),
            okLabel = $XP(cfg, 'okLabel', '确定'),
            cancelLabel = $XP(cfg, 'cancelLabel', '取消'),
            okFn = $XF(cfg, 'okFn'),
            cancelFn = $XF(cfg, 'cancelFn');
        var btnTpl = Handlebars.compile(Hualala.TplLib.get('tpl_site_modal_btns'));
        var btns = [{
            clz: 'btn btn-default',
            name: 'cancel',
            label: cancelLabel
        }, {
            clz: 'btn btn-warning',
            name: 'ok',
            label: okLabel
        }];
        var modal = new ModalDialog({
            id: 'ix_confirm_' + IX.id(),
            clz: 'x-confirm',
            title: title,
            showTitle: true,
            hideCloseBtn: true,
            backdrop: 'static',
            afterRemove: function() {

            }
        });
        var $dialog = modal._.dialog,
            $header = modal._.header,
            $body = modal._.body,
            $footer = modal._.footer;
        $body.html(msg);
        $footer.html(btnTpl({ btns: btns }));
        $dialog.on('click', '.btn[name]', function(e) {
            var act = $(this).attr('name');
            modal.hide();
            if (act == 'ok') {
                okFn();
            } else {
                cancelFn();
            }
        });
        modal.show();
    };

    /**
     * 搜索结果为空的提示
     * @param {Object} cfg {msg, clz, container}
     */
    var EmptyPlaceholder = function(cfg) {
        var container = $XP(cfg, 'container', $('body')),
            msg = $XP(cfg, 'msg', '无结果'),
            clz = $XP(cfg, 'clz', 'text-center');
        var tpl = Handlebars.compile(Hualala.TplLib.get('tpl_empty_placeholder'));
        var $el = null;
        var init = function() {
            var htm = tpl({
                clz: clz,
                msg: msg
            });
            $el = $(htm).hide();
            container.append($el);
        };
        init();
        return {
            el: $el,
            show: function() {
                $el && $el.fadeIn(400);
            },
            hide: function() {
                $el && $el.fadeOut(400);
            },
            destroy: function() {
                if ($el) {
                    $el.hide().remove();
                    delete this;
                }
            }
        }
    };

    /**
     * 面包屑控件
     * 根据当前页面生成页面层级面包屑
     * @param {Object} cfg {container,hideRoot,nodes, clz, clickFn, mapRenderData}
     *         @param {jQueryObj} container	容器
     *         @param {Boolean} hideRoot 是否隐藏根节点
     *         @param {Array} nodes 节点数据[{name,label,path},...]
     *         @param {String} clz 面包屑样式类
     *         @param {Function} clickFn 点击事件处理,
     *         @param {Function} mapRenderData 处理渲染数据方法
     * @return {Object} BreadCrumb
     */
    var BreadCrumb = function(cfg) {
        var settings = {
            container: null,
            hideRoot: false,
            nodes: [],
            clz: '',
            clickFn: function() {
                var $this = $(this);
                document.location.href = $this.attr('data-href');
            },
            mapRenderData: function(data, hideRoot, clz) {
                hideRoot === true && data.shift();
                return {
                    clz: clz || '',
                    items: data
                };
            }
        };
        settings = IX.inherit(settings, cfg);
        var tpl = Handlebars.compile(Hualala.TplLib.get('tpl_site_breadcrumb'));
        var mapFn = $XF(settings, 'mapRenderData');
        var $breadCrumb = $(tpl(mapFn($XP(settings, 'nodes'), $XP(settings, 'hideRoot', false), $XP(settings, 'clz', ''))));
        settings.container.empty().append($breadCrumb);
        $breadCrumb.on('click', 'a', function(e) {
            $XF(settings, 'clickFn').apply(this, e);
        });
        return {
            breadCrumb: $breadCrumb,
            show: function() { $breadCrumb.show(); },
            hide: function() { $breadCrumb.hide(); }
        };
    };

    /**
     * 加载等待模态窗 
     * @param {Object} cfg 
     *        @param {jQuery Obj} container 容器默认$('body')
     *        @param {String} title 等待描述，默认“努力加载中...”
     *        @param {String} modalClz 窗体样式
     *        @param {Int} start 进度条开始位置，默认20
     *        @param {String} progressClz 进度条样式,默认“progress-bar-warning progress-bar-striped active”
     *        @param {Function} afterShow 
     *        @param {Function} afterHide 
     */
    var LoadingModal = function(cfg) {
        var $container = $XP(cfg, 'container', $('body')),
            title = $XP(cfg, 'msg', "努力加载中..."),
            modalClz = $XP(cfg, 'modalClz', ''),
            start = $XP(cfg, 'start', 20),
            min = $XP(cfg, 'min', 0),
            max = $XP(cfg, 'max', 100),
            progressClz = $XP(cfg, 'progressClz', 'progress-bar-warning progress-bar-striped active'),
            afterShow = $XF(cfg, 'afterShow'),
            afterHide = $XF(cfg, 'afterHide');
        var progressTpl = Handlebars.compile(Hualala.TplLib.get('tpl_site_progress'));
        var percent = Hualala.Common.Math.div(start, Hualala.Common.Math.sub(max, min));
        var modal = new ModalDialog({
            id: 'ix_progress_' + IX.id(),
            clz: 'x-progress',
            title: title,
            showTitle: true,
            showFooter: false,
            backdrop: 'static',
            afterHide: afterHide,
            afterShow: afterShow
        });
        var $dialog = modal._.dialog,
            $header = modal._.header,
            $body = modal._.body,
            $footer = modal._.footer;
        $body.html(progressTpl({
            progressClz: progressClz,
            start: start,
            min: min,
            max: max,
            percent: Hualala.Common.Math.multi(Hualala.Common.Math.numberToFixed(percent, 2), 100) + '%'
        }));
        return {
            modal: modal,
            show: function() {
                modal.show();
            },
            hide: function() {
                modal.hide();
            },
            updateProgress: function(curProgress) {
                start = curProgress;
                percent = Hualala.Common.Math.div(start, Hualala.Common.Math.sub(max, min));
                var s = Hualala.Common.Math.multi(Hualala.Common.Math.numberToFixed(percent, 2), 100) + '%';
                $body.find('.progress-bar').attr('aria-valuenow', start).css('width', s);
                $body.find('.progress-bar>span').html(s);
            }
        };


    };





    /*
    options = {
        onSuccess: function () {},
        onTooLarge: function () {},
        onConcel: function () {},
        onStart: function () {}
    }*/
    var uploadImg = function uploadImg(options) {
            var defaults = {
                onSuccess: function() {},
                onTooLarge: function() {},
                onTooSmall: function() {},
                onStart: function() {},
                onBefore: function() {},
                minSize: 100,
                saveSize: 600
            };
            var opts = $.extend(defaults, options);
            var G = Hualala.Global,
                swfRoot = G.SWF_ROOT + '/',
                swfSrc = swfRoot + 'hualalaImageUpload.swf',
                args = 'swfId=txsc&uploadDataFieldName=upload&uploadSvrURL=http://file.hualala.com/upload&iconsURL=' + swfRoot + 'icons&avaQuality=70&minImgFRule=' + opts.minSize + '&saveImgRule=' + opts.saveSize;

            var tpl = Handlebars.compile(Hualala.TplLib.get('tpl_site_uploadimg')),
                $tpl = $(tpl({ swfSrc: swfSrc, args: args }));

            var $dialog = $tpl.appendTo('body')
                .modal({ backdrop: 'static', keyboard: false })
                .on('hidden.bs.modal', function() { $(this).remove(); });

            opts.onConcel = opts.onConcel || function() { $dialog.modal('hide'); };
            if (typeof opts.onBefore == 'function') opts.onBefore($dialog);
            var topTip = Hualala.UI.TopTip;
            window.Head_Pic_Rece_URL = function(imgPath, swfId) {
                if ("IOError" === imgPath) {
                    topTip({ msg: '图片上传失败，请稍候再试' });
                    return;
                }

                topTip({ type: 'success', msg: '图片上传成功！' });
                opts.onSuccess(imgPath, $dialog);
            };
            window.imageTooLarge = function(swfId) {
                topTip({ msg: '您上传的图片过大，请换一张！' });
                opts.onTooLarge();
            };
            window.imageTooSmall = function(swfId) {
                topTip({ msg: '您上传的图片过小，请换一张！' });
                opts.onTooSmall();
            };
            window.Head_Pic_Cancel = function(swfId) { opts.onConcel($dialog); };
            window.uploadStart = function(swfId) { opts.onStart(); };
            return $dialog;
        }
        /**
	 * 文件上传组件
	 * @param {jQuery Object} $elem 点击此元素会执行上传动作
            若要兼容 IE<=8，elem须是label元素
	 * @param {Function} onSuccess 上传成功回调函数
	 * @param {Object} options 配置参数 {
                action: form的action属性的值 '/imageUpload.action',
                inputFileName: file控件的名称 'myFile',
                accept: file控件accept 'image/gif,image/jpeg,image/png,image/jpg,image/bmp',
                dataType: 相当于$.ajsx的dataType 'json',
                container: 承载file控件的form所在的容器 'body',
                noUploading: $elem 是否无“上传中”的状态提示 false,
                onBefore: 选择文件后，执行上传动作之前的回调函数，
                          如果返回false，则需要手动调用upload()执行上传动作,
                onFail: 上传失败回调函数,
                onProgress: 上传进行中回调函数,
                onAlways: 上传动作完成的回调函数,
                limitSize:限制大小
            }
        @return {Object} {
            upload: Function 类型，此方法用于执行上传动作
            $form: jQuery 对象，承载上传file控件的 form
        }
	 */
    function fileUpload($elem, onSuccess, options) {
        var isBtn = $elem.is('.btn'),
            isLabel = $elem.is('label');
        var defaults = {
            formId: 'hllFileForm',
            action: '/imageUpload.action',
            inputFileName: 'myFile',
            accept: 'image/gif,image/jpeg,image/png,image/jpg,image/bmp',
            dataType: 'json',
            container: 'body',
            data: '',
            limitSize: '',
            noUploading: false,
            onProgress: function() {}
        }
        cfg = $.extend({}, defaults, options);

        var $_form = $('#' + cfg.formId);
        var $form = $_form[0] ? $_form :
            $('<form method="post" enctype="multipart/form-data"></form>')
            .attr('id', cfg.formId)
            .attr('action', cfg.action);

        if (isBtn) {
            $elem.attr('data-uploading-text', '上传中...');
        }
        if (isLabel) {
            $elem.attr('for', cfg.inputFileName);
            $form.attr('style', 'width: 0; height: 0; overflow: hidden')
                .appendTo(cfg.container);
        }

        function onFail(rsp, $form, $elem) {
            TopTip({ msg: '上传失败！', type: 'danger' });
            cfg.onFail && cfg.onFail(rsp, $form, $elem);
        }

        cfg.onBefore = cfg.onBefore || function($elem) {
            if (isBtn && !cfg.noUploading) $elem.attr('disabled', 'disabled').button('uploading');
        }

        cfg.onAlways = cfg.onAlways || function(rsp, $form, $elem) {
            if (isBtn && !cfg.noUploading) setTimeout(function() {
                $elem.removeAttr('disabled').button('reset');
            }, 1000);
        }

        function upload(cfg) {
            $form.ajaxSubmit({
                    data: cfg.data,
                    dataType: cfg.dataType,
                    uploadProgress: cfg.onProgress
                }).data('jqxhr').done(function(rsp) {
                    if (typeof rsp == 'string') rsp = $.parseJSON(rsp);

                    if (rsp.status != 'success' && rsp.resultcode != "000") {
                        if (rsp.status) {
                            onFail(rsp, $form, $elem);
                            return;
                        } else {
                            rsp.resultmsg && TopTip({ msg: rsp.resultmsg, type: 'danger' });
                            // BUG#7429 fix by chenyao
                            cfg.onFail && cfg.onFail(rsp, $form, $elem);
                            return;
                        }
                    }
                    // rsp = { url, imgHWP, imgWidth, imgHeight, status, resultMsg }
                    setTimeout(function() {
                        if (rsp.status == 'success' || rsp.resultcode == "000") {
                            if (rsp.status) {
                                TopTip({ msg: '上传成功！', type: 'success' });
                            } else {
                                rsp.resultmsg && TopTip({ msg: rsp.resultmsg, type: 'success' });
                            }
                        }
                        //TopTip({msg: '上传成功！', type: 'success'}); 
                    }, 1000);
                    onSuccess && onSuccess(rsp, $form, $elem);
                })
                .fail(function(rsp) { onFail(rsp, $form, $elem); })
                .always(function(rsp) { cfg.onAlways(rsp, $form, $elem); });
        }

        // 创建了一个闭包作为点击事件的回调
        $elem.click((function(cfg) {
            return (function() {
                var $file = $('<input type="file">')
                    .attr('name', cfg.inputFileName)
                    .attr('accept', cfg.accept);

                //if (isLabel) $file.attr('id', cfg.inputFileName + IX.id());

                $file.appendTo($form.empty()).change(function() {
                    var fileSize = $file[0].files[0].size;
                    if (cfg.limitSize.length != 0 && fileSize > cfg.limitSize) {
                        TopTip({ msg: '上传文件超过了文件的限制大小，请重新选择文件', type: 'danger' });

                    } else {
                        if (cfg.onBefore($elem, $file, $form, cfg) === false) return;
                        var pageName = Hualala.PageRoute.getPageContextByPath().name,
                            caituMoal = $elem.parents().find(".modal#caitu");
                        if(pageName=="shopMenu"&&caituMoal.length!=0){
                            var isGroupAll = $elem.parent().find("input[name='isGroupAll']").prop("checked")?1:0;
                            cfg.data = IX.inherit(cfg.data,{isGroupAll:isGroupAll});
                        }else{
                            cfg.data = cfg.data;
                        }
                        upload(cfg);
                    }
                });

                //if (!isLabel) $file.click();
                $file.click();  // trigger a click on the input element
            });
        })(cfg));

        return { upload: upload, $form: $form };
    }

    function fillSelect($select, items, k, t, dk, dt) {
        var options = [];
        var optgroup = [];
        if (dk !== false && $.isArray(items)) {
            items = items.slice();
            var firstItem = {};
            firstItem[k] = dk || '';
            firstItem[t] = dt || '全部';
            items.unshift(firstItem);
        }

        if ($.isArray(items)) {
            for (var i = 0, j = 0, item; item = items[i++];) {
                if (k == 'value' && item[k] == '0') {
                    optgroup.push($('<optgroup>').attr('label', item[t]).html(options));
                    j++;
                    options = [];
                } else {
                    options.push($('<option>').val(item[k]).text(item[t]));
                }
            }
            if (optgroup.length > 0) options = optgroup;
        } else if ($.isPlainObject(items)) {
            for (var key in items)

                options.push($('<option>').val(key).text(items[key]));
        }

        return $select.html(options);
    };

    function createChosen($select, items, k, t, cfg, defaultItem, cv) {
        items = items.slice();
        cfg = cfg || {};
        if (defaultItem !== false) {
            defaultItem = defaultItem || {};
            var firstItem = { py: defaultItem.py || 'quan;bu' };
            firstItem[k] = defaultItem[k] || '';
            firstItem[t] = defaultItem[t] || '全部';
            items.unshift(firstItem);
        }

        var matcher = (new Pymatch([])),
            getMatchedFn = function(searchText) {
                matcher.setNames(_.map(items, function(el) {
                    return IX.inherit(el, {
                        name: el[cfg.matchField || t],
                        py: el.py
                    });
                }));

                var matchedSections = matcher.match(searchText),
                    matchedOptions = {};

                _.each(matchedSections, function(el, i) {
                    matchedOptions[el[0][k]] = true;
                });
                return matchedOptions;
            },
            opts = {
                placeholder_text: "请选择或输入内容",
                // max_selected_options: 1,
                no_results_text: "没有相关结果！",
                allow_single_deselect: true,
                getMatchedFn: getMatchedFn
            };
        if (!cfg.noFill) fillSelect($select, items, k, t, false);
        var obj = {};
        obj[k] = cv;
        cv = _.findWhere(items, obj) ? cv : items[0] ? items[0][k] : '';
        if (cv && !cfg.noCurrent) $select.val(cv);
        return $select.chosen($.extend(opts, cfg || {}));
    };

    function createSchemaChosen($shopSelect, $citySelect, pageName) {
        Hualala.Global.getShopQuerySchema({}, function(rsp) {
            if (rsp.resultcode != '000') {
                rsp.resultmsg && topTip({ msg: rsp.resultmsg, type: 'danger' });
                return;
            }
            var shops = rsp.data.shops,
                cities = rsp.data.cities;

            $citySelect && createChosen($citySelect, cities, 'cityID', 'cityName');
            if (pageName === 'crmDealDetail'||pageName ==='crmQueryMember') {
                var shopID = Number(shops[0].shopID);
                if (shopID !== 0) {
                    var online = { "shopID": '0', "shopName": "网上自助入会", "py": "dian;pu;0", "keywordLst": "店铺", "cityID": '', "cityName": "", "areaID": "", "areaName": "" };
                    shops.unshift(online);
                }
            }
            $shopSelect && createChosen($shopSelect, shops, 'shopID', 'shopName');


            if ($citySelect && $shopSelect) {
                $citySelect.change(function() {
                    var that = this;

                    var retShops = !that.value ? shops : _.filter(shops, function(shop) {
                        return shop.cityID == that.value;
                    })
                    $shopSelect.siblings('.chosen-container').remove();
                    createChosen($shopSelect.show().data('chosen', null), retShops, 'shopID', 'shopName');
                });
            }
        });
    }

    function createEditor(editorId, toolbar) {
        if (!editorId) return;
        toolbar = toolbar || ['source | undo redo | bold italic underline strikethrough | superscript subscript | forecolor backcolor | removeformat |',
            'insertorderedlist insertunorderedlist | selectall cleardoc paragraph | fontfamily fontsize',
            '| justifyleft justifycenter justifyright justifyjustify |',
            'wxlink unlink | image video | map',
            '| horizontal print preview', 'drafts'
        ];

        UM.delEditor(editorId);
        var editor = UM.getEditor(editorId, { toolbar: toolbar });
        Hualala.UI.EditorList.push(editor);
        return editor;
    }

    function clearEditors() {
        Hualala.UI.EditorList = _.uniq(Hualala.UI.EditorList);
        _.each(Hualala.UI.EditorList, function(editor) {
            if (editor.$container) editor.destroy();
        });
        Hualala.UI.EditorList = [];
    }

    Hualala.UI.PopoverMsgTip = PopoverMsgTip;
    Hualala.UI.TopTip = TopTip;
    Hualala.UI.ModalDialog = ModalDialog;
    Hualala.UI.Alert = Alert;
    Hualala.UI.Confirm = Confirm;
    Hualala.UI.EmptyPlaceholder = EmptyPlaceholder;
    Hualala.UI.BreadCrumb = BreadCrumb;
    Hualala.UI.LoadingModal = LoadingModal;

    Hualala.UI.uploadImg = uploadImg;
    Hualala.UI.fileUpload = fileUpload;
    Hualala.UI.fillSelect = fillSelect;
    Hualala.UI.createChosen = createChosen;
    Hualala.UI.createSchemaChosen = createSchemaChosen;
    Hualala.UI.createEditor = createEditor;
    Hualala.UI.clearEditors = clearEditors;
    Hualala.UI.EditorList = [];


})(jQuery, window);

/*!
 * jQuery twitter bootstrap wizard plugin
 * Examples and documentation at: http://github.com/VinceG/twitter-bootstrap-wizard
 * version 1.0
 * Requires jQuery v1.3.2 or later
 * Supports Bootstrap 2.2.x, 2.3.x, 3.0
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Authors: Vadim Vincent Gabriel (http://vadimg.com), Jason Gill (www.gilluminate.com)
 */
;
(function($) {
    var bootstrapWizardCreate = function(element, options) {
        var element = $(element);
        var obj = this;

        // selector skips any 'li' elements that do not contain a child with a tab data-toggle
        var baseItemSelector = 'li:has([data-toggle="tab"])';
        var historyStack = [];

        // Merge options with defaults
        var $settings = $.extend({}, $.fn.bsWizard.defaults, options);
        var $activeTab = null;
        var $navigation = null;

        this.rebindClick = function(selector, fn) {
            selector.unbind('click', fn).bind('click', fn);
        }

        this.fixNavigationButtons = function() {
            // Get the current active tab
            if (!$activeTab.length) {
                // Select first one
                $navigation.find('a:first').tab('show');
                $activeTab = $navigation.find(baseItemSelector + ':first');
                return true;
            }

            // See if we're currently in the first/last then disable the previous and last buttons
            $($settings.previousSelector, element).toggleClass('disabled', (obj.firstIndex() >= obj.currentIndex()));
            $($settings.nextSelector, element).toggleClass('disabled', (obj.currentIndex() >= obj.navigationLength()));
            $($settings.nextSelector, element).toggleClass('hidden', (obj.currentIndex() >= obj.navigationLength() && $($settings.finishSelector, element).length > 0));
            $($settings.lastSelector, element).toggleClass('hidden', (obj.currentIndex() >= obj.navigationLength() && $($settings.finishSelector, element).length > 0));
            $($settings.finishSelector, element).toggleClass('hidden', (obj.currentIndex() < obj.navigationLength()));
            $($settings.backSelector, element).toggleClass('disabled', (historyStack.length == 0));
            $($settings.backSelector, element).toggleClass('hidden', (obj.currentIndex() >= obj.navigationLength() && $($settings.finishSelector, element).length > 0));

            // We are unbinding and rebinding to ensure single firing and no double-click errors
            obj.rebindClick($($settings.nextSelector, element), obj.next);
            obj.rebindClick($($settings.previousSelector, element), obj.previous);
            obj.rebindClick($($settings.lastSelector, element), obj.last);
            obj.rebindClick($($settings.firstSelector, element), obj.first);
            obj.rebindClick($($settings.finishSelector, element), obj.finish);
            obj.rebindClick($($settings.backSelector, element), obj.back);

            if ($settings.onTabShow && typeof $settings.onTabShow === 'function' && $settings.onTabShow($activeTab, $navigation, obj.currentIndex()) === false) {
                return false;
            }
        };

        this.next = function(e) {
            // If we clicked the last then dont activate this
            if (element.hasClass('last')) {
                return false;
            }

            if ($settings.onNext && typeof $settings.onNext === 'function' && $settings.onNext($activeTab, $navigation, obj.nextIndex()) === false) {
                return false;
            }

            var formerIndex = obj.currentIndex();
            $index = obj.nextIndex();

            // Did we click the last button
            if ($index > obj.navigationLength()) {} else {
                historyStack.push(formerIndex);
                $navigation.find(baseItemSelector + ':eq(' + $index + ') a').tab('show');
            }
        };

        this.previous = function(e) {
            // If we clicked the first then dont activate this
            if (element.hasClass('first')) {
                return false;
            }

            if ($settings.onPrevious && typeof $settings.onPrevious === 'function' && $settings.onPrevious($activeTab, $navigation, obj.previousIndex()) === false) {
                return false;
            }

            var formerIndex = obj.currentIndex();
            $index = obj.previousIndex();

            if ($index < 0) {} else {
                historyStack.push(formerIndex);
                $navigation.find(baseItemSelector + ':eq(' + $index + ') a').tab('show');
            }
        };

        this.first = function(e) {
            if ($settings.onFirst && typeof $settings.onFirst === 'function' && $settings.onFirst($activeTab, $navigation, obj.firstIndex()) === false) {
                return false;
            }

            // If the element is disabled then we won't do anything
            if (element.hasClass('disabled')) {
                return false;
            }

            historyStack.push(obj.currentIndex());
            $navigation.find(baseItemSelector + ':eq(0) a').tab('show');
        };

        this.last = function(e) {
            if ($settings.onLast && typeof $settings.onLast === 'function' && $settings.onLast($activeTab, $navigation, obj.lastIndex()) === false) {
                return false;
            }

            // If the element is disabled then we won't do anything
            if (element.hasClass('disabled')) {
                return false;
            }

            historyStack.push(obj.currentIndex());
            $navigation.find(baseItemSelector + ':eq(' + obj.navigationLength() + ') a').tab('show');
        };

        this.finish = function(e) {
            if ($settings.onFinish && typeof $settings.onFinish === 'function') {
                $settings.onFinish($activeTab, $navigation, obj.lastIndex());
            }
        };

        this.back = function() {
            if (historyStack.length == 0) {
                return null;
            }

            var formerIndex = historyStack.pop();
            if ($settings.onBack && typeof $settings.onBack === 'function' && $settings.onBack($activeTab, $navigation, formerIndex) === false) {
                historyStack.push(formerIndex);
                return false;
            }

            element.find(baseItemSelector + ':eq(' + formerIndex + ') a').tab('show');
        };

        this.currentIndex = function() {
            return $navigation.find(baseItemSelector).index($activeTab);
        };

        this.firstIndex = function() {
            return 0;
        };

        this.lastIndex = function() {
            return obj.navigationLength();
        };
        this.getIndex = function(e) {
            return $navigation.find(baseItemSelector).index(e);
        };
        this.nextIndex = function() {
            return $navigation.find(baseItemSelector).index($activeTab) + 1;
        };
        this.previousIndex = function() {
            return $navigation.find(baseItemSelector).index($activeTab) - 1;
        };
        this.navigationLength = function() {
            return $navigation.find(baseItemSelector).length - 1;
        };
        this.activeTab = function() {
            return $activeTab;
        };
        this.nextTab = function() {
            return $navigation.find(baseItemSelector + ':eq(' + (obj.currentIndex() + 1) + ')').length ? $navigation.find(baseItemSelector + ':eq(' + (obj.currentIndex() + 1) + ')') : null;
        };
        this.previousTab = function() {
            if (obj.currentIndex() <= 0) {
                return null;
            }
            return $navigation.find(baseItemSelector + ':eq(' + parseInt(obj.currentIndex() - 1) + ')');
        };
        this.show = function(index) {
            var tabToShow = isNaN(index) ?
                element.find(baseItemSelector + ' a[href=#' + index + ']') :
                element.find(baseItemSelector + ':eq(' + index + ') a');
            if (tabToShow.length > 0) {
                historyStack.push(obj.currentIndex());
                tabToShow.tab('show');
            }
        };
        this.disable = function(index) {
            $navigation.find(baseItemSelector + ':eq(' + index + ')').addClass('disabled');
        };
        this.enable = function(index) {
            $navigation.find(baseItemSelector + ':eq(' + index + ')').removeClass('disabled');
        };
        this.hide = function(index) {
            $navigation.find(baseItemSelector + ':eq(' + index + ')').hide();
        };
        this.display = function(index) {
            $navigation.find(baseItemSelector + ':eq(' + index + ')').show();
        };
        this.remove = function(args) {
            var $index = args[0];
            var $removeTabPane = typeof args[1] != 'undefined' ? args[1] : false;
            var $item = $navigation.find(baseItemSelector + ':eq(' + $index + ')');

            // Remove the tab pane first if needed
            if ($removeTabPane) {
                var $href = $item.find('a').attr('href');
                $($href).remove();
            }

            // Remove menu item
            $item.remove();
        };

        var innerTabClick = function(e) {
            // Get the index of the clicked tab
            var $ul = $navigation.find(baseItemSelector);
            var clickedIndex = $ul.index($(e.currentTarget).parent(baseItemSelector));
            var $clickedTab = $($ul[clickedIndex]);
            if ($settings.onTabClick && typeof $settings.onTabClick === 'function' && $settings.onTabClick($activeTab, $navigation, obj.currentIndex(), clickedIndex, $clickedTab) === false) {
                return false;
            }
        };

        var innerTabShown = function(e) { // use shown instead of show to help prevent double firing
            $element = $(e.target).parent();
            var nextTab = $navigation.find(baseItemSelector).index($element);

            // If it's disabled then do not change
            if ($element.hasClass('disabled')) {
                return false;
            }

            if ($settings.onTabChange && typeof $settings.onTabChange === 'function' && $settings.onTabChange($activeTab, $navigation, obj.currentIndex(), nextTab) === false) {
                return false;
            }

            $activeTab = $element; // activated tab
            obj.fixNavigationButtons();
        };

        this.resetWizard = function() {

            // remove the existing handlers
            $('a[data-toggle="tab"]', $navigation).off('click', innerTabClick);
            $('a[data-toggle="tab"]', $navigation).off('shown shown.bs.tab', innerTabShown);

            // reset elements based on current state of the DOM
            $navigation = element.find('ul:first', element);
            $activeTab = $navigation.find(baseItemSelector + '.active', element);

            // re-add handlers
            $('a[data-toggle="tab"]', $navigation).on('click', innerTabClick);
            $('a[data-toggle="tab"]', $navigation).on('shown shown.bs.tab', innerTabShown);

            obj.fixNavigationButtons();
        };

        $navigation = element.find('ul:first', element);
        $activeTab = $navigation.find(baseItemSelector + '.active', element);

        if (!$navigation.hasClass($settings.tabClass)) {
            $navigation.addClass($settings.tabClass);
        }

        // Load onInit
        if ($settings.onInit && typeof $settings.onInit === 'function') {
            $settings.onInit($activeTab, $navigation, 0);
        }

        // Load onShow
        if ($settings.onShow && typeof $settings.onShow === 'function') {
            $settings.onShow($activeTab, $navigation, obj.nextIndex());
        }

        $('a[data-toggle="tab"]', $navigation).on('click', innerTabClick);

        // attach to both shown and shown.bs.tab to support Bootstrap versions 2.3.2 and 3.0.0
        $('a[data-toggle="tab"]', $navigation).on('shown shown.bs.tab', innerTabShown);
    };
    $.fn.bsWizard = function(options) {
        //expose methods
        if (typeof options == 'string') {
            var args = Array.prototype.slice.call(arguments, 1)
            if (args.length === 1) {
                args.toString();
            }
            return this.data('bootstrapWizard')[options](args);
        }
        return this.each(function(index) {
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('bootstrapWizard')) return;
            // pass options to plugin constructor
            var wizard = new bootstrapWizardCreate(element, options);
            // Store plugin object in this element's data
            element.data('bootstrapWizard', wizard);
            // and then trigger initial change
            wizard.fixNavigationButtons();
        });
    };

    // expose options
    $.fn.bsWizard.defaults = {
        tabClass: 'nav nav-pills',
        nextSelector: '.wizard li.next',
        previousSelector: '.wizard li.previous',
        firstSelector: '.wizard li.first',
        lastSelector: '.wizard li.last',
        finishSelector: '.wizard li.finish',
        backSelector: '.wizard li.back',
        onShow: null,
        onInit: null,
        onNext: null,
        onPrevious: null,
        onLast: null,
        onFirst: null,
        onFinish: null,
        onBack: null,
        onTabChange: null,
        onTabClick: null,
        onTabShow: null
    };
})(jQuery);
