/**
 *  通过Post 方式发送表单查询到iframe内
 */
//>>built
define( ["jquery"], function($) {

	//console.log(charset)
  //  module:
  //    store/util/SimpleQueryEngine
  //  summary:
  //    定义了一个简单的Store对象查询引擎 
var form,nameInput,idocument
var   _createForm = function(){ 
	var  _form="<form method=POST accept-charset=\"gb2312\" target=validatenames > " +
	 		"<input name=VAL_DisablePartial value=0 />" +
	 		"<input name=VAL_DoValidation value=1 />" +
	 		"<input name=VAL_Exhaustive value=1 />" +
	 		"<input name=VAL_ExpandGroup value=0 />" +
	 		"<input name=VAL_Flags value=0 />" +
	 		"<input name=VAL_Items />" +
	 		"<input name=VAL_SendEncrypted value=0 />" +
	 		"<input name=VAL_NameEntries />" +
	 		"<input name=VAL_Type value=1 /></form>"; 
	 
	 var iframe=$("<iframe name='validateform' style='display:none'></iframe>")
	 $("html").append(iframe)
	 idocument=iframe[0].contentWindow.document
	 	
	 	//$("body",idocument).append("<A>")
	 	//$(idocument).append(_form)
	//iframe[0].contentWindow.alert(1)
	//idocument.innerHTML=_form;
	//idocument.designMode = 'On';
   // idocument.contentEditable = true;
   // idocument.charset = "GB2312"
	idocument.open() 	
	idocument.writeln("<html><head></head><body>")

	idocument.writeln("</body></html>")
	idocument.body.innerHTML=_form;
	form=  idocument.forms[0]
	//form =$(_form)//
	//  form=$(idocument.forms[0])
	// $("body",idocument).append(form)
	nameInput=$(idocument.forms[0]).find("input[name=VAL_NameEntries]")[0];
	//console.log(nameInput)
	//form.append(nameInput)	
	   
	idocument.close();
	//idocument.designMode ="off";    
}
var validateiframe;
var _createResultIframe = function(){
	 validateiframe=$("<iframe name='validatenames'  style='display:none' >")
	$("html").append(validateiframe) 
}
_createForm();
_createResultIframe();
var results=[]

window.Validation={};
var deferred = new $.Deferred();
window.Validation.ValidatedCB=function(data){
	
	//alert(validateiframe[0].contentWindow.document.charset)
	var serverentries=$("entrydata[name=server]>viewentries>viewentry",data) 
	 var items=[]
	           
	 var originalname=[] ;// =$("entrydata[name=originalName] ",serverentries).text().replace(/\n|\s/gi,"");
	 $("entrydata[name=originalName] ",serverentries).each(function(index,item){
		 originalname.push($(item).text().replace(/\n|\s/gi,""))
	 })
	 var tmpentries = $("[name=candidate]>viewentries>viewentry ",serverentries)
	   
			tmpentries.each(function(index,entry){ 
				//if (index>30) return  false;   
					var item={ 
						unid:$(entry).attr("unid"),
						originalname:"",
						fullname:$("entrydata[name=fullName] ",entry).text().replace(/\n/gi,"").toString() ,
						type:$("entrydata[name=type] ",entry).text().replace(/\n/gi,""), 
						mail:$("entrydata[name=internetAddress] ",entry).text().replace(/\n/gi,"").toString() 
					}  
					item.shortname=item.mail.substr(0,item.mail.indexOf("@"))
					item.lastname=item.fullname.replace(/CN=(.*)\/.*/,"$1"); 
					item.abbreviate=item.fullname.replace(/cn=|ou=|o=/gi,"")
					//在查询多人时，oiginalname返回多个值，使用正则检查判断item使用哪一个originalname比通过xml直接查询速度更快
					for(i in originalname){ 
						if((new RegExp("^,?"+originalname[i])).test(item.shortname+","+item.lastname)){
							item.originalname=originalname[i] 
							break;
						}
					}  
					results.push(item)  
					
	})  
	deferred.resolve(results)
}
return function(query, options){ 
	nameInput.value=query;
	//$(form).attr("accept-charset","Content-Type: application/x-www-form-urlencoded");
	if( navigator.userAgent.indexOf("MSIE")>0){
		idocument.charset = "gb2312";
	}
	form.action=options.mailpath+"/iNotes/Proxy/?EditDocument&Form=s_ValidationXml&charset=utf-8"
	form.submit();
	results=[]
	//         deferred.reject()
	deferred = new $.Deferred();
	         // deferred.promise(results) 
	//console.log(form[0])
	return deferred;
};
});
