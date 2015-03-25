define(["jquery"],function($){
    var mask = $("<div style='position:absolute;z-index:9999;width:100%;height:100%' id='__mask__"+(new Date()).getTime()+"' ></div>")
    $("body").append(mask)
})