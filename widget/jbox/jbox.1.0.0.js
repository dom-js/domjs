/*!
 * Created by 深圳 kudy QQ:65005153
 * update By 克浩：yinkehao@me.com
 * 原程序由 深圳 kudy 开发，在 jbox 2.3 版本基础上进修修改。
 * 依赖 jQuery+requirejs ,i18n.js以及 css.js 两个插件(requirejs plugins)h
 * 目前版本是进行AMD模式改造的版面，改版本 通过 require(["jbox"])方式引入jbox。
 * 此jbox与页面内其他内容即jbox不冲突，不会污染全局环境，且与之前版本jbox无任何冲突。
 * css文件会自动引入， * 添加了i18n国际化支持（文本支持）
 * 解决在，某些文档模式下拖拽自动消失的bug
 * 支持iframe内在最外层弹出（一层嵌套）
 */
require.config({
    paths:{
        "widget/jbox/skins":"/domjs/widget/jbox/skins"
    }
})
define(["jquery","i18n!./nls/jbox"],function($,i18n,css){
    require(["css!/domjs/widget/jbox/skins/hikgray/jbox.css"])

    jBox = function(content, options) {
        if(top){
            top.require=top.require||require
            require(["css!top:/domjs/widget/jbox/skins/hikgray/jbox.css"]);
        }
        options = $.extend({},jBox.defaults, options);
        options.showFade = options.opacity > 0x0;
        options.isTip = options.isTip || false;
        options.isMessager = options.isMessager || false;
        if (content == undefined) {
            content = ''
        };
        if (options.border < 0x0) {
            options.border = 0x0
        };
        if (options.id == undefined) {
            options.id = 'jBox_' + Math.floor(Math.random() * 0xf4240)
        };
        //"Quicker Model 和IE7一下判断为IE6模式进行处理"
        var isIE6 = ($.browser.msie && parseInt($.browser.version) < 0x7)||document.compatMode=="BackCompat";
        var jpan = $('#' + options.id);
        if (jpan.length > 0x0) {
            options.zIndex = jBox.defaults.zIndex++;
            jpan.css({
                zIndex: options.zIndex
            });
            jpan.find('#jbox').css({
                zIndex: options.zIndex + 0x1
            });
            return jpan
        };
        var _contentObj = {
            url: '',
            type: '',
            html: '',
            isObject: content.constructor == Object
        };
        if (!_contentObj.isObject) {
            content = content + '';
            var _content = content.toLowerCase();
            if (_content.indexOf('id:') == 0x0) _contentObj.type = 'ID';
            else if (_content.indexOf('get:') == 0x0) _contentObj.type = 'GET';
            else if (_content.indexOf('post:') == 0x0) _contentObj.type = 'POST';
            else if (_content.indexOf('iframe:') == 0x0) _contentObj.type = 'IFRAME';
            else if (_content.indexOf('html:') == 0x0) _contentObj.type = 'HTML';
            else {
                content = 'html:' + content;
                _contentObj.type = 'HTML'
            };
            content = content.substring(content.indexOf(":") + 0x1, content.length)
        };
        if (!options.isTip && !options.isMessager && !options.showScrolling) {
            $($.browser.msie ? 'html': 'body').attr('style', 'overflow:hidden;padding-right:17px;')
        };
        var _isTip = !options.isTip && !(options.title == undefined);
        var _isRemote = _contentObj.type == 'GET' || _contentObj.type == 'POST' || _contentObj.type == 'IFRAME';
        var _width = typeof options.width == 'number' ? (options.width - 0x32) + 'px': "90%";
        var _arrHTML = [];
        _arrHTML.push('<div id="' + options.id + '" class="jbox-' + (options.isTip ? 'tip': (options.isMessager ? 'messager': 'body')) + '">');
        if (options.showFade) {
            if ((isIE6 && $('iframe').length > 0x0) || $('object, applet').length > 0x0) {
                _arrHTML.push('<iframe id="jbox-fade" class="jbox-fade" src="about:blank" style="display:block;position:absolute;z-index:-1;"></iframe>')
            } else {
                if (isIE6) {
                    $('select').css('visibility', 'hidden')
                };
                _arrHTML.push('<div id="jbox-fade" class="jbox-fade" style="position:absolute;"></div>')
            }
        };
        _arrHTML.push('<div id="jbox-temp" class="jbox-temp" style="width:0px;height:0px;background-color:"#ff3300";position:absolute;z-index:1984;fdisplay:none;"></div>');
        if (options.draggable) {
            _arrHTML.push('<div id="jbox-drag" class="jbox-drag" style="position:absolute;z-index:1984;display:none;"></div>')
        };
        _arrHTML.push('<div id="jbox" class="jbox" style="position:absolute;width:auto;height:auto;">');
        _arrHTML.push('<div class="jbox-help-title jbox-title-panel" style="height:25px;display:none;"></div>');
        _arrHTML.push('<div class="jbox-help-button jbox-button-panel" style="height:25px;padding:5px 0 5px 0;display:none;"></div>');
        _arrHTML.push('<table border="0" cellpadding="0" cellspacing="0" style="margin:0px;padding:0px;border:none;">');
        if (options.border > 0x0) {
            _arrHTML.push('<tr>');
            _arrHTML.push('<td class="jbox-border" style="margin:0px;padding:0px;border:none;border-radius:' + options.border + 'px 0 0 0;width:' + options.border + 'px;height:' + options.border + 'px;"></td>');
            _arrHTML.push('<td class="jbox-border" style="margin:0px;padding:0px;border:none;height:' + options.border + 'px;overflow: hidden;"></td>');
            _arrHTML.push('<td class="jbox-border" style="margin:0px;padding:0px;border:none;border-radius:0 ' + options.border + 'px 0 0;width:' + options.border + 'px;height:' + options.border + 'px;"></td>');
            _arrHTML.push('</tr>')
        };
        _arrHTML.push('<tr>');
        _arrHTML.push('<td class="jbox-border" style="margin:0px;padding:0px;border:none;"></td>');
        _arrHTML.push('<td valign="top" style="margin:0px;padding:0px;border:none;">');
        _arrHTML.push('<div class="jbox-container" style="width:auto; height:auto;">');
        _arrHTML.push('<a class="jbox-close" title="' + jBox.languageDefaults.close + '" onmouseover="$(this).addClass(\'jbox-close-hover\');" onmouseout="$(this).removeClass(\'jbox-close-hover\');" style="position:absolute; display:block; cursor:pointer; top:' + (0x6 + options.border) + 'px; right:' + (0x6 + options.border) + 'px; width:15px; height:15px;' + (options.showClose ? '': 'display:none;') + '"></a>');
        if (_isTip) {
            _arrHTML.push('<div class="jbox-title-panel" style="height:25px;">');
            _arrHTML.push('<div class="jbox-title' + (options.showIcon == true ? ' jbox-title-icon': (options.showIcon == false ? '': ' ' + options.showIcon)) + '" style="float:left; width:' + _width + '; line-height:' + ($.browser.msie ? 0x19: 0x18) + 'px; padding-left:' + (options.showIcon ? 0x12: 0x5) + 'px;overflow:hidden;text-overflow:ellipsis;word-break:break-all;">' + (options.title == '' ? '&nbsp;': options.title) + '</div>');
            _arrHTML.push('</div>')
        };
        _arrHTML.push('<div id="jbox-states"></div></div>');
        _arrHTML.push('</div>');
        _arrHTML.push('</td>');
        _arrHTML.push('<td class="jbox-border" style="margin:0px;padding:0px;border:none;"></td>');
        _arrHTML.push('</tr>');
        if (options.border > 0x0) {
            _arrHTML.push('<tr>');
            _arrHTML.push('<td class="jbox-border" style="margin:0px;padding:0px;border:none;border-radius:0 0 0 ' + options.border + 'px; width:' + options.border + 'px; height:' + options.border + 'px;"></td>');
            _arrHTML.push('<td class="jbox-border" style="margin:0px;padding:0px;border:none;height:' + options.border + 'px;overflow: hidden;"></td>');
            _arrHTML.push('<td class="jbox-border" style="margin:0px;padding:0px;border:none;border-radius:0 0 ' + options.border + 'px 0; width:' + options.border + 'px; height:' + options.border + 'px;"></td>');
            _arrHTML.push('</tr>')
        };
        _arrHTML.push('</table>');
        _arrHTML.push('</div>');
        _arrHTML.push('</div>');
        var _iframeHTML = '<iframe name="jbox-iframe" id="jbox-iframe" width="100%" height="100%" marginheight="0" marginwidth="0" frameborder="0" scrolling="' + options.iframeScrolling + '"></iframe>';
        var _jWindow = $(jBox.defaults.window);
        jBox.defaults.window.$=jBox.defaults.window.$||$;
        var _jBody = jBox.defaults.window.$(jBox.defaults.window.document.body);
        var _jBox = jBox.defaults.window.$(_arrHTML.join('')).appendTo(_jBody);

        var _jBoxBody = _jBox.children('#jbox');
        var _jBoxFade = _jBox.children('#jbox-fade');
        var _jBoxTemp = _jBox.children('#jbox-temp');
        if (!_contentObj.isObject) {
            switch (_contentObj.type) {
                case "ID":
                    _contentObj.html = $('#' + content).html();
                    break;
                case "GET":
                case "POST":
                    _contentObj.html = '';
                    _contentObj.url = content;
                    break;
                case "HTML":
                    _contentObj.html = content;
                    break;
                case "IFRAME":
                    _contentObj.html = _iframeHTML;
                    if (content.indexOf('#') == -0x1) {
                        _contentObj.url = content + (content.indexOf('?') == -0x1 ? '?___t': '&___t') + Math.random()
                    } else {
                        var _content = content.split('#');
                        _contentObj.url = _content[0x0] + (_content[0x0].indexOf('?') == -0x1 ? '?___t': '&___t') + Math.random() + '#' + _content[0x1]
                    };
                    break
            };
            content = {
                state0: {
                    content: _contentObj.html,
                    buttons: options.buttons,
                    buttonsFocus: options.buttonsFocus,
                    submit: options.submit
                }
            }
        };
        var _arrHTML = [];
        var _heightHelpTitle = _jBoxBody.find('.jbox-help-title').outerHeight(true);
        var _heightHelpButton = _jBoxBody.find('.jbox-help-button').outerHeight(true);
        var _styleBt = $.browser.msie ? 'line-height:19px;padding:0px 6px 0px 6px;': 'padding:0px 10px 0px 10px;';
        $.each(content,
            function(status, _statusOptions) {
                if (_contentObj.isObject) {
                    _statusOptions = $.extend({},
                        jBox.stateDefaults, _statusOptions)
                };
                content[status] = _statusOptions;
                if (_statusOptions.buttons == undefined) {
                    _statusOptions.buttons = {}
                };
                var _hasButton = false;
                $.each(_statusOptions.buttons,
                    function(_text, _value) {
                        _hasButton = true
                    });
                var _height = 'auto';
                if (typeof options.height == 'number') {
                    _height = options.height;
                    if (_isTip) {
                        _height = _height - _heightHelpTitle
                    };
                    if (_hasButton) {
                        _height = _height - _heightHelpButton
                    };
                    _height = (_height - 0x1) + 'px'
                };
                var _strHTMLLoading = '';
                var _heightLoadingImg = '25px';
                if (!_contentObj.isObject && _isRemote) {
                    var _heightContentLoading = options.height;
                    if (typeof options.height == 'number') {
                        if (_isTip) {
                            _heightContentLoading = _heightContentLoading - _heightHelpTitle
                        };
                        if (_hasButton) {
                            _heightContentLoading = _heightContentLoading - _heightHelpButton
                        };
                        _heightLoadingImg = ((_heightContentLoading / 0x5) * 0x2) + 'px';
                        _heightContentLoading = (_heightContentLoading - 0x1) + 'px'
                    };
                    _strHTMLLoading = ['<div id="jbox-content-loading" class="jbox-content-loading" style="min-height:70px;height:' + _heightContentLoading + '; text-align:center;">', '<div class="jbox-content-loading-image" style="display:block; margin:auto; width:220px; height:19px; padding-top: ' + _heightLoadingImg + ';"></div>', '</div>'].join('')
                };
                _arrHTML.push('<div id="jbox-state-' + status + '" class="jbox-state" style="display:none;">');
                _arrHTML.push('<div style="min-width:50px;width:' + (typeof options.width == 'number' ? options.width + 'px': 'auto') + '; height:' + _height + ';">' + _strHTMLLoading + '<div id="jbox-content" class="jbox-content" style="height:' + _height + ';overflow:hidden;overflow-y:auto;">' + _statusOptions.content + '</div></div>');
                _arrHTML.push('<div class="jbox-button-panel" style="height:25px;padding:5px 0 5px 0;text-align: right;' + (_hasButton ? '': 'display:none;') + '">');
                if (!options.isTip) {
                    _arrHTML.push('<span class="jbox-bottom-text" style="float:left;display:block;line-height:25px;"></span>')
                };
                $.each(_statusOptions.buttons,
                    function(_text, _value) {
                        _arrHTML.push('<button class="jbox-button" value="' + _value + '" style="' + _styleBt + '">' + _text + '</button>')
                    });
                _arrHTML.push('</div></div>')
            });
        _jBoxBody.find('#jbox-states').html(_arrHTML.join('')).children('.jbox-state:first').css('display', 'block');
        if (_isRemote) {
            var _content = _jBoxBody.find('#jbox-content').css({
                position: (isIE6) ? "absolute": "fixed",
                left: -0x2710
            })
        };
        $.each(content,
            function(status, _statusOptions) {
                var _statePane = _jBoxBody.find('#jbox-state-' + status);
                _statePane.children('.jbox-button-panel').children('button').click(function() {
                    var _jBoxContent = _statePane.find('#jbox-content');
                    var _val = _statusOptions.buttons[$(this).text()];
                    var _data = {};
                    $.each(_jBoxBody.find('#jbox-states :input').serializeArray(),
                        function(i, filed) {
                            if (_data[filed.name] === undefined) {
                                _data[filed.name] = filed.value
                            } else if (typeof _data[filed.name] == Array) {
                                _data[filed.name].push(filed.value)
                            } else {
                                _data[filed.name] = [_data[filed.name], filed.value]
                            }
                        });
                    var _submit = _statusOptions.submit(_val, _jBoxContent, _data);
                    if (_submit === undefined || _submit) {
                        _close()
                    }
                }).bind('mousedown',
                    function() {
                        $(this).addClass('jbox-button-active')
                    }).bind('mouseup',
                    function() {
                        $(this).removeClass('jbox-button-active')
                    }).bind('mouseover',
                    function() {
                        $(this).addClass('jbox-button-hover')
                    }).bind('mouseout',
                    function() {
                        $(this).removeClass('jbox-button-active').removeClass('jbox-button-hover')
                    });
                _statePane.find('.jbox-button-panel button:eq(' + _statusOptions.buttonsFocus + ')').addClass('jbox-button-focus')
            }
        );
        var _resetMsgPosition = function() {
            _jBox.css({
                top: _jWindow.scrollTop()
            });
            if (options.isMessager) {
                _jBoxBody.css({
                    position: (isIE6) ? "absolute": "fixed",
                    right: 0x1,
                    bottom: 0x1
                })
            }
        };
        var _getWinWidth = function() {
            var _width = _jWindow.width();
            return jBox.defaults.window.document.body.clientWidth < _width ? _width: jBox.defaults.window.document.body.clientWidth
        };
        var _getWinHeight = function() {
            var _height = _jWindow.height();
            return jBox.defaults.window.document.body.clientHeight < _height ? _height: jBox.defaults.window.document.body.clientHeight
        };
        var _persistentClose = function() {
            if (!options.showFade) {
                return
            };
            if (options.persistent) {
                var i = 0x0;
                _jBox.addClass('jbox-warning');
                var _Interval = setInterval(function() {
                        _jBox.toggleClass('jbox-warning');
                        if (i++>0x1) {
                            clearInterval(_Interval);
                            _jBox.removeClass('jbox-warning')
                        }
                    },
                    0x64)
            } else {
                _close()
            }
        };
        var _keyborderClose = function(e) {
            if (options.isTip || options.isMessager) {
                return false
            };
            var _keyCode = (jBox.defaults.window.event) ? event.keyCode: e.keyCode;
            if (_keyCode == 0x1b) {
                _close()
            };
            if (_keyCode == 0x9) {
                var _InputList = $(':input:enabled:visible', _jBox);
                var _esc = !e.shiftKey && e.target == _InputList[_InputList.length - 0x1];
                var _shiftEsc = e.shiftKey && e.target == _InputList[0x0];
                if (_esc || _shiftEsc) {
                    setTimeout(function() {
                            if (!_InputList) return;
                            var _panel = _InputList[_shiftEsc === true ? _InputList.length - 0x1: 0x0];
                            if (_panel) _panel.focus()
                        },
                        0xa);
                    return false
                }
            }
        };
        var _onResize = function() {
            if (options.showFade) {
                _jBoxFade.css({
                    position: "absolute",
                    height: options.isTip ? _getWinHeight() : _jWindow.height(),
                    width: isIE6 ? _jWindow.width() : "100%",
                    top: 0x0,
                    left: 0x0,
                    right: 0x0,
                    bottom: 0x0
                })
            }
        };
        var _initPosition = function() {
            if (options.isMessager) {
                _jBoxBody.css({
                    position: (isIE6) ? "absolute": "fixed",
                    right: 0x1,
                    bottom: 0x1
                })
            } else {
                _jBoxTemp.css({
                    position: (isIE6) ? "absolute": "fixed",
                    top: options.top
                });


                _jBoxBody.css({
                    position: "absolute",
                    top: _jBoxTemp.offset().top + (options.isTip ? _jWindow.scrollTop() : 0x0),
                    left: ((_jWindow.width() - _jBoxBody.outerWidth()) / 0x2)
                })
            };
            if ((options.showFade && !options.isTip) || (!options.showFade && !options.isTip && !options.isMessager)) {
                _jBox.css({
                    position: (isIE6) ? "absolute": "fixed",
                    height: options.showFade ? _jWindow.height() : 0x0,
                    width: "100%",
                    top: (isIE6) ? _jWindow.scrollTop() : 0x0,
                    left: 0x0,
                    right: 0x0,
                    bottom: 0x0
                })
            };
            _onResize()
        };
        var _onMouseDown = function() {
            options.zIndex = jBox.defaults.zIndex++;
            _jBox.css({
                zIndex: options.zIndex
            });
            _jBoxBody.css({
                zIndex: options.zIndex + 0x1
            })
        };
        var _initzIndex = function() {
            options.zIndex = jBox.defaults.zIndex++;
            _jBox.css({
                zIndex: options.zIndex
            });
            _jBoxBody.css({
                display: "none",
                zIndex: options.zIndex + 0x1
            });
            if (options.showFade) {
                _jBoxFade.css({
                    display: "none",
                    zIndex: options.zIndex,
                    opacity: options.opacity
                })
            }
        };
        var _onDrag = function(e) {
            var _positiondata = e.data;
            _positiondata.target.find('iframe').hide();
            if (options.dragClone) {
                _positiondata.target.prev().css({
                    left: _positiondata.target.css('left'),
                    top: _positiondata.target.css('top'),
                    marginLeft: -0x2,
                    marginTop: -0x2,
                    width: _positiondata.target.width() + 0x2,
                    height: _positiondata.target.height() + 0x2
                }).show()
            };
            return false
        };
        var _onMove = function(e) {
            var _startPosition = e.data;
            var _newLeft = _startPosition.startLeft + e.pageX - _startPosition.startX;
            var _newTop = _startPosition.startTop + e.pageY - _startPosition.startY;
            if (options.dragLimit) {
                var _clientTop = 0x1;

                var _clientButtom = $(jBox.defaults.window.document).height() - e.data.target.height() - 0x1;
                var _clientLeft = 0x1;
                var _clientRight = $(jBox.defaults.window.document).width() - e.data.target.width() - 0x1;
                if (_newTop < _clientTop) _newTop = _clientTop + (options.dragClone ? 0x2: 0x0);
                if (_newTop > _clientButtom) _newTop = _clientButtom - (options.dragClone ? 0x2: 0x0);
                if (_newLeft < _clientLeft) _newLeft = _clientLeft + (options.dragClone ? 0x2: 0x0);
                if (_newLeft > _clientRight) _newLeft = _clientRight - (options.dragClone ? 0x2: 0x0)
            };
            if (options.dragClone) {
                _startPosition.target.prev().css({
                    left: _newLeft,
                    top: _newTop
                })
            } else {
                _startPosition.target.css({
                    left: _newLeft,
                    top: _newTop
                })
            };
            return false
        };
        var _onDrop = function(e) {
            $(jBox.defaults.window.document).unbind('.draggable');
            if (options.dragClone) {
                var _target = e.data.target.prev().hide();
                e.data.target.css({
                    left: _target.css('left'),
                    top: _target.css('top')
                }).find('iframe').show()
            } else {
                e.data.target.find('iframe').show()
            };
            return false
        };
        var _onDragDrop = function(e) {
            var _position = e.data.target.position();
            var _data = {
                target: e.data.target,
                startX: e.pageX,
                startY: e.pageY,
                startLeft: _position.left,
                startTop: _position.top
            };
            $(jBox.defaults.window.document).bind('mousedown.draggable', _data, _onDrag).bind('mousemove.draggable', _data, _onMove).bind('mouseup.draggable', _data, _onDrop)
        };
        var _close = function() {
            if (!options.isTip && !options.isMessager)
            {
                if ($('.jbox-body').length == 0x1) {
                    $($.browser.msie ? 'html': 'body').removeAttr('style')
                };
                _onClose()
            }
            else
            {
                if (options.isTip)
                {
                    var tip = $(jBox.defaults.window.document.body).data('tip');
                    if (tip && tip.next == true)
                    {
                        _jBoxTemp.css('top', tip.options.top);
                        var _top = _jBoxTemp.offset().top + _jWindow.scrollTop();
                        if (_top == _jBoxBody.offset().top) {
                            _onClose()
                        } else {
                            _jBoxBody.find('#jbox-content').html(tip.options.content.substr(0x5)).end().css({
                                left: ((_jWindow.width() - _jBoxBody.outerWidth()) / 0x2)
                            }).animate({
                                    top: _top,
                                    opacity: 0.1
                                },
                                0x1f4, _onClose)
                        }
                    }
                    else
                    {
                        _jBoxBody.animate({
                                top: '-=200',
                                opacity: 0x0
                            },
                            0x1f4, _onClose)
                    }
                }
                else
                {
                    switch (options.showType) {
                        case 'slide':
                            _jBoxBody.slideUp(options.showSpeed, _onClose);
                            break;
                        case 'fade':
                            _jBoxBody.fadeOut(options.showSpeed, _onClose);
                            break;
                        case 'show':
                        default:
                            _jBoxBody.hide(options.showSpeed, _onClose);
                            break
                    }
                }
            }
        };
        var _onClose = function() {
            _jWindow.unbind('resize', _onResize);
            if (options.draggable && !options.isTip && !options.isMessager) {
                _jBoxBody.find('.jbox-title-panel').unbind('mousedown', _onDragDrop)
            };
            if (_contentObj.type != 'IFRAME') {
                _jBoxBody.find('#jbox-iframe').attr({
                    'src': 'about:blank'
                })
            };
            _jBoxBody.html('').remove();
            if (isIE6 && !options.isTip) {
                _jBody.unbind('scroll', _resetMsgPosition)
            };
            if (options.showFade) {
                _jBoxFade.fadeOut('fast',
                    function() {
                        _jBoxFade.unbind('click', _persistentClose).unbind('mousedown', _onMouseDown).html('').remove()
                    })
            };
            _jBox.unbind('keydown keypress', _keyborderClose).html('').remove();
            if (isIE6 && options.showFade) {
                $('select').css('visibility', 'visible')
            };
            if (typeof options.closed == 'function') {
                options.closed()
            }
        };
        var _onMsgClose = function() {
            if (options.timeout > 0x0) {
                _jBoxBody.data('autoClosing', window.setTimeout(_close, options.timeout));
                if (options.isMessager) {
                    _jBoxBody.hover(function() {
                            window.clearTimeout(_jBoxBody.data('autoClosing'))
                        },
                        function() {
                            _jBoxBody.data('autoClosing', window.setTimeout(_close, options.timeout))
                        })
                }
            }
        };
        var _onLoad = function() {
            if (typeof options.loaded == 'function') {
                options.loaded(_jBoxBody.find('.jbox-state:visible').find('.jbox-content'))
            }
        };
        if (!_contentObj.isObject) {
            switch (_contentObj.type) {
                case "GET":
                case "POST":
                    $.ajax({
                        type:
                            _contentObj.type,
                        url: _contentObj.url,
                        data: options.ajaxData == undefined ? {}: options.ajaxData,
                        dataType: 'html',
                        cache: false,
                        success: function(_content, O) {
                            _jBoxBody.find('#jbox-content').css({
                                position: "static"
                            }).html(_content).show().prev().hide();
                            _onLoad()
                        },
                        error: function() {
                            _jBoxBody.find('#jbox-content-loading').html('<div style="padding-top:50px;padding-bottom:50px;text-align:center;">Loading Error.</div>')
                        }
                    });
                    break;
                case "IFRAME":
                    _jBoxBody.find('#jbox-iframe').attr({
                        'src':
                            _contentObj.url
                    }).bind("load",
                        function(data) {
                            $(this).parent().css({
                                position: "static"
                            }).show().prev().hide();
                            _jBoxBody.find('#jbox-states .jbox-state:first .jbox-button-focus').focus();
                            _onLoad()
                        });
                    break;
                default:
                    _jBoxBody.find('#jbox-content').show();
                    break
            }
        };
        _initPosition();
        _initzIndex();
        if (isIE6 && !options.isTip) {
            _jWindow.scroll(_resetMsgPosition)
        };
        if (options.showFade) {
            _jBoxFade.click(_persistentClose)
        };
        _jWindow.resize(_onResize);
        _jBox.bind('keydown keypress', _keyborderClose);
        _jBoxBody.find('.jbox-close').click(_close);
        if (options.showFade) {
            _jBoxFade.fadeIn('fast')
        };
        var _animateType = 'show';
        if (options.showType == 'slide') {
            _animateType = 'slideDown'
        } else if (options.showType == 'fade') {
            _animateType = 'fadeIn'
        };
        if (options.isMessager) {
            _jBoxBody[_animateType](options.showSpeed, _onMsgClose)
        } else {
            var tip = $(jBox.defaults.window.document.body).data('tip');
            if (tip && tip.next == true) {
                $(jBox.defaults.window.document.body).data('tip', {
                    next: false,
                    options: {}
                });
                _jBoxBody.css('display', '')
            } else {
                if (!_contentObj.isObject && _isRemote) {
                    _jBoxBody[_animateType](options.showSpeed)
                } else {
                    _jBoxBody[_animateType](options.showSpeed, _onLoad);
                }
            }
        };
        if (!options.isTip) {
            _jBoxBody.find('.jbox-bottom-text').html(options.bottomText)
        } else {
            _jBoxBody.find('.jbox-container,.jbox-content').addClass('jbox-tip-color')
        };
        if (_contentObj.type != 'IFRAME') {
            _jBoxBody.find('#jbox-states .jbox-state:first .jbox-button-focus').focus()
        } else {
            _jBoxBody.focus()
        };
        if (!options.isMessager) {
            _onMsgClose()
        };
        _jBox.bind('mousedown', _onMouseDown);
        if (options.draggable && !options.isTip && !options.isMessager) {
            _jBoxBody.find('.jbox-title-panel').bind('mousedown', {
                    target: _jBoxBody
                },
                _onDragDrop).css('cursor', 'move')
        };
        return _jBox
    };
    jBox.version = 2.3;
    var buttons={};
    buttons[i18n["OK"]]='ok'
    jBox.defaults = {
        id: null,
        top: "15%",
        zIndex: 0x7c0,
        border: 0x0,
        opacity: 0.1,
        timeout: 0x0,
        showType: 'fade',
        showSpeed: 'fast',
        showIcon: true,
        showClose: true,
        draggable: true,
        dragLimit: true,
        dragClone: false,
        persistent: true,
        showScrolling: true,
        ajaxData: {},
        iframeScrolling: 'auto',
        title: 'jBox',
        width: 0x15e,
        height: 'auto',
        window: (top||window),
        bottomText: '',
        buttons: buttons,
        buttonsFocus: 0x0,
        loaded: function(data) {},
        submit: function(retval,jform, formdata) {
            return true
        },
        closed: function() {}
    };
    jBox.stateDefaults = {
        content: '',
        buttons: buttons,
        buttonsFocus: 0x0,
        submit: function(retval,jform, formdata) {
            return true
        }
    };
    jBox.tipDefaults = {
        content: '',
        icon: 'info',
        top: '40%',
        width: 'auto',
        height: 'auto',
        opacity: 0x0,
        timeout: 0xbb8,
        closed: function() {}
    };
    jBox.messagerDefaults = {
        content: '',
        title: 'jBox',
        icon: 'none',
        width: 0x15e,
        height: 'auto',
        timeout: 0xbb8,
        showType: 'slide',
        showSpeed: 0x258,
        border: 0x0,
        buttons: {},
        buttonsFocus: 0x0,
        loaded: function() {},
        submit: function(retval,jform, formdata) {
            return true
        },
        closed: function() {}
    };
    jBox.languageDefaults = {
        close:i18n["Close"],
        ok: i18n["OK"],
        yes: i18n["YES"],
        no:i18n["NO"],
        cancel: i18n["Cancel"]
    };
    jBox.setDefaults = function(configs) {
        jBox.defaults = $.extend({},
            jBox.defaults, configs.defaults);
        jBox.stateDefaults = $.extend({},
            jBox.stateDefaults, configs.stateDefaults);
        jBox.tipDefaults = $.extend({},
            jBox.tipDefaults, configs.tipDefaults);
        jBox.messagerDefaults = $.extend({},
            jBox.messagerDefaults, configs.messagerDefaults);
        jBox.languageDefaults = $.extend({},
            jBox.languageDefaults, configs.languageDefaults)
    };
    jBox.getBox = function() {
        return $('.jbox-body').eq($('.jbox-body').length - 0x1)
    };
    jBox.getIframe = function(jBoxId) {
        var box = (typeof jBoxId == 'string') ? $('#' + jBoxId) : jBox.getBox();
        return box.find('#jbox-iframe').get(0x0)
    };
    jBox.getContent = function() {
        return jBox.getState().find('.jbox-content').html()
    };
    jBox.setContent = function(content) {
        return jBox.getState().find('.jbox-content').html(content)
    };
    jBox.setContentWithDom = function(contentDom){
        return jBox.getState().find('.jbox-content').empty().append(contentDom)
    }
    jBox.getState = function(stateNmae) {
        if (stateNmae == undefined) {
            return jBox.getBox().find('.jbox-state:visible')
        } else {
            return jBox.getBox().find('#jbox-state-' + stateNmae)
        }
    } ;
    jBox.getStateName = function() {
        return jBox.getState().attr('id').replace('jbox-state-', '')
    };
    jBox.goToState = function(stateName, stateContent) {
        var boxlist = jBox.getBox();
        if (boxlist != undefined && boxlist != null) {
            var boxcurr;
            stateName = stateName || false;
            boxlist.find('.jbox-state').slideUp('fast');
            if (typeof stateName == 'string') {
                boxcurr = boxlist.find('#jbox-state-' + stateName)
            } else {
                boxcurr = stateName ? boxlist.find('.jbox-state:visible').next() : boxlist.find('.jbox-state:visible').prev()
            };
            boxcurr.slideDown(0x15e,
                function() {
                    jBox.defaults.window.setTimeout(function() {
                            boxcurr.find('.jbox-button-focus').focus();
                            if (stateContent != undefined) {
                                //boxcurr.find('.jbox-content').html(stateContent)

                                boxcurr.find('.jbox-content').empty().append(stateContent)
                            }
                        },
                        0x14)
                })
        }
    };
    jBox.nextState = function(stateContent) {
        jBox.goToState(true, stateContent)
    };
    jBox.prevState = function(stateContent) {
        jBox.goToState(false, stateContent)
    };
    jBox.close = function(token, cls) {
        token = token || false;
        cls = cls || 'body';
        if (typeof token == 'string') {
            $('#' + token).find('.jbox-close').click()
        } else {
            var jpan = $('.jbox-' + cls);
            if (token) {
                for (var i = 0x0, length = jpan.length; i < length; ++i) {
                    jpan.eq(i).find('.jbox-close').click()
                }
            } else {
                if (jpan.length > 0x0) {
                    jpan.eq(jpan.length - 0x1).find('.jbox-close').click()
                }
            }
        }
    };
    jBox.open = function(content, title, width, height, options) {
        var defaults = {
            content: content,
            title: title,
            width: width,
            height: height
        };
        options = $.extend({},
            defaults, options);
        options = $.extend({},
            jBox.defaults, options);
        jBox(options.content, options)
    };
    jBox.prompt = function(content, title, icon, options) {
        var defaults = {
            content: content,
            title: title,
            icon: icon,
            buttons: eval('({ "' + jBox.languageDefaults.ok + '": "ok" })')
        };
        options = $.extend({},
            defaults, options);
        options = $.extend({},
            jBox.defaults, options);
        if (options.border < 0x0) {
            options.border = 0x0
        };
        if (options.icon != 'info' && options.icon != 'warning' && options.icon != 'success' && options.icon != 'error' && options.icon != 'question') {
            padding = '';
            options.icon = 'none'
        };
        var top = options.title == undefined ? 0xa: 0x23;
        var height = options.icon == 'none' ? 'height:auto;': 'min-height:30px;' + (($.browser.msie && parseInt($.browser.version) < 0x7) ? 'height:auto !important;height:100%;_height:30px;': 'height:auto;');
        var arrHTML = [];
        arrHTML.push('html:');
        arrHTML.push('<div style="margin:10px;' + height + 'padding-left:' + (options.icon == 'none' ? 0x0: 0x28) + 'px;text-align:left;">');
        arrHTML.push('<span class="jbox-icon jbox-icon-' + options.icon + '" style="position:absolute; top:' + (top + options.border) + 'px;left:' + (0xa + options.border) + 'px; width:32px; height:32px;"></span>');
        arrHTML.push(options.content);
        arrHTML.push('</div>');
        options.content = arrHTML.join('');
        jBox(options.content, options)
    };
    jBox.alert = function(content, title, options) {
        jBox.prompt(content, title, 'none', options)
    };
    jBox.info = function(content, title, options) {
        jBox.prompt(content, title, 'info', options)
    };
    jBox.success = function(content, title, options) {
        jBox.prompt(content, title, 'success', options)
    };
    jBox.error = function(content,title, options) {
        jBox.prompt(content, title, 'error', options)
    };
    jBox.confirm = function(content, title, submit, options) {

        var defaults = {
            buttons: eval('({ "' + jBox.languageDefaults.ok + '": "ok", "' + jBox.languageDefaults.cancel + '": "cancel" })')
        };
        if (submit != undefined && typeof submit == 'function') {
            defaults.submit = submit
        } else {
            defaults.submit = function(retval, jform, formdata) {
                return true
            }
        };
        options = $.extend({},
            defaults, options);
        jBox.prompt(content, title, 'question', options)

    };
    jBox.warning = function(content, title, submit, options) {
        var defaults = {
            buttons: eval('({ "' + jBox.languageDefaults.yes + '": "yes", "' + jBox.languageDefaults.no + '": "no", "' + jBox.languageDefaults.cancel + '": "cancel" })')
        };
        if (submit != undefined && typeof submit == 'function') {
            defaults.submit = submit
        } else {
            defaults.submit = function(retval,jform, formdata) {
                return true
            }
        };
        options = $.extend({},
            defaults, options);
        jBox.prompt(content, title, 'warning', options)
    };
    jBox.tip = function(content, icon, options) {
        var defaults = {
            content: content,
            icon: icon,
            opacity: 0x0,
            border: 0x0,
            showClose: false,
            buttons: {},
            isTip: true
        };
        if (defaults.icon == 'loading') {
            defaults.timeout = 0x0;
            defaults.opacity = 0.1
        };
        options = $.extend({},
            defaults, options);
        options = $.extend({},
            jBox.tipDefaults, options);
        options = $.extend({},
            jBox.defaults, options);
        if (options.timeout < 0x0) {
            options.timeout = 0x0
        };
        if (options.border < 0x0) {
            options.border = 0x0
        };
        if (options.icon != 'info' && options.icon != 'warning' && options.icon != 'success' && options.icon != 'error' && options.icon != 'loading') {
            options.icon = 'info'
        };
        var arrHTML = [];
        arrHTML.push('html:');
        arrHTML.push('<div style="min-height:18px;height:auto;margin:10px;padding-left:30px;padding-top:0px;text-align:left;">');
        arrHTML.push('<span class="jbox-icon jbox-icon-' + options.icon + '" style="position:absolute;top:' + (0x4 + options.border) + 'px;left:' + (0x4 + options.border) + 'px; width:32px; height:32px;"></span>');
        arrHTML.push(options.content);
        arrHTML.push('</div>');
        options.content = arrHTML.join('');
        if ($('.jbox-tip').length > 0x0) {
            $(jBox.defaults.window.document.body).data('tip', {
                next: true,
                options: options
            });
            jBox.closeTip()
        };
        if (options.focusId != undefined) {
            $('#' + options.focusId).focus();
            top.$('#' + options.focusId).focus()
        };
        jBox(options.content, options)
    };
    jBox.closeTip = function() {
        jBox.close(false, 'tip')
    };
    jBox.messager = function(content, title, timeout, options) {
        jBox.closeMessager();
        var defaults = {
            content: content,
            title: title,
            timeout: (timeout == undefined ? jBox.messagerDefaults.timeout:timeout),
            opacity: 0x0,
            showClose: true,
            draggable: false,
            isMessager: true
        };
        options = $.extend({},
            defaults, options);
        options = $.extend({},
            jBox.messagerDefaults, options);
        var _options = $.extend({},
            jBox.defaults, {});
        _options.title = null;
        options = $.extend({},
            _options, options);
        if (options.border < 0x0) {
            options.border = 0x0
        };
        if (options.icon != 'info' && options.icon != 'warning' && options.icon != 'success' && options.icon != 'error' && options.icon != 'question') {
            padding = '';
            options.icon = 'none'
        };
        var _top = options.title == undefined ? 0xa: 0x23;
        var _height = options.icon == 'none' ? 'height:auto;': 'min-height:30px;' + (($.browser.msie && parseInt($.browser.version) < 0x7) ? 'height:auto !important;height:100%;_height:30px;': 'height:auto;');
        var _arrHtml = [];
        _arrHtml.push('html:');
        _arrHtml.push('<div style="margin:10px;' + _height + 'padding-left:' + (options.icon == 'none' ? 0x0: 0x28) + 'px;text-align:left;">');
        _arrHtml.push('<span class="jbox-icon jbox-icon-' + options.icon + '" style="position:absolute; top:' + (_top + options.border) + 'px;left:' + (0xa + options.border) + 'px; width:32px; height:32px;"></span>');
        _arrHtml.push(options.content);
        _arrHtml.push('</div>');
        options.content = _arrHtml.join('');
        jBox(options.content, options)
    };
    jBox.closeMessager = function() {
        jBox.close(false, 'messager')
    } ;
        return jBox;
})