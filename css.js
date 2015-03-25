(function () {
	define(["jquery"],function($){ 
		var css={
	    load: function (name, req, load, config) {
            var nameinfo = name.split(":");
            var cssfile;
            var win;
            if(nameinfo.length==1){
                cssfile=/\.css$/.test(name)?name:req.toUrl(name+".css");
            }else if(nameinfo.length==2){
                win=nameinfo[0]
                cssfile=/\.css$/.test(nameinfo[1])?nameinfo[1]:req.toUrl(nameinfo[1]+".css");
            }
           if($("head link[href='"+cssfile+"']").length==0){
               if(window.document.createStyleSheet){//IE

                   window.document.createStyleSheet(cssfile);
               }
               else{//FF
                   var my_link = window.document.createElement("link");
                   my_link.setAttribute("type","text/css");
                   my_link.setAttribute("rel","stylesheet");
                   my_link.setAttribute("href",cssfile);

                   window.document.getElementsByTagName("head")[0].appendChild(my_link);
               }
           }
	       load()

	    }
		}
		return css;
	});
   
}());