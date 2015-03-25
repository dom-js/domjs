var require = (function(){return require;})();
require(["jquery", "base/util", "widget/jbox", "appinfo", "docinfo",
    "form/form", "m!widget/levelselect:1.3.0", "store/viewstore",
    "i18n!nls/system", "app/util"], function($, util, jbox, appinfo,
                                             docinfo, form, levelselect, Store, i18n, apputil) {



    var setReadonlyIfFromCRM = function() {
        var optyId = $("[name=optyId]").val();
        if (optyId != "") {
            $("[name=s1_ssbm]").attr("disabled", true);
            $("[name=s1_zt]").attr("readonly", "readonly");
            $("[name=s1_xmqkms]").attr("readonly", "readonly");
            $("[name=s1_yjxse]").attr("readonly", "readonly");
        }
    };
    // 若是CRM新建的定制单则设置一些信息为只读
    setReadonlyIfFromCRM();

    if(docinfo.isdocbeingedited && docinfo.handlesec=="sec1"){
        require(["app/customerOperation"]);
    }
    (function() {
        var deptval = $("[name=s1_ssbm]").val();
        if(deptval&&deptval!=""){
            require(["app/apply/01/dpselect"],function(sel){
                sel.select(deptval);
            });
        }
        var show=function(){
            require(["app/apply/01/dpselect"],function(sel){
                sel.show();
            });
        };
        var key = "cls_" + util.uid();
        $("[name=s1_ssbm]").each(function(i,el){
            var $el = $(el);
            var width = $el.width();

            $el.wrap("<span  class='input-append "+key+"' style='width:"+(width==0?"auto":(width+"px;"))+"'></span>");
            $el.after("<button type=button class=btn><i class=icon-list></i></button>");
        }).on("dblclick",function(){
                show();
            });
        $("body").on("click","."+key+" button ",function(){
            show();
        });
    })();


    (function(){

        var show=function(){
            require(["app/apply/01/plselect"],function(sel){
                sel.show();
            });
        };
        var key = "cls_" + util.uid();
        $("[name=s1_cpx],[name=s1_cpxl]").each(function(i,el){
            var $el = $(el);
            var width = $el.width();
            $el.wrap("<span  class='input-append "+key+"' style='width:"+(width==0?"auto":(width+"px;"))+"'></span>");
            $el.after("<button type=button class=btn><i class=icon-list></i></button>");
        }).on("dblclick",function(){
                show();
            });
        $("body").on("click","."+key+" button ",function(){
            show();
        });
    })();
    ( function() {
        var store = new Store({
            host : "rd.xxx.com.cn",
            db : "/xxx/rdweb/RDProduct.nsf",
            view : "(hvwProductByParent)",
            idProperty : "deptpath",
            count : "1000"
        });
        var sel = levelselect("[name=s1_cpxh_1]", {
            store : store,
            root : "root",
            //valueitems:valuelist,
            rootlabel : "",
            height : 300,
            width : 600,
            label : "proname",
            multi : true,
            showcols : 3,
            leveldepth : 3,
            selectcate : false,
            valuefield : "proname",
            valuesplit : ";",
            pathsplit : "\\",
            selectend : false
        });

        sel.on("click", function() {
            sel.showDialog()
        });

    })();



    var EmptyZYBOM = function() {
        var dom = $("input[name=s1_zybom]:last")
        var dom2 = $("#s1_zybom_tmphiddeninput")
        if (dom2.length == 0) {
            dom2 = dom.clone();
            dom.after(dom2)
            dom2.val("");
            dom2.attr("id", "s1_zybom_tmphiddeninput");
            dom2.hide();
            dom2.removeAttr("disabled")
        }
        dom2.click();
    };
    ( function() {
        var domCpxl = $("[name=s1_cpxl]")
        /**
         * 2013-8-21 按业务逻辑分离代码——处理非资源产品线与资源产品线差异
         */
        var computerZYCP = function() {
            var isZycp = $("[name=zycp]").val() == "1"

            if (isZycp) {
                //资源产品线显示显示老的型号选择，隐藏新物料代码的产品型号选择方式，
                $(".clSec1notZYcphx").parent().hide();
                $(".clSec1nZYcphx").parent().show();
            } else {
                $("[name=s1_cpxh]").val("");
                $("[name=s1_cpxhnew]").val("");
                $(".clSec1notZYcphx").parent().show();
                $(".clSec1nZYcphx").parent().hide();
            }

        }

        var computerXQLX = function() {
            var xqlxDom = $("input[name=s1_dzxqlx]"), isZycp = $(
                "[name=zycp]").val() == "1";
            if (isZycp) {

                //资源产品，是否专用BOM属性无
                // 2013-8-28
                // domino环境下，如果直接禁用radio或者取消选择，则无法修改原始值。此处通过此法添加一个空值，从而实现对原始值的删除操作

                EmptyZYBOM();
                $(".clsec1zybom").parent().hide();

                xqlxDom.each( function(i, el) {
                    if (el.value == "软件") {
                        if (!el.checked) {
                            el.click()
                        }
                    } else {
                        if (el.checked) {
                            el.click()
                        }
                        el.disabled = true
                    }
                })
            } else {
                $(".clsec1zybom").parent().show();
                var sellist = [];// 选择的项目
                xqlxDom.each( function(i, el) {
                    if (el.disabled) {
                        el.disabled = false
                    }
                });
            }

        }

        $( function() {
            //页面加载完成自动计算
            computerZYCP();
            // 页面加载字段计算
            computerXQLX();
        });
        domCpxl.on("selected", function(e, sel, items) {
            //获取产品线-
            try {
                var item = sel.focusItemQueue[0].data("item");
                $("[name=zycp]").val(item.zycp);
                // 根据自愿/非自愿产品进行隐藏等控制
                computerZYCP()
                // 更新需求类型、是否专用bom等控制
                computerXQLX()
            } catch (e) {
                jbox.alert("产品线获取失败，请重新选择产品线、产品系列")
            }

        });
    })();

    ( function() {
        /**
         *  需求 RDSL20130819_10
         *  此函数选择需求领域时执行
         *  1.资源产品，无需显示是否专用BOM，且将值置空
         *  1.1资源产品只能选择软件
         *  2.非资源产品，显示是否专用BOM
         *  2.1 如果选择软件、说明书、结构时，是否专用BOM可选，其他情况是否专用BOM为是，不可编辑
         */
        var s1_zybomOrgVal
        var computerZYBOM = function() {
            //判断是否非资源产品，如果自愿产品，则只能选择，软件、
            var isZycp = $("[name=zycp]").val() == "1";

            if (!isZycp) {
                appinfo.dicLookUp("APP01_SCOPE_SPECIALBOM_CONDITION","values_1").then(function(res){
                    var tslxlist =res.APP01_SCOPE_SPECIALBOM_CONDITION, domXQLX = $("input[name=s1_dzxqlx]"), domZYBom = $("input[name=s1_zybom]");
                    var sellist = [];// 选择的项目
                    domXQLX.each( function(i, el) {
                        if (el.checked)
                            sellist.push(el.value);
                    })
                    // 选择的项目不在特殊项目列表内的（补集）
                    var noinTslx = $.grep(sellist, function(v) {
                        return $.inArray(v, tslxlist) == -1;
                    });
                    // 如果存在选择类型不在特殊类型内的需求，则专用bom必为是，禁用否
                    if (noinTslx.length > 0) {
                        domZYBom.filter("[value='是']").attr("checked", true)
                        domZYBom.filter("[value='否']").attr("disabled", true)
                    } else {
                        //如果存在原始值，则恢复原始值，无原始值，则清空 2013-8-28
                        if (s1_zybomOrgVal == undefined) {
                            domZYBom.filter("[value=是]").removeAttr("checked")
                        } else {
                            domZYBom.filter("[value=" + s1_zybomOrgVal + "]")
                                .attr("checked", true)
                        }
                        domZYBom.filter("[value='否']").removeAttr("disabled")
                    }
                });
            }

        };
        $( function() {
            s1_zybomOrgVal = $("input[name=s1_zybom]:checked").val()

            computerZYBOM();
        });

        $("input[name=s1_dzxqlx]").on("click",function() {
            //计算专用BOM
            computerZYBOM()
            var _self = this;
            var _cpx = $("[name=s1_cpx]").val();
            var _dzrjlx = $("[name=dzrjlx]").val();
            var olist2 = obj("s1_id2");

            $(
                "[name=hasRj],[name=hasYj],[name=hasJg],[name=hasBz],[name=hasSms],[name=hasGp],[name=hasBq]")
                .val("");
            var cb = document.getElementsByName("s1_dzxqlx");
            var cb1 = document.getElementsByName("s1_ccxh");
            var sec1s1_id8 = obj("s1_id8");
            document.getElementById("s1_id5").style.display = "none";
            document.getElementById("s1_id6").style.display = "none";
            document.getElementById("s1_id7").style.display = "none";
            for ( var i = 0, l = sec1s1_id8.length; i < l; i++) {
                sec1s1_id8[i].style.display = "none";
            }
            for ( var i = 0, l = olist2.length; i < l; i++) {
                olist2[i].style.display = "none";
            }

            if (cb[1].checked || cb[3].checked
                || cb[2].checked) {
                $(".clsec1other").parent().show()
            } else {
                $(".clsec1other").parent().hide()
            }
            if (cb[0].checked) {

                $("[name=hasRj]").val("1");
                $(".clsec1rj").parent().show();
                if (_cpx == "DVR/DVS" || _cpx == "NVR") {
                    document.getElementById("s1_id5").style.display = "";
                    if (cb1[3].checked) {
                        document.getElementById("s1_id6").style.display = "none";
                        document.getElementById("s1_id7").style.display = "";
                        if (val("s1_logolx2") == "定制") {
                            for ( var i = 0, l = sec1s1_id8.length; i < l; i++) {
                                sec1s1_id8[i].style.display = "";
                            }
                        }
                    } else {
                        document.getElementById("s1_id6").style.display = "";
                        document.getElementById("s1_id7").style.display = "none";
                    }
                }

                if (_dzrjlx == "1") {
                    for ( var i = 0, l = olist2.length; i < l; i++) {
                        olist2[i].style.display = "";
                    }
                }

            } else {
                $(".clsec1rj").parent().hide();
            }
            if (cb[1].checked) {
                $("[name=hasYj]").val("1");
                $(".clsec1yj").parent().show();
            } else {
                $(".clsec1yj").parent().hide();
            }
            if (cb[2].checked) {
                $("[name=hasJg]").val("1");
                $(".clsec1jg").parent().show();
            } else {
                $(".clsec1jg").parent().hide();
            }
            if (cb[3].checked) {
                $("[name=hasBz]").val("1");
                $(".clsec1bz").parent().show();
            } else {
                $(".clsec1bz").parent().hide();
            }
            if (cb[4].checked) {
                $("[name=hasSms]").val("1");
                $(".clsec1sms").parent().show();
            } else {
                $(".clsec1sms").parent().hide();
            }
            if (cb[5].checked) {
                $("[name=hasGp]").val("1");
                $(".clsec1gp").parent().show();
            } else {
                $(".clsec1gp").parent().hide();
            }
            if (cb[6].checked) {
                $("[name=hasBq]").val("1");
                $(".clsec1bq").parent().show();
            } else {
                $(".clsec1bq").parent().hide();
            }

        });
    })();

    // 产品型号选择
    /***********************************************************************
     * 客户打样内容列表控制 需求：RDSL20130701_07
     */
    ( function() {
        //读取配置信息，并转换为map映射
        var map = apputil.dicLookUp("APP01_SCOPE_PROOFING_MAPS",
                ["values_1", "values_2"]).pipe( function(res) {
                var obj = {}
                for ( var i = 0; i < res.values_1.length; i++) {
                    obj[res.values_1[i]] = res.values_2[i]
                }
                return obj
            });
        // 循环处理映射，如果映射存在，则根据选择结果对打样内容进行选择控制
        map.then( function(obj) {
            for (key in obj) {
                var reqScopeDom = $("input[name=s1_dzxqlx][value="
                    + key + "]")
                var proofingContentdom = $("input[name=s1_ProofingContent][value="
                    + obj[key] + "]");

                if (reqScopeDom.length > 0
                    && !reqScopeDom.attr("checked")) {
                    proofingContentdom.attr("checked", false)
                    proofingContentdom.attr("disabled", true)
                } else {
                    proofingContentdom.removeAttr("disabled")
                }
                //同步为reqScopeDom添加事件，控制动态选择
                reqScopeDom.on("click",function() {
                    var proofingContentdom = $("input[name=s1_ProofingContent][value="
                        + obj[this.value] + "]");
                    if (this.checked) {
                        proofingContentdom
                            .removeAttr("disabled")
                    } else {
                        proofingContentdom.attr(
                            "checked", false)
                        proofingContentdom.attr(
                            "disabled", true)
                    }
                })
            }
        });
    })();
    /**
     * 需求RDSL20130625_03 1.定制升级/定制拷贝时，将E3/E4状态物料过滤掉
     */
    if (docinfo.sjtype != "")
        ( function() {
            $("[name=s1_cpxhTable]").on("update",function(e, table, data) {

                var removelist = []
                // 初步过滤数据
                $.each(data, function(i, item) {
                    if (item.s1_cpxhzt == "E3"
                        || item.s1_cpxhzt == "E4")
                        removelist.push(i)
                })
                removelist.reverse()
                $.each(removelist, function(_, index) {
                    data.splice(index, 1)
                })
                var defs = []

                var wldm = $.map(data, function(item) {
                    defs.push(new $.Deferred());
                    return item.s1_cpxhwldm
                })
                // 当前数据再次远程服务器获取，并进行过滤
                if (wldm.length > 0) {
                    //利用viewSelect组件的getValueData获取物料代码对应的记录
                    $("body").on("ready","[data-name=s1_cpxhwldm]",
                        function(e, viewsel) {
                            var tr = $($(this).tmplItem().nodes[0]);
                            var rowindex = tr.data("rowIndex")
                            viewsel.getValueData().pipe(function(items) {
                                if (items[0]) {
                                    var zt = items[0].wlyjzt
                                    if (defs[rowindex])
                                        defs[rowindex]
                                            .resolve(zt == "E3"
                                                || zt == "E4")
                                } else {
                                    //如果搜索无结果，依然进行过滤
                                    defs[rowindex]
                                        .resolve(true);
                                }

                            })
                        })
                    $.when.apply($, defs).then( function() {
                        var l = arguments.length
                        for ( var i = l; i >= 0; i--) {

                            if (arguments[i])
                                table.deleteRow(i)
                        }
                    })
                }
            });

            if(docinfo.isnewdoc){
                var flag=false
                $("[name=s1_cpxhTable]").on("updateed",function(e,table){
                    if(flag)return false;
                    flag = true
                    var docid = $("[name=ydzdocid]").val()
                    appinfo.getdoc(docid).pipe(function(doc){
                        var fields = "s1_cpxhTable_uid,nu1_serialno,s1_cpxhwldm,s1_tbcpxl,s1_cpxhwl,s1_cpxhzt,s1_cpxhwlms,s1_cpxhkhzydm,s1_cpxhkh,s1_cpxhxt".split(/,/)
                        var i = 1,fieldIndex="s1_cpxhwldm_"+i;
                        var items=[]
                        while (doc[fieldIndex]){
                            var item={}
                            items.push(item)
                            for(var j=0;j<fields.length;j++)
                                item[fields[j]]=doc[fields[j]+"_"+i]
                            fieldIndex="s1_cpxhwldm_"+(++i);
                        }
                        return items
                    }).then(function(items){
                            table.update(items)
                        });

                })

            }
        })();
    /**
     * 定制单提交前表单校验前综合事件控制2014-2-10 需求处理调整
     */
    !function(){

        /**
         * isNew前历史版本校验处理
         */

        $("form").on("beforevalidate", function(e) {
            if ($('[name=isnew]').val() != "1") {
                $('[name=s1_cpxh]').attr("data-validate", true);
                $('[data-name=s1_cpxhwldm]').attr("data-validate", false);
                $('[data-name=s1_cpxhkhzydm]').attr("data-validate", false);
                $('[data-name=s1_cpxhkh]').attr("data-validate", false);
            }
        });
        /**
         * isNew版本校验兼容
         */
        $("form").on("beforevalidate",function(e){
            if ($('[name=isnew]').val() != "1") {
                return true
            }

            if ($('[name=zycp]').val() == '1') {
                $('[name=s1_cpxh]').attr("data-validate",true);
                $('[data-name=s1_cpxhwldm]').attr("data-validate", false);
                $('[data-name=s1_cpxhkhzydm]').attr("data-validate", false);
                $('[data-name=s1_cpxhkh]').attr("data-validate", false);
            } else {
                $('[name=s1_cpxh]').attr("data-validate",false);
                $('[data-name=s1_cpxhwldm]').attr("data-validate",true);

                switch ($('select[name=s1_dzlx]').val()){
                    case "已有产品配置，更新原BOM":
                        $('[data-name=s1_cpxhkhzydm]').attr("data-validate",true);
                        $('[data-name=s1_cpxhkh]').attr("data-validate",true);
                        break;
                    case "已有定制，更新原BOM":
                        // 独立控制事件处理
                        break;
                    default :
                        $('[data-name=s1_cpxhkhzydm]').attr("data-validate",false);
                        $('[data-name=s1_cpxhkh]').attr("data-validate",false);
                }
            }
        });
        /**
         * 已有定制，更新原专用型号需要进行异步查询进行判断，独立给单独的事件模块处理
         */
        $("form").on("beforevalidate",function(e){

            if ($('[name=isnew]').val() != "1") {
                return true
            }
            if($('select[name=s1_dzlx]').val()!="已有定制，更新原BOM"){
                return true
            }
            var fs = "";
            var res =appinfo.getdoc($("[name=ydzdocid]").val()).pipe(function(doc){

                if(doc.s1_zybom=="否"){
                    $('[data-name=s1_cpxhkhzydm]').attr("data-validate",false);
                    $('[data-name=s1_cpxhkh]').attr("data-validate",false);
                }else{
                    $('[data-name=s1_cpxhkhzydm]').attr("data-validate",true);
                    $('[data-name=s1_cpxhkh]').attr("data-validate",true);
                }
                return true;
            })
            e.results.push(res);
        })

    }();

    $("form").on("beforevalidate",
        function(e) {

            /**
             * 需求RDSL20130712_08 选择后将所有产品线写入一个字段
             */
            ( function() {
                var vals = $.map(
                    $("input[data-name=s1_tbcpxl]"),
                    function(el) {
                        return el.value;
                    })
                $("[name=s1_cpxlAll]").val(vals)
            })();
        });

    $("form")
        .on(
        "aftervalidate",
        function(e) {

            if (form.options.action == "submit"
                && val("isnew") == "1") {
                var rows = $.data($("[name=s1_cpxhTable]")[0],
                    "table").rows.length;

                if (rows == 0) {
                    jbox.alert("产品型号不能为空！");
                    return false;
                }
                var wldm,wldmall = "", jywldm = "", msg1 = "", wldmall2 = "";
                for ( var i = 0; i < rows; i++) {
                    wldm = $(
                        "#tabS1 input[data-name=s1_cpxhwl]:eq("
                            + i + ")").val();
                    wldm1 = $(
                        "#tabS1 input[data-name=s1_cpxhwldm]:eq("
                            + i + ")").val();
                    wldm2 = $(
                        "#tabS1 input[data-name=s1_cpxhxt]:eq("
                            + i + ")").val();
                    if (trim(wldm) != "") {
                        if (wldmall == "") {
                            wldmall = wldm;
                        } else {
                            wldmall = wldmall + ";" + wldm
                        }
                    }
                    if (trim(wldm2) != "") {
                        if (wldmall2 == "") {
                            wldmall2 = wldm2;
                        } else {
                            wldmall2 = wldmall2 + ";" + wldm2
                        }
                    }
                    jywldm = $(
                        "#tabS1 input[data-name=s1_cpxhzt]:eq("
                            + i + ")").val();
                    if (trim(jywldm) != "") {
                        if (msg1 == "") {
                            msg1 = wldm1;
                        } else {
                            msg1 = msg1 + ";" + wldm1
                        }
                    }
                }

                if (msg1 != "") {
                    BForm.options.actiontip = msg1
                        + "已处于停产阶段，可能存在不能供货的风险，请谨慎操作！"
                        + "<br> 是否提交文档？"
                } else {
                    BForm.options.actiontip = "是否提交文档？"
                };
                if ($("[name=zycp]").val() == "1") {
                    $("[name=s1_cpxhnew]").val(
                        $("[name=s1_cpxh]").val());
                } else {
                    $("[name=s1_cpxhnew]").val(wldmall);
                    $("[name=s1_khzdyxhnew]").val(wldmall2);
                }
            }
        });

    ( function() {
        /**
         *选择原定制单编号
         *sType:选择类型 "pz" 选择原配置单编号，默认选择原定制单编号。
         **/
        function selectydzdbh(thisObj, sType) {
            var dt = new Date();
            var url = "/" + val("WebDBPath")
                + "/Selectydzdbh?openForm&ssbm=" + val("s1_khmc")
                + "&dt=" + dt;
            if (sType)
                url = url + "&sType=" + sType;
            var features = "status:no;directories:yes;Resizable=no;";
            p = openModalDialog(url, this.value, "800", "550");

            if (p) {
                apputil.objToField(p, {
                    "s1_ydzdh" : "docno",
                    "ydzdocid" : "unid",
                    "ydzlink" : "link",
                    "ydzdb" : "dbname",
                    "ydzserver" : "servername"
                })
            }
            $(thisObj).trigger("selected", [thisObj, p, sType])
        }
        $( function() {
            $("[name=s1_ydzdh]").on("click", function() {
                var khmc = $("[name=s1_khmc]").val();
                var dzlx = $("[name=s1_dzlx]").val();
                if (khmc == "") {
                    jbox.alert("请先选择客户名称！");
                    return false;
                }
                if (/^已有产品配置/.test(dzlx)) {
                    selectydzdbh(this, "pz");
                } else {
                    selectydzdbh(this);
                }
            });
        });
    })();

    ( function() {
        /**
         * 需求RDSL20130712_09
         */
        var orgPTGP = $("[name=s1_dzxqlx][value=配套光盘]").attr("checked") || false;
        var isYangJi = function() {
            var list = $.grep($("input[data-name=s1_cpxhwlms]"), function(
                el) {
                return /样机/.test(el.value)
            });

            var zybom = $("[name=s1_zybom][value=是]:checked")
            return list.length > 0 && zybom.length > 0
        }
        /**
         * 计算是否包含样机字样并进行处
         * 如果存在样机字样是，配套光盘的Checkbox
         * 对选择不能简单的实现设置属性选中，这样将会时的一系列基于click的事件操作实效
         * 对禁止修改不能简单禁用（将导致值被清空）或者事件onclick时返回false（本身具有多个事件，返回false难控制）；
         *
         */
        var computerYangJi = function() {

            var dom = $("[name=s1_dzxqlx][value=配套光盘]")
            var dom2 = $("#s1_dzxqlx_ptgp_tip_dom")

            var isyj = isYangJi()
            if (!isyj) {
                $("#s1_sms_tip").removeClass("alert").text("")
            }else{
                $("#s1_sms_tip")
                    .addClass("alert")
                    .html(
                        "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button><strong>请关注：原型机样机产品中光盘内容默认为空</strong>")

            }
            return true;
            //20130929 取消选择控制，只进行提示
            if (!isyj) {

                dom.show();
                dom2.hide();

                return true;
            }
            dom.hide()
            if (dom2.length == 0) {
                dom2 = $("<span id='s1_dzxqlx_ptgp_tip_dom'><input type=checkbox checked disabled>"
                    + "</span>");
                dom.after(dom2);
            }


            dom2.show();
            if (dom.length < 1)
                return true;

            dom = dom.get(0)
            if (dom.checked) {
                return false;
            } else {
                dom.click();
            }
        }
        //是否专用bom专题切换
        $("body").on("click","input[name=s1_zybom]",computerYangJi)
        //20130929 取消选择控制，只进行提示，可以启动 input[name=s1_zybom]控制
        $("body").on(
            "aftervalidate",
            "form",
            function(e) {

                if (isYangJi()) {
                    //var def = new $.Deferred();
                    var dom = $("[name=s1_dzxqlx][value=配套光盘]:checked")
                    if (dom.length == 0) {
                        var def = apputil.confirm("提示-是否继续提交","请关注：原型机样机产品中光盘内容默认为空。")

                        return [def].concat(e.result)
                    }
                }
            })

        // 加载完成计算
        $("body").on("updateed", "[name=s1_cpxhTable]", computerYangJi)
        // 选择完成计算
        $("body").on("selected", "[name=s1_cpxhwldm]", computerYangJi)
        // 清空选择计算
        $("body").on("clear", "[name=s1_cpxhwldm]", computerYangJi)
        // 删除记录计算
        $("body").on("deleted", "[name=s1_cpxhTable]", computerYangJi)

    })();


    (function(){
        if(!docinfo.isnewdoc){
            docinfo.formula("wf_currentnodes").then(function(res){
                if(res.wf_currentnodes=="N011"){
                    require(["app/apply/01/N011"],function(app){
                        app.run();
                    })
                }
            })
        }
    })();


});

// ---选择客户信息
function selectkhmc(thisObj) {

    var dt = new Date();
    var url = "/" + val("customDbFilePath") + "/Selectkhmcdoc?openForm&ssbm="
        + val("s1_ssbm") + "&dt=" + dt;
    var features = "status:no;directories:yes;Resizable=no;";
    p = openModalDialog(url, this.value, "800", "550");

    if (p) {
        if (p.DocNo != "") {
            CleankhxxInfo1
            setVal("s1_khmc", p.khmc);
            setVal("s1_lxr", p.man);
            setVal("s1_tele", p.phone);
            setVal("s1_email", p.email);
            setVal("s1_mobile", p.phone_1);
            setVal("s1_kind", p.type);
            setVal("s1_credit", p.crstand);
            setVal("s1_yfsl", p.reforce);
            setVal("s1_zhsl", p.force);
            setVal("s1_khgx", p.description);
            setVal("s1_isdkh", p.isdkh);
        }
    }

}

//---选择客户信息
function selectkhmc1(thisObj) {

    var dt = new Date();
    var url = "/xxx/RDweb/Customerdata.nsf/Selectkhmcdoc?openForm&ssbm="
        + val("s1_ssbm") + "&dt=" + dt;
    var features = "status:no;directories:yes;Resizable=no;";
    p = openModalDialog(url, this.value, "800", "550");

    if (p) {
        if (p.DocNo != "") {
            CleankhxxInfo1
            setVal("s1_khmc", p.khmc);
            setVal("s1_lxr", p.man);
            setVal("s1_tele", p.phone);
            setVal("s1_email", p.email);
            setVal("s1_mobile", p.phone_1);
            setVal("s1_kind", p.type);
            setVal("s1_credit", p.crstand);
            setVal("s1_yfsl", p.reforce);
            setVal("s1_zhsl", p.force);
            setVal("s1_khgx", p.description);
            setVal("s1_isdkh", p.isdkh);
        }
    }

}

//-----清空客户信息-----
function CleankhxxInfo1() {
    obj("s1_khmc").value = "";
    obj("s1_lxr").value = "";
    obj("s1_tele").value = "";
    obj("s1_email").value = "";
    obj("s1_mobile").value = "";
    obj("s1_kind").value = "";
    obj("s1_credit").value = "";
    obj("s1_yfsl").value = "";
    obj("s1_zhsl").value = "";
    obj("s1_khgx").value = "";
    obj("s1_isdkh").value = "";

}
