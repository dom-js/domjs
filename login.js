define(function(require,exports){
    var  $=require("jquery");
    require("bootstrap/js/bootstrap");
    require("bootstrap/js/bootstrap-modalmanager");
    require("bootstrap/js/bootstrap-modal");
    require("css!bootstrap/css/bootstrap");
    require("css!bootstrap/css/bootstrap-modal");
    var util = require("base/util");
    var html="<div class='modal  hide in' style='text-align: left' >" +
        "<form name='_DominoForm' class='modal-form' accept-charset=\"GBK\" action='/names.nsf?login' method='POST'>" +
        "<div class='modal-header'><h3>用户登录</h3></div>" +
        "<div class='modal-body container-fluid'>" +

        "<div class='row-fluid'>" +
        " <span class='span4'>访问系统</span>" +
        "<span class='span2'><input type='radio' value=''  checked  name='server'   >&nbsp;&nbsp;&nbsp;&nbsp;当前系统</span>" +
        "<span class='span2'><input type='radio' value='http://oa.xxx.com.cn'   name='server'   >&nbsp;&nbsp;&nbsp;&nbsp;OA系统</span>" +
        "<span class='span2'><input type='radio' value='http://rd.xxx.com.cn'   name='server'   >&nbsp;&nbsp;&nbsp;&nbsp;研发系统</span>" +
        "<span class='span2'><input type='radio' value='http://hr.xxx.com.cn'   name='server'   >&nbsp;&nbsp;&nbsp;&nbsp;人力资源系统</span>" +
        "</div>" +
        "<div class='row-fluid'>" +
        "<span class='span2 offset4'><input type='radio' value='http://apptest.xxx.com.cn'   name='server'   >&nbsp;&nbsp;&nbsp;&nbsp;APPTest</span>" +
        "<span class='span2'><input type='radio' value='http://develop.xxx.com.cn'   name='server'   >&nbsp;&nbsp;&nbsp;&nbsp;开发环境</span>" +
        "<span class='span2'><input type='radio' value='http://rddevelop.xxx.com.cn'   name='server'   >&nbsp;&nbsp;&nbsp;&nbsp;研发开发环境</span>" +
        "</div>" +
        "<div class='row-fluid'>" +
        " <span class='span4' >访问页面</span>" +
        "<span  class='span2'><input type='radio' value=''  checked  name='RedirectTo'   >&nbsp;&nbsp;&nbsp;&nbsp;当前页面</span>" +
        "<span  class='span2'><input type='radio' value='/'   name='RedirectTo'   >&nbsp;&nbsp;&nbsp;&nbsp;首&nbsp;&nbsp;&nbsp;&nbsp;页</span>" +
        "</div>" +
        "<div class='row-fluid'>" +
        " <span class='span4'>用户名</span><input class='span8' type='text' name='Username' value='' placeholder='用户名' />" +
        "</div>" +
        "<div class='row-fluid'> " +
        "<span class='span4'>密码</span><input  class='span8' type='password' name=Password  value='' placeholder='密码'>" +
        "</div>" +
        "</div>" +
        "<div class='modal-footer'>" +
        "<button type='button' class='btn btn-primary login'>登录</button> " +
        "<button type='button' class='btn admin'>管理员</button>" +
        " </div>" +
        "</form></div>"
    var modal = $(html);
    $("body").append(modal);
    var form = modal.find(".modal-form");
    var baseUrl = window.location.protocol+"://"+window.location.host
    form.find("[name=server]").get(0).value=baseUrl
    modal.on("click",".admin",function(){
        form.attr("action", form.find("[name=server]:checked").val()+"/names.nsf?login");
        form.find("[name=Username]").val("publicDesign")
        form.find("[name=Password]").val(1);
        form.submit();
    })
    modal.on("click",".login",function(){
        form.attr("action", form.find("[name=server]:checked").val()+"/names.nsf?login");
        form.submit();
    })
    modal.on("click","[name=server]",function(){
        if(this.value!=baseUrl){
            form.find("[name=RedirectTo]").get(1).checked=true;
        }else{
            form.find("[name=RedirectTo]").get(0).checked=true;
        }
    })
    exports.login=function(){
        form.show()
        var rt = modal.find("[name=RedirectTo]");
        rt.get(0).value = window.location.href ;
        if(/\.xxx\.com\.cn/.test( window.location.href)){
            var username = $(".jbox-content:contains(处理人)").text()
            username = username.match(/处理人:(.*)$/)
            if(username&&username[1]){
                username =  username[1];
            }else{
                username =  $(".statusbar_curruser_name").text();
            }
            if(username==""){
                username = document.body.innerText.match(/当前处理人：[\n]*(.*)[\s\n]*当前状态/);
                username = (username&&username[1])||"";
            }

            if(!username||username==""){
                username = util.getcookie("LastVisitUserName");
                form.find("[name=Username]").val(username)
            }else{
                username = $.trim(username.split(",")[0]);
                require(["appinfo"],function(appinfo){
                    appinfo.formula({username:'@NameLookUp([NoUpdate];"'+username+'";"shortname")'}).then(function(res){
                        if(res.username.join)res.username=res.username[0]
                        form.find("[name=Username]").val(res.username)
                        form.find("[name=Password]").val(1);
                    })
                });"";
            }

        }else{

            username = util.getcookie("username");
            form.find("[name=Username]").val(username)
        }
        modal.modal({
            width:800
        });
    };
});