define(
    [ "jquery" ],
    function($) {
        /**
         * 使用函数fn递归处理一个数组
         * @param p ：指针
         * @param obj：对象数组
         * @param fn：处理函数,fn的this指针为obj
         * @return {*} 延迟对象，返回处理后的数组对象
         */
        //n，指针
        //length d对象长度
        //obj
        var workerFor = function(p,obj,fn){
           var args = Array.prototype.slice.call(arguments)

            if(typeof p=="object")return workerFor.apply(new $.Deferred(),[0].concat(args))
            var def = this.then?this:new $.Deferred()
            if(!def.result){
                def.result= $.isArray(obj)?[]:{}
            }
            var result = def.result
            if(obj[p]){
                //fn 后面的参数作为fn的参数
                var args1 = Array.prototype.slice.call(args, 3)
                args1 = [p,obj[p]].concat(args1)
                var defres = fn.apply(obj,args1)

                $.when(defres,result).then(function(res,result){

                    if(res===null){
                        def.resolve(result)
                    }else{
                        var nextpointer ,result
                        if($.isPlainObject(res)&&typeof res.pointer=="string"){

                            nextpointer=res.pointer
                            result[p] = res.result
                        }else{
                            result[p] = res

                            nextpointer=p+1
                        }
                        var args2 = Array.prototype.slice.call(args, 0);
                        args2[0] = nextpointer

                        setTimeout(function(){
                            workerFor.apply(def,args2)
                        },0)
                    }
                })
            }else{
                def.resolve(result)
            }
            return def
        }

        var initTotal = {}
        var getTotal = function(baseurl,key){
            var url =baseurl+key
            if(initTotal[key])return initTotal[key]
            return $.get(url+"&endview&count=1").pipe(function(data){
                data=data.replace(/\n/gi,"")
                data = data.match(/<body[^\n]*<\/body>/gi)[0].replace(/<script[^>]*><\/script>/gi,"")//.replace(/<script.*(?=<\/script>)<\/script>/gi,"")
                data = data.replace(/class="[^"]*"/gi,"").replace(/<img[^>]*>/gi,"")
                return initTotal[key] =parseInt($(data).find("#viewStart").text())
            })
        }
        var adapter = function(data,opts) {
         //   console.timeEnd(2)
            var deferred = new $.Deferred()
            var __time__=(new Date()).getTime()

            var totalurlbase =data.match(/url="(.*&Click=)"/)
            if(totalurlbase&&totalurlbase[1]){
                totalurlbase=totalurlbase[1]
            }

            data = data.match(/<body([\s\S](?!\/body))*<\/body>/gi)[0].replace(/<script([\s\S](?!\/script))*<\/script>/gi,"")//.replace(/<script.*(?=<\/script>)<\/script>/gi,"")
            //处理特殊字段，方便后续的解析与处理
            var tbstr = (data.replace(/<table(?:[\s\S](?!\/td>)(?!\/th>)(?!<table))*(?:<td>((?:.(?!\/td>)(?!\/table>))*)<\/td>)(?:<td>((?:.(?!\/td>)(?!\/table>))*)<\/td>)?(?:[\s\S](?!\/table))*<\/table>/gi,"$1$2"))
            tbstr = tbstr.replace(/<img[^>]*\/icons\/ecblank\.gif[^>]*>/g,"").replace(/<font[^>]*>((?:.(?!\/font>))*)<\/font>/g,"$1")
            //取出列表表格
            tbstr = tbstr.match(/<table(?:[\s\S](?!table))*<th.*<\/th>(?:[\s\S](?!\/table>))*<\/table>/i)

            if(tbstr){
                tbstr = tbstr[0]
            }else{
                tbstr = ""
            }
            //获取行信息
            var trArr = tbstr.match(/<tr(?:[\s\S](?!\/tr>)(?!<th))+<\/tr>/g)
            var items= []
            var colspan = 0,colinfo,colspancont=0
            var _basecolcolspan= $.map( opts.layout,function(){return 0})
           // console.time(1)
            if(trArr&&trArr.length){
                var fnForTr = function(n,tr){
                    var tds = tr.match(/<td(?:[\s\S](?!\/td>))*<\/td>/g)

                    if(tds){
                        var item = {
                            _colcolspan:$.extend([],_basecolcolspan)
                        }
                        colspan = 0
                        var _colspancont=0
                        $.each(tds,function(i,td){
                            var layout = opts.layout[colspan+i]
                            if(!layout)return ;
                            var tdHTML = td.match(/<td[^>]*>((?:[\s\S](?!\/td>))*)<\/td>/),tdText=""
                            if(tdHTML&&tdHTML[1]){
                                tdHTML =tdHTML[1].replace(/^\n|\n$/g,"")
                                tdText = tdHTML.replace(/<\/?\w+[^>]*>/g,"")
                            }else{
                                tdHTML=""
                            }
                            item[layout.name] =tdText
                            //计算是否是展开标记
                            colinfo = td.match(/<td\s(?:.(?!>))*(?:colspan="(\d+)")>/)
                            if(colinfo&&colinfo[1]){
                                //可展开的图标
                                _colspancont+=i+1
                                item._colcolspan[colspan+i]=Number(colinfo[1])
                                colspan = colspan+Number(colinfo[1])-1
                                var expendinfo=tdHTML.match(/<a\shref="(.*expand=([\d\.]+)#\2[^"]*)"/i)
                                if(expendinfo&&expendinfo[1]&&expendinfo[2]){
                                    item._catecolumn = _colspancont-1
                                    item._expandurl=expendinfo[1]
                                    item._position=expendinfo[2]
                                    item._catelevel = item._position.split(".").length-_colspancont
                                    item._iscategroy=true
                                }
                            }else{
                                //不可展开图标，需要处理html
                                item._colcolspan[colspan+i]=1
                                if(tdText!=tdHTML){
                                    item[layout.name+"_html"]=tdHTML
                                }
                            }
                            //计算是否是连接
                            if(item[layout.name+"_html"]&&!item._unid){
                                var urlinfo = tdHTML.match(/<a(?:.(?!href=)(?!>))*\shref="?(.[^\?]*\/([\w\d]{32})\?opendocument)"?/i)
                                if(urlinfo&&urlinfo[1]&&urlinfo[2]){
                                    item._docurl=urlinfo[1]
                                    item._unid=urlinfo[2]
                                }
                            }
                        })

                        if(n==0){
                            colspancont=_colspancont
                        }else{
                            if(_colspancont<colspancont||colspancont==0&&_colspancont>0)return null;
                        }
                        console.log(item)
                        return item

                    }
                    return null
                }

//                workerFor(trArr,fnForTr).pipe(function(res){
//                    return res
//                })
                for(var l=0;l<trArr.length;l++){

                    var n= l,tr = trArr[l]
                    item = fnForTr(l,tr)
                    if(item==null)break;
                    items.push(item)

                }
            }
          //  console.timeEnd(1)
            return $.when(items)
            var body = $(data),viewTotal
            if(body.find("#idgetendpage").length==1&&totalurlbase){
                try{
                    viewTotal=getTotal(totalurlbase,body.find("#idgetendpage").attr("onclick").match(/\('(.*)'./)[1])
                }catch(e){
                    viewTotal = parseInt(body.find("#viewTotal").text())
                }

            }else{
                viewTotal=parseInt(body.find("#viewTotal").text())
            }
        };
        return adapter
    });
