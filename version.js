define("version",[],function(){
    require.config({
        baseUrl:"/domjs"
    })
    return {
        v100:require.config({
            paths:{
                "widget/itemlist":"widget/itemlist/1.0.0/itemlist",
                "widget/contextmenu":"widget/contextmenu/1.0.0/contextmenu"
            }
        })
    }
})
