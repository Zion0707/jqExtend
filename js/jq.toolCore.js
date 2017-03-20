var ToolCore = window['ToolCore'] || {}

/**
* 表单验证函数
* opt 为所需要传递的对象 {} 参数如下:
* @param form 表单验证区域盒子
* @param button 提交按钮 
* @param errCallback 错误回调
* @param sucCallback 成功回调
* @param attr 自定义要校验的属性
* @param nullErr 自定义为空的属性
* @param regErr 自定义正则错误的属性
*/
ToolCore.formValidation = function( opt ){
	//默认参数对象
	var def = {
		form : 'body',
		button : '[type="submit"]',
		errCallback : function( err ){},
		sucCallback : function( suc ){},
		attr : 'dataType',
		nullErr : 'dataNull',
		regErr  : 'dataReg'
	}
	//合并参数对象
	var opt = $.extend( def , opt );
	
	//进行缩写
	var f = $(opt.form),
		b = $(opt.button),
		a = $('['+opt.attr+']'),
		ne = opt.nullErr,
		re = opt.regErr

	//主体函数
	var verifyForm = function(){
		for( var i = 0 , len = a.length ; i < len ; i++ )
		{
			var firstStr = a.eq(i).attr(opt.attr).charAt(0) ,
				n = a.eq(i) ,
				val = $.trim( n.val() ) ;

			switch ( firstStr ) {
				case '*': 
					//必填项 || 必填项+正则
					if ( n.attr(opt.attr).charAt(1) == '' ) {
						if ( !val ) {
							opt.errCallback(n.attr(ne) || '不能为空!');
							n.focus();
							return;
						}else{
							var illegal = /select|update|delete|exec|count|'|"|=|;|>|<|%/i;
							if ( illegal.test(val) ) {
								opt.errCallback('不能提交非法字符!');
								n.focus();
								return;
							}
						}
					}else{
						//不为空
						if ( !val ) {
							opt.errCallback(n.attr(ne) || '不能为空!');
							n.focus();
							return;
						}
						//有正则
						var reg = eval( n.attr(opt.attr).substr(1) )
						if ( !reg.test(val) ) {
							opt.errCallback(n.attr(re) || '格式错误!');
							n.focus();
							return;
						}
					}
				break;
				case '/': 
					//单单是有正则的
					if ( val ) {
						var reg = eval( n.attr(opt.attr) )
						if ( !reg.test(val) ) {
							opt.errCallback(n.attr(re) || '格式错误!');
							n.focus();
							return;
						}
					}
				break;
			}
		}
		
		opt.sucCallback('验证通过');
	}
	a.on('keyup',function(ev){
		if ( ev.target.tagName == 'INPUT' && ev.keyCode == 13 ) {
			b.trigger('click')
		}
	})
	b.on('click',verifyForm)
}



/**
* 千分号为逗号，并保留n位小数
* @param s 数值[ 整形 , 浮点型 ]
* @param n 保留小数位的几位小数
*/
ToolCore.fmoney = function(s, n) { 
	if ( isNaN( s ) ) { return '不是数字' }
	n = n > 0 && n <= 20 ? n : 2; 
	s = parseFloat((s + '').replace(/[^\d\.-]/g, '')).toFixed(n) + ''; 
	var l = s.split('.')[0].split('').reverse(), r = s.split('.')[1]; 
	t = ''; 
	for (i = 0; i < l.length; i++) { 
		t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? ',' : ''); 
	} 
	return t.split('').reverse().join('') + '.' + r; 
} 


/**
*获取url参数
*/
ToolCore.queryParams = {
    /**
     * 将地址栏查询参数转为json对象
     * @param url
     * @return {Object}
     *  ToolCore.queryParams.getQueryParams(window.location.href)
     */
    getQueryParams: function(url, decode) {
        if (!url) return {};
        url = url.split("#")[0];
        var us = url.split("?"), obj = {}, u;
        if (us.length > 1) {
            us = us[1].split("&");
            for (var i = 0, c = us.length; i < c; i++) {
                u = us[i].split("=");
                obj[u[0]] = decode ? decodeURIComponent(u[1]) : u[1];
            }
        }
        return obj;
    },
    /**
     * 将地址栏指定key的查询参数
     * @param key
     * @param url
     * @return {String}
     * ToolCore.queryParams.getQueryParamByKey('id')
     */
    getQueryParamByKey: function(key, url) {
        url = url || location.href;
        var obj = ToolCore.queryParams.getQueryParams(url);
        return obj[key] || "";
    }
}


/**
 * ajax 分页
 * @param curr 当前页 1
 * @param pageSize 每页条数 10
 * @param totalCount 总条数，来计算当前分页数量 100
 * @param size 可点击按钮显示的数量 一般为 5
 * */
ToolCore.getAjaxPagerHtml = function(curr, pageSize, totalCount, size) {
	//如果总数比条数都要少那么就没必要生成分页了
	if( pageSize >= totalCount || pageSize == undefined || totalCount == undefined ) return '';
    var half = ~~(size / 2), b, e, page, t, arr = [], i;
    curr = (+curr) || 0;
    pageSize = pageSize || 20;
    b = curr - half;
    e = curr + half;
    totalCount = (+totalCount) || 0;
    t = totalCount % pageSize;
    page = parseInt(totalCount / pageSize);
    curr = curr || 1;
    if (t) page++;
    if (page <= size + 4) {
        b = 1;
        e = page;
    } else {
        if (curr == page - half) {
            b--;
        }
        if (b < 1) {
            b = 1;
            e = b + size;
        } else if (b == 3) {
            b = 1;
        }
        if (curr == 1 + half) {
            e++;
        }
        if (e > page) {
            e = page;
            if (b != 1) b = e - size;
            if (b < 1) b = 1;
        } else if (e == page - 2) {
            e = page;
        }
    }
    if (curr != 1) {
        arr.push("<a href='javascript:;' class='prev' page='"+ ((+curr) - 1) +"' start='" + (curr - 2) * pageSize + "'>上一页</a>");
    } else {
    	arr.push("<span class='prev'>上一页</span>");
    }
    if (b != 1) {
        arr.push(curr == 1 ? "<span class='current'>1</span>" : "<a href='javascript:;' start='0'>1</a>");
        if (b != 2) arr.push("<span start='" + (curr - size) * pageSize + "'>...</span>");
    }
    for (i = b; i <= e; i++) {
        arr.push(curr == i ? "<span class='current'>" + i + "</span>" : "<a href='javascript:;' page='"+i+"' start='" + (i - 1) * pageSize + "'>" + i + "</a>");
    }
    if (e != page) {
        if (e != page - 1) arr.push("<span start='" + (curr + size - 1) * pageSize + "'>...</span>");
        arr.push(curr == page ? "<span class='current'>" + page + "</span>" : "<a href='javascript:;' start='" + (page - 1) * pageSize + "'>" + page + "</a>");
    }
    if (curr != page) {
        arr.push("<a href='javascript:;' class='next' page='"+ ((+curr) + 1) + "' start='" + curr * pageSize + "'>下一页</a>");
    } else {
        arr.push("<span class='next'>下一页</span>");
    }
    return arr.join("");
};


/**
* ajax分页 点击事件要与 ToolCore.getAjaxPagerHtml 搭配
* @param div 分页盒子
* @param json{ 页数，总条数，可见值 }
* @param callback 回调参数为当前页码
*/
ToolCore.pageGetAjax = function( div ,json, callback ){
    var mySwitch = true;
    var timeDelay = 600;
	$( div ).unbind('click') 
    $( div ).on('click','a',function(){
        var _this = $( this ) ,
       	    text = $(this).text() ; 
        switch( text ){
            case '上一页':
                if ( mySwitch == true ) {
                	var nowPage = parseInt($(div).find('.current').text()) -1
            	    $(div).html(ToolCore.getAjaxPagerHtml( nowPage ,json.pageSize,json.totalCount,json.size));
                    callback( nowPage )

                    mySwitch = false;
                    var timer = setTimeout(function(){
                        mySwitch = true;
                        clearTimeout(timer);
                    },timeDelay)
                }
            break;
            case '下一页':
                if ( mySwitch == true ) {
                	var nowPage = parseInt($(div).find('.current').text()) +1
            	    $(div).html(ToolCore.getAjaxPagerHtml( nowPage ,json.pageSize,json.totalCount,json.size));
                    callback( nowPage )

                    mySwitch = false;
                    var timer = setTimeout(function(){
                        mySwitch = true;
                        clearTimeout(timer);
                    },timeDelay)
                }
            break;
            default :  //数字
        	    $(div).html(ToolCore.getAjaxPagerHtml( text ,json.pageSize,json.totalCount,json.size));
        	    callback( text )
        }
    })
} 

/**
* 倒计时
* @param div 显示盒子
* @param syTime 时间 例如:'24:00:00'
* @param semicolon 自定义分号默认为 : 
*/
ToolCore.countDown = function( div, syTime ,semicolon ){
        //根据剩余时间字符串计算出总秒数
    function getTotalSecond(timestr) {
        var reg = /\d+/g;
        var timenums = new Array();
        while ((r = reg.exec(timestr)) != null) {
            timenums.push(parseInt(r));
        }
        var second = 0,
            i = 0;
        if (timenums.length == 4) {
            second += timenums[0] * 24 * 3600;
            i = 1;
        }
        second += timenums[i] * 3600 + timenums[++i] * 60 + timenums[++i];
        return second;
    }
 
    //根据剩余秒数生成时间格式
    var semicolon = semicolon || ':' ;
    function getNewSyTime(sec) {
        var s = sec % 60;
        sec = (sec - s) / 60; //min
        var m = sec % 60;
        sec = (sec - m) / 60; //hour
        var h = sec % 24;
        var d = (sec - h) / 24; //day
        var syTimeStr = "";
        if (d > 0) {
            syTimeStr += d.toString() + semicolon;
        }
 
        syTimeStr += ("0" + h.toString()).substr(-2) + semicolon + ("0" + m.toString()).substr(-2) + semicolon + ("0" + s.toString())
            .substr(-2);
 
        return syTimeStr;
    }
    $( div ).text( syTime )
    var tid = setInterval(function () {
        var strTime = $(div).text()    
        var totalSec = getTotalSecond(strTime) - 1;
        if (totalSec >= 0) {
            $( div ).text( getNewSyTime(totalSec) );
        } else {
            clearInterval(tid);
        }
    }, 1000);
}




/**
* 自定义弹出框
* @title 标题
* @content 内容
* @type 类型 [ a(类似alert) , b(有确定和取消按钮) , c(显示又关闭的) ]
*/
ToolCore.popUp = function( title , content , type ){
	
}


