define(
		[ "jquery" ],
		function($) {
			/**
			 * 格式化readviewentries返回的数据结构
			 */
			var parseData = function(data,query,options) {

				var originalname, results = [];

                if (!data.viewentry){
                    results.toplevelentries = 0
                        return results;
                }
				results.toplevelentries = data.viewentry["@toplevelentries"]

					$
							.each(
									data.viewentry,
									function(_i, entry) {

                                        if(query.expand!=0 && query.expand!= entry["@position"].replace(/(.*)\.\d+$/,"$1")){
                                               return false;
                                        }

										var _j;
										var item = {
											_position : entry["@position"], // 唯一
											_notesid : entry["@noteid"], // 唯一
											_siblingsCount : entry[ "@siblings" ]
										// 同级元素数量
										};
										if (entry["@children"]) {
											item._childrenCount = entry["@children"];// 直接子元素数量
											item._descendantsCount = entry["@descendants"]; // 所有后代数量
											item._children = item._position; // 如果是分类视图，则指定子节点指针
										} else {
											item._unid = entry["@unid"];
										}
                                        var _columns=[];
										for (_j in entry.entrydata) {
											var _val;
											if (entry.entrydata[_j].text) {
												// 文本
												_val = entry.entrydata[_j].text[0]
														.replace(/[\n\r\t]/, "");
											} else if (entry.entrydata[_j].textlist) {
												// 文本多值
												_val = [];
												var i;
												for (i in entry.entrydata[_j].textlist.text) {
													_val
															.push(entry.entrydata[_j].textlist.text[i][0]);
												}
											} else if (entry.entrydata[_j].number) {
												// 数字
												_val = entry.entrydata[_j].number[0];
											} else if (entry.entrydata[_j].numberlist) {
												// 数字多值
												_val = [];
												var i;
												for (i in entry.entrydata[_j].numberlist.number) {
													_val
															.push(entry.entrydata[_j].numberlist.number[i][0]);
												}
											} else if (entry.entrydata[_j].datetime) {
												// 时间
												_val = $
														.formatdatetime(entry.entrydata[_j].datetime[0]);

											} else if (entry.entrydata[_j].datetimelist) {
												// 时间多值
												_val = [];
												var i;
												for (i in entry.entrydata[_j].datetimelist.datetime) {
													_val
															.push($
																	.formatdatetime(entry.entrydata[_j].datetimelist.datetime[i][0]));
												}
											} else {
												_val = $
														.formatdatetime(entry.entrydata[_j]);
											}
											// 设置值
                                            _columns[_j] = entry.entrydata[_j]["@name"]
                                                .toLowerCase();
                                            item._columns=_columns
											item[_columns[_j]] = _val;
										}
										results.push(item);
									});
									
				return results;
			};
            var parseError = function(data){

                switch(data.status){
                    case 200:
                        var action=data.responseText.match(/\saction="(\/names\.nsf\?login)"\s/i)
                        if(!!action){
                          //  alert("你访问的地址需要进行身份验证\n"+this.url);
                            window.open("/names.nsf?login&RedirectTo="+window.top.location.href,"_top")
                        }
                        break;
                    case 400:
                        alert($(data.responseText).text() + data.status + ":" + data.statusText +"\n" + this.url)
                        break;
                    case 404:
                        alert($(data.responseText).text() + "\n" + data.status + ":" + data.statusText +"\n" + this.url)
                        break;
                    case 500:
                        alert("服务器异常错误\n" + data.status + ":" + data.statusText +"\n" + this.url)
                        break;
                    default:
                        alert("未知错误\n" + data.status + ":" + data.statusText +"\n" + this.url)
                }
                return [{label:"Error"}]

            };
			var ajaxResult = {};

			return function(query, options, url) {
				/**
				 * 默认ajaxResult不是不是一个xhr,无abort方法，如果存在改方法的时候，则立即阻断查询，然后进行下一次查询
				 */

				//if (ajaxResult.abort) {
				//	ajaxResult.abort();
				//}
                var query = $.extend({
                    expand:0
                },query)

				var options = $.extend({start:1},options);
				if(query.expand!="0"){
					options.start=query.expand + "." + options.start;
				}
				delete options.parentPosition;
				var queryURL = url + "?readviewentries&outputformat=json"  ;
				ajaxResult = jQuery.ajax( {
					type : "GET",
					data : $.extend(query, options),
					url : queryURL,
					dataType : 'json',
					scriptCharset : "UTF-8"
				}); 
				var deferred = ajaxResult.pipe(function(data){
                   return  parseData(data,query,options)
                }, parseError)

				return deferred;

			};
		});
