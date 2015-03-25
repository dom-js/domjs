define( [ "jquery","base/objectj","widget/jbox","docinfo","base/util" ], function($,obj,jbox,docinfo,util) {

    var V = function(doc) {
        this.doc = doc||$("form")
    }
    V.prototype = {
        validate:function(doc){
            //if(doc) this.doc=doc
            doc = doc||this.doc;
            var _self =this;
           return util.trigger("form","beforevalidate",[_self.doc]).pipe(function(flag){
                if(flag){
                    //验证前处理完成后，执行代码
                    if(_self._validate(doc)){
                        return util.trigger("form","aftervalidate",[_self.doc])
                    }else{
                        return false
                    }
                }else{
                    return false
                }
            })
        },
        _validate : function(valibody) {

            var isValidate = false;
            /**
             * 查找所有具有需要验证的字段
             */
            var me = this;

            valibody.find(":input[dataValidate],:input[data-validate]").each(
                function(i, el) {

                    if ($(el).attr("disabled")) {
                        return true;
                    }
                    switch ($(el).attr('dataValidate')
                        || $(el).attr('data-validate')) {
                        case 'false':
                            return true;
                            break;
                        case 'reg':
                            isValidate = me.vregexp(el)
                            return isValidate;
                            break;
                        case 'fun':

                            isValidate = me.vfun(el)
                            return isValidate;
                            break;
                        case 'true':
                        default:
                            isValidate = me.vnomal(el)
                            return isValidate;
                            break;
                    }
                })

            return isValidate;
        },
        vnomal : function(el) {
            var isValidate = true;
            switch ($(el).attr('dataType') || $(el).attr('data-type')) {
                case "attachment":
                    type = $(el).attr('dataType') || $(el).attr('data-type');
                    break;
                case "table":
                    type = "table";
                    break;
                default:
                    type = $(el).attr('type');
            }

            switch (type) {
                case "radio":
                    var radio = $("[name='" + el.name + "']", this.doc);
                    var isChecked = false

                    radio.each( function(i, e) {
                        if (e.checked)
                            isChecked = true;

                    });
                    if (!isChecked) {
                        this.showError(el, false)
                    }
                    isValidate = isChecked;
                    break;
                case "checkbox":
                    var els = $("[name='" + el.name + "']", this.doc);
                    var checkedCount = 0;
                    var miniCount = $(el).attr("data-miniselect") || 1;

                    els.each( function(i, e) {
                        if (e.checked)
                            checkedCount++
                    });
                    if (checkedCount < miniCount) {
                        this.showError(el, false)
                        isValidate = false;
                    }
                    break;
                case "select-one":
                    if (el.options[el.selectedIndex].value == "") {
                        this.showError(el, true)
                        isValidate = false;
                    }
                    break;
                case "attachment":
                    var attachment = $(el).data("this")
                    if(!attachment.validate()){
                        attachment.button.attr(	'data-ErrMsg',
                            $(el).attr("dataErrMsg")
                                || $(el).attr('data-errmsg'))
                        this.showError(attachment.button)
                        isValidate = false;
                    }

                    break;
                    if ($(el).attr("tagname") != "ATTACHMENT" && el.name
                        && $.attachmentPanel(el.name).text() == "") {
                        var bt = $.attachmentButton($(el).attr('name')).attr(
                            'data-ErrMsg',
                            $(el).attr("dataErrMsg")
                                || $(el).attr('data-errmsg'))

                        this.showError(bt)
                        // bt.click();
                        isValidate = false;
                    }
                    break;
                case "table":
                    isValidate = $.data(el, "table").validate();
                    if(!isValidate){
                        this.showError($.data(el, "table").valierrel)
                    }
                    break;
                case "textarea":
                case "text":
                default:
                    if ($(el).val().replace(/\s/gi, "") == "") {
                        this.showError(el)
                        isValidate = false;
                    } else {
                        $(el).css( {
                            "border-color" : $(el).attr("data-NBC")
                        })

                    }

            }
            return isValidate;

        },
        /**
         * 函数验证（内置函数）
         *
         * @param el
         * @return
         */
        vfun : function(el) {

            /**
             * 内置函数 field 等于 value 为 flag（true/false）
             *
             * @param field，验证域
             * @param value,
             *            域域进行比较的值
             * @param flag,
             *            true/false 比较
             * @return
             */
            var valiradiofield = function(field, value, flag) {
                var f = flag == undefined ? true : flag;

                return f ? $("[name=" + field + "]:checked").val() == value
                    : $("[name=" + field + "]:checked").val() != value

            }
            var valifield = function(field, value) {
                return $("[name=" + field + "]").val() == value

            }

            var isValidate = eval($(el).attr('data-valifun') || "false");

            if (isValidate) {
                return this.vnomal(el)
            }else {
                return true
            }

        },
        /**
         * 正则类校验
         */
        vregexp : function(el) {
            var isValidate = true;
            var reg = new RegExp("");
            var _strReg = $(el).attr("dataRegExp") || $(el).attr("data-regexp")
            switch (_strReg) {
                case "currency":
                    reg = /^(-?\d+)(\.?\d+|\d*)$|^\s*$/
                    break;
                case "requirecurrency":
                    reg = /^(-?\d+)(\.?\d+|\d*)$/
                    break;
                default:
                    reg = new RegExp(_strReg);
            }
            reg.compile(reg)
            // alert(reg.test($(el).val().replace(/\s*/, "")))
            isValidate = reg.test($(el).val())
            if (!isValidate) {
                this.showError(el, false)
            }
            return isValidate;
        },
        /**
         * 错误显示
         *
         * @param el：错误校对对象
         * @param flag：错误标识
         * @return
         */
        showError : function(el, flag) {
            var changestyle = flag == false ? false : true
            // if ($(el).attr('dataValidated') != "true") {
            var errMsg = "域验证失败"
            if ($(el).attr('dataErrMsg') || $(el).attr('data-errmsg'))
                errMsg = ($(el).attr('dataErrMsg') || $(el).attr('data-errmsg'));

            if(docinfo.langpack!="")
                require(["di18n!"+docinfo.langpack],function(i18n){

                    if(i18n&&i18n[errMsg]){

                        errMsg = i18n[errMsg]
                    }
                    jbox.tip(errMsg, 'warning', {
                        focusId : el.id
                    })
                })
            else
                jbox.tip(errMsg, 'warning', {
                    focusId : el.id
                })

                ;
            if (!$(el).attr("data-NBC"))
                $(el).attr("data-NBC", $(el).css("border-color"))
            // }

            if (changestyle){
                $(el).addClass("control-group")
                $(el).addClass("error")
                $(el).css( {
                    "border-color" : "red"
                })
            }


            $(el).bind('blur', function() {
                $(el).attr('dataValidated', "true")
                // vnomal(this);
            })
            try {
                el.focus();
            } catch (e) {
            }

        }

    }
    return V
})