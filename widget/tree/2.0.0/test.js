require.config({
    baseUrl:"/domjs"
})
$(function(){
    require(["base/objectjEngine"], function (eg)
        {
            eg("body").then(function(){
                    var menu = $("#menu1").data("this")
                menu.onselect=function(item,node){
                   // console.log(node)
                }
                    var tree=$("#treepanel2").data("this")
                tree.on("contextmenu",function(e){
                       menu.root = this
                        menu.show()
                        return false
                })
            })

        }
    )

})