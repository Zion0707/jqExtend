var ToolCore = window['ToolCore'] || {}

/**
* 全局变量
*/
ToolCore.CONFIG = {

}

/**
* cookie 操作函数
* @param set : 设置cookie
* @param get : 获取cookie
* @param clear : 清除cookie
*/
ToolCore.cookieFn = {
    //名字，值，日期，地址，域名 ,expires参数要自己定义 -> var myDate = expires=new Date(new Date().getTime() + 1000 * 3600 * 24 * 1);
    set:function(name,value,expires,path,domain)
    {
        //如果默认不填写时间的话，那么就是365天
        if(typeof expires=="undefined")
        {   
            //1000 * 3600 * 24 * 365(天数)
            expires=new Date(new Date().getTime()+1000*3600*24*365);
        }
        document.cookie=name+"="+escape(value)+((expires)?"; expires="+expires.toGMTString():"")+((path)?"; path="+path:"; path=/")+((domain)?";domain="+domain:"");
    },
    //获取cookie值
    get:function(name)
    {
        var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
        if(arr != null)
        {
            return unescape(arr[2]);
        }
        return null;
    },
    //删除指定cookie
    clear:function(name,path,domain)
    {
        if(this.get(name))
        {
        document.cookie=name+"="+((path)?"; path="+path:"; path=/")+((domain)?"; domain="+domain:"")+";expires=Fri, 02-Jan-1970 00:00:00 GMT";
        }
    }
}


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
		errCallback : function( err,el ){},
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
            try{
    			switch ( firstStr ) {
    				case '*': 
    					//必填项 || 必填项+正则
    					if ( n.attr(opt.attr).charAt(1) == '' ) {
    						if ( !val ) {
    							opt.errCallback(n.attr(ne) ,n || '不能为空!');
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
    							opt.errCallback(n.attr(ne) ,n || '不能为空!');
    							n.focus();
    							return;
    						}
    						//有正则
    						var reg = eval( n.attr(opt.attr).substr(1) )
    						if ( !reg.test(val) ) {
    							opt.errCallback(n.attr(re) ,n || '格式错误!');
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
    							opt.errCallback(n.attr(re) ,n || '格式错误!');
    							n.focus();
    							return;
    						}
    					}
    				break;
    			}
            }catch(err){
                console.warn(err)
                alert('请仔细检查您表单中填写的 dataType 值是否正确!');
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
* 数字千分号为逗号，并保留n位小数
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
* 数字不四舍五入的，转换
* @param s 数值[ 整形 , 浮点型 ]
* @param n 保留小数位的几位小数
*/
ToolCore.floatingPoint = function(s, n) { 
    if ( isNaN( s ) ) { return '不是数字' }
    s = s.toString()
    if ( s.indexOf('.') == -1 ) {
        s += '.00'
    }else if( s.split('.')[1].length == 1 ){
        s += '0'
    }else{
        var si = s.indexOf('.') + n + 1 ;
        s = s.substr( 0 , si );
    }
    return s;
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
   	    var text = $(this).text() ,
            btnClass = $(this).attr('class')
        switch( btnClass ){
            case 'prev':
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
            case 'next':
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
* @param syTime 时间 例如:'24:00:00' 必须传入 YY:MM:DD 格式
* @param semicolon 自定义分号默认为 : 
*/
ToolCore.countDown = function( div , syTime , semicolon ){
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
* 迷你提示框
* @param content 内容
* @param type 类型 [ info(轻提示) , alert(警告) , success(成功) , error('错误') , loading(加载中)]
* @param time 消失时间
* @param callback 回调
*/
ToolCore.minPopUp = function( type , content , time , callback  ){
    // console.log( typeof arguments[2] === 'function' )
    if ( typeof time === 'function' ) {
        var callback = time ,
            timeDelay = 1500 ;
    }else{
        var timeDelay = time || 1500;
    }
    var type = type || '' ,
        content = content || '' ,
        timer = null ,
        el = $('#popEl[dataType=minPopUp]') ;
    if ( el.get(0) ) {
        el.removeClass()
        el.addClass(type)
        el.find('.content').html(content)
        popUpToggle()
        return;
    }
    var popEl = '<div id="popEl" dataType="minPopUp" class="'+type+'"><div class="inner"><span class="icon"></span><div class="content">'+content+'</div></div></div>';
    $('body').append(popEl)
    el = $('#popEl[dataType=minPopUp]')
    
    function popUpToggle(){
        el.fadeIn(100)
        //居中定位
        var inner = el.find('.inner') ,
            innerOuterWidth = inner.outerWidth() ,
            innerOuterHeight = inner.outerHeight()
        inner.css({
            marginLeft: '-'+ (innerOuterWidth/2) +'px',
            marginTop: '-'+ (innerOuterHeight/2) +'px'
        })

        clearTimeout(timer)
        timer = setTimeout(function(){
            el.fadeOut(100)
            callback && callback()
            clearTimeout(timer)
        },timeDelay)
    }
    popUpToggle()
}


/*
* 获取文件后缀名
* @param filename 文件名
*/
ToolCore.getSuffix = function( filename ){
    if ( filename ) {
        var index1 = filename.lastIndexOf('.') ,
            index2 = filename.length ;
        return filename.substring(index1,index2)
    }else{
        return '';
    }
}


/*
* 获取未来的日期
* @param day 天数
**/
ToolCore.futureDay = function( day ){
    var d = new Date();
    return new Date(d.getTime() + day*24*60*60*1000);
}



/*
* 日期操作
*@namespace oofUtil.date
*/
ToolCore.DateFormat = {
    /**
     * 格式化时间函数
     * @param date 要格式化的时间 默认 new Date
     * @param fmt 要格式化的格式 默认 yyyy-MM-dd HH:mm:ss
     */
    diffArr : [ [ "y", 31536e6 ], [ "M", 2592e6 ], [ "d", 864e5 ], [ "h", 36e5 ], [ "m", 6e4 ], [ "s", 1e3 ] ] ,
    format: function(date, fmt) {
        date = date || new Date();
        var o = {
            "M+": date.getMonth() + 1,
            //月份
            "d+": date.getDate(),
            //日
            "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12,
            //小时
            "H+": date.getHours(),
            //小时
            "m+": date.getMinutes(),
            //分
            "s+": date.getSeconds(),
            //秒
            S: date.getMilliseconds()
        }, week = {
            "0": "日",
            "1": "一",
            "2": "二",
            "3": "三",
            "4": "四",
            "5": "五",
            "6": "六"
        }, zhou = {
            1: "一",
            2: "二",
            3: "三",
            4: "四",
            5: "五",
            6: "六"
        };
        fmt = fmt || "yyyy-MM-dd HH:mm:ss";
        if (/(y+)/.test(fmt)) {
            //年特殊处理
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            //星期特殊处理
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length > 1 ? RegExp.$1.length > 2 ? "星期" : "周" : "") + week[date.getDay() + ""]);
        }
        if (/(e+)/.test(fmt)) {
            //第几周特殊处理
            var z = ~~(date.getDate() / 7) + 1;
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length > 1 ? zhou[z] : z);
        }
        if (/(q+)/.test(fmt)) {
            //第几季特殊处理
            var z = Math.floor((date.getMonth() + 3) / 3);
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length > 1 ? zhou[z] : z);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return fmt;
    },
    /**
     * 通过时间戳获取一个时间对象
     * @param timestamp
     * @param fix
     * @return {Date}
     */
    fromTimestamp: function(timestamp, fix) {
        fix = fix || 1;
        return new Date(timestamp * fix);
    },
    formatPhpTimespan: function(v, isfuture) {
        var date = new Date(v * 1e3);
        if (oofUtil.type(isfuture) == "string") {
            //format
            return Core.DateFormat.format(date, isfuture);
        }
        var curr2 = new Date(+new Date() + (window.DIFF_TIME || 0)), t = Core.DateFormat.fix(date, "s"), t1 = Core.DateFormat.fix(curr2, "s"), diff = t1 - t;
        if (diff < 0 && !isfuture) {
            return "刚刚";
        }
        if (diff < 60 && diff > -60) {
            //1分钟
            if (diff > -5 && diff < 5) {
                return "刚刚";
            }
            if (diff < 0) return -diff + "秒后";
            return diff + "秒前";
        }
        if (diff < 3600 && diff > -3600) {
            //1小时
            if (diff < 0) return ~~(-diff / 60) + "分钟后";
            return ~~(diff / 60) + "分钟前";
        }
        t = Core.DateFormat.fix(date, "d");
        t1 = Core.DateFormat.fix(curr2, "d");
        diff = t1 - t;
        if (diff === 0) {
            //当天
            return "今天 " + Core.DateFormat.format(date, "HH:mm");
        }
        if (diff == 1) {
            //昨天
            return "昨天 " + Core.DateFormat.format(date, "HH:mm");
        }
        if (date.getFullYear() == curr2.getFullYear()) {
            //当年
            return Core.DateFormat.format(date, "MM-dd HH:mm");
        }
        return Core.DateFormat.format(date, "yyyy-MM-dd");
    },
    /**
     * 服务器当前时间
     */
    serverNow: function() {
        return new Date();
    },
    /**
     * 求两个时间的差值，
     * @param date
     * @param diff
     * @param fmt   yMdhms：y年M月d日，h小时，m分，s秒
     * @returns {*}
     */
    diffFormat: function(date, diff, fmt) {
        var i, c, d, m, dif = date - diff;
        if (dif <= 0) return "";
        for (i = 0, c = ToolCore.DateFormat.diffArr.length; i < c; i++) {
            d = ToolCore.DateFormat.diffArr[i];
            if (~fmt.indexOf(d[0])) {
                m = dif % d[1];
                fmt = fmt.replace(d[0], (dif - m) / d[1]);
                dif = m;
            }
        }
        return fmt;
    },
    /**
     * 将时间（时间戳）date 取整到指定的m
     * @param date 时间、时间戳
     * @param m  y M d h m s
     * @param up
     * @returns {number}
     */
    fix: function(date, m, up) {
        var i, c, d, res = +date - +new Date("Thu Jan 01 1970 00:00:00 GMT+0800");
        for (i = 0, c = ToolCore.DateFormat.diffArr.length; i < c; i++) {
            d = ToolCore.DateFormat.diffArr[i];
            if (m == d[0]) {
                m = res % d[1];
                res = (res - m) / d[1];
                if (up) res++;
                return res;
            }
        }
        return 0;
    },
    /**
     * 从指定格式的字符串中解析出时间
     * @param dateStr
     * @param fmt
     * @param cur
     * @returns {*}
     */
    fromString: function(dateStr, fmt, cur) {
        var f = fmt, r = "", t;
        var o = [ "d", "m", "M", "h", "H", "s", "f" ];
        for (var i = 0; i < o.length; i++) {
            t = "(" + o[i] + "+)";
            if (new RegExp(t).test(fmt)) {
                fmt = fmt.replace(RegExp.$1, "(\\d{1,2})");
                r += t + "|";
            }
        }
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, "(\\d{4})");
            r += "(y+)|";
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length > 1 ? RegExp.$1.length > 2 ? "星期" : "周" : "") + "[日一二三四五六]");
        }
        if (/(q+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, "d{1}");
        }
        if (/(p+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, "(PM|AM)");
            r += "(p+)|";
        }
        r = "(" + r + "d+)";
        var re = new RegExp(r);
        re.lastIndex = 0;
        //re.exec(f);
        var vs = new RegExp(fmt).exec(dateStr), e, i = 0, v = {};
        if (vs) {
            while (e = re.exec(f)) {
                i++;
                f = f.substring(e.index + RegExp.$1.length);
                v[RegExp.$1.substring(0, 1)] = vs[i];
                if (f == "") break;
            }
            if (!v.H) {
                v.H = (v.h || 0) * 1;
                if (v.p == "PM") v.H += 12;
            }
            return new Date(v.y, (v.M || 1) - 1, v.d || 1, v.H || 0, v.m || 0, v.s || 0);
        } else return cur || new Date();
    }
};



/*
* 对象数组的深拷贝
* @param source 对象or数组
**/
ToolCore.objDeepCopy = function (source) {
    var sourceCopy = source instanceof Array ? [] : {};
    for (var item in source) {
        sourceCopy[item] = typeof source[item] === 'object' ? ToolCore.objDeepCopy(source[item]) : source[item];
    }
    return sourceCopy;
}


/*
* 金额阿拉伯数字转中文
* @param n 数字
**/
ToolCore.NumberDx = function(n){
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
        return "数据非法";
    var unit = "千百拾亿千百拾万千百拾元角分", str = "";
        n += "00";
    var p = n.indexOf('.');
    if (p >= 0)
        n = n.substring(0, p) + n.substr(p+1, 2);
        unit = unit.substr(unit.length - n.length);
    for (var i=0; i < n.length; i++)
        str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
    return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
}