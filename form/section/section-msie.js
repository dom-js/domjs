define( [ "jquery" ,"docinfo","base/util"], function($,docinfo,util) {
    //

    var sectionDiv = $("*:visible>div[id^=cSec],*:visible>div[id^=xSec]");
    var sectionCol = sectionDiv.filter("div[id^=cSec]");
    var sectionExp = sectionDiv.filter("div[id^=xSec]");

    sectionDiv.addClass("section");
    sectionCol.addClass("sectionCol");
    sectionExp.addClass("sectionExp");
    // 覆盖window防范
    window._dSectionExpand = window._dSectionCollapse = new Function()
    var section = function(id) {
        var me = this
        this.exp = sectionExp.filter("div[id=xSec" + id + "]");


        this.col = sectionCol.filter("div[id=cSec" + id + "]");

        this.name = "_section" + id;
        this.title = this.col.text();
        this.id = id;
        // 为标题添加div
        var titleEl = $("<div class=\"title\"></div>");
        titleEl.on("click", function(event) {
            event.stopImmediatePropagation();
            if (me.exp.css("display") == "none") {
                me.expand();
            } else {
                me.collapse();
            }
            return false;
        })

        this.exp.find(">a").wrap(titleEl);
        this.col.find(">a").wrap(titleEl);
        this.col.find(">.title").append("<a name=" + this.name + "></a>");// 添加锚标签
        this.translate();
    }
    section.prototype = {
        hide:function(){
            this.exp.hide();
            this.col.hide();
        },
        expand : function() {

            this.exp.show();
            this.col.hide();
            return false;
        },
        collapse : function() {
            this.exp.hide();
            this.col.show();
            return false;
        },
        translate : function(){
            var tpanel1 = this.exp;
            var tpanel2 = this.col;
            var table = this.exp.find("table")
            //对区段的title/等字符进行国际化处理
            $(function(){
                    util.translate("nls/form",tpanel1)
                    util.translate("nls/form",tpanel2)
                    if(docinfo.langpack&&docinfo.langpack!=""){
                        util.translate(docinfo.langpack,tpanel1,"di18n")
                        util.translate(docinfo.langpack,tpanel2,"di18n")
                        util.translate(docinfo.langpack,table,"di18n")
                    }
            })
        }
    }
    var sections = []
    sections.indexlist = []
    sections.statuspane = $("<div class=statuspane></div>")
    sections.statuspane.list = $("<ul></ul>")
    sections.statuspane.showbt = $("<div class=showbt></div>")
    sections.get = function(id) {
        return this[$.inArray(id, sections.indexlist)];
    }
    sections.expandall = function() {
        for ( var i = 0; i < this.length; i++) {
            this[i].expand()
        }
    }
    sections.collapseall = function() {
        for ( var i = 0; i < this.length; i++) {
            this[i].collapse()
        }
    }

    sections.expand = function(id) {
        for ( var i = 0; i < this.length; i++) {
            this[i].collapse()
        }

        this.get(id).expand()

    }

    // 初始化 sections
    sectionCol.each( function(i, el) {
        var _sel = new section(el.id.match(/\d+$/))

        if(_sel.exp.is(":disabled")&&_sel.col.is(":disabled"))return true;
        if(i==0){
            _sel.expand();
        }else if(_sel.exp.find(":input:not([type=hidden])").length>0){
            _sel.expand();
        }else{
            var signatrue = _sel.exp.find(".signatureinfo")
            if(signatrue.length>0&&$.trim(signatrue.text())==""){
                _sel.hide();
                return true;
            }else{
                _sel.collapse();
            }
        }

        var _selstatus = $("<li><a  href=\"#" + _sel.name + "\">"
            + _sel.title + "</a></li>")
        _selstatus.on("click", function() {
            sections.expand(_sel.id);
        })
        sections.statuspane.list.append(_selstatus)
        sections.indexlist.push(_sel.id)
        sections.push(_sel)
    })
    sections.statuspane.append(sections.statuspane.showbt);
    sections.statuspane.showbt.on("mouseenter", function() {
        if ($.browser.msie && ($.browser.version == "6.0")
            && !$.support.style) {
            sections.statuspane.showbt.hide();
            sections.statuspane.list.show();
        } else {
            sections.statuspane.showbt.hide("fast");
            sections.statuspane.list.show("fast");
        }
    })
    sections.statuspane.list.on("mouseleave", function() {
        if ($.browser.msie && ($.browser.version == "6.0")
            && !$.support.style) {
            sections.statuspane.list.hide();
            sections.statuspane.showbt.show();
        } else {
            sections.statuspane.list.hide("fast");
            sections.statuspane.showbt.show("fast");
        }
    })
    sections.statuspane.append(sections.statuspane.list);
        util.translate("nls/form",sections.statuspane.list)
        if(typeof docinfo.langpack=="string"&& $.trim(docinfo.langpack)!=""){
            util.translate(docinfo.langpack,sections.statuspane.list,"di18n")
        }

    $("body").append(sections.statuspane);
    return sections

})