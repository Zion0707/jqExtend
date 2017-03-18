var ToolCore = window['ToolCore'] || {}

/**
* 表单验证函数 [描述：为了简单、轻便、拓展]
* opt 为所需要传递的对象 {} 参数如下:
* @form 表单验证区域盒子
* @button 提交按钮 
* @errCallback 错误回调
* @sucCallback 成功回调
* @attr 自定义要校验的属性
* @nullErr 自定义为空的属性
* @regErr 自定义正则错误的属性
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
					if ( val ) {
						//有正则
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