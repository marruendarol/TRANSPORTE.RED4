/**********************************************************
*	MAIN CONTROLLER
***********************************************************/

/**********************************************************
*	TODO
	

***********************************************************/


var templateIndex = 0;

var mainC = {
	initApp : function(){

		Ractive.DEBUG = false;
	},
    loadTInit : function(callback,list){


        mainC.list = list 
        mainC.callback = callback;
        templateIndex= 0;
        mainC.loadTemplateFile();
    },
    loadTemplateFile: function(){
        if(templateIndex<mainC.list.length){
            var content;
            //console.log("getting template",mainC.list[templateIndex])
            $.get(mainC.list[templateIndex], function(data){
                content= data;
                $('#templateLoader').append(content);
                templateIndex++;
                mainC.loadTemplateFile();
            });
        }else{
            mainC.callback();
        } 
    },
    genPagination : function(pageInfo){  // generate a pagintation object
        pageInfo.pagination = []

        var view = 10;
        var count = 1
        var right = pageInfo.pn;
        var left = pageInfo.pn;
        if(pageInfo.tp<view) { view = pageInfo.tp}
        addRight()

        function addRight(){
            if(count<view){
                if(right<pageInfo.tp){
                    right++;count++; addLeft();
                } else {  addLeft() }
            }
        }
        function addLeft(){
            if(count<view){
                if(left-1>0){
                    left--;count++;addRight();
                } else { addRight()  }
            }   
        }

        var count = (right+1) - left

        for (var i = 0; i < count; i++) {
            var po = {pn:i+left}
            if(i+left==pageInfo.pn) { po.active = true}
            pageInfo.pagination.push(po)
        };
        return ;
    },
    genPills : function(pageInfo,ctrl){

        var pillObj  = [];
        var params = ctrl.pageParams();
        if(params.q!=""){
            pillObj.push({param : "q",value: params.q})
        }
        return pillObj;
    },
    comboArray : function(extra){
        $(extra.div).append('<option value="" disabled selected>'+extra.placeholder+'</option>')
        for (var a in extra.arr){
            $(extra.div).append('<option value="'+ extra.arr[a][extra.value] +'">' + extra.arr[a][extra.label] +'</option>')
        }
        if(extra.defaultVal!=null){
            $(extra.div).val(extra.defaultVal);
        }
    }
    
}


var loaderC = '<div class="sk-circle">'+
        '<div class="sk-circle1 sk-child"></div> '+
        '<div class="sk-circle2 sk-child"></div>'+
        '<div class="sk-circle3 sk-child"></div>'+
        '<div class="sk-circle4 sk-child"></div>'+
        '<div class="sk-circle5 sk-child"></div>'+
        '<div class="sk-circle6 sk-child"></div>'+
        '<div class="sk-circle7 sk-child"></div>'+
        '<div class="sk-circle8 sk-child"></div>'+
        '<div class="sk-circle9 sk-child"></div>'+
        '<div class="sk-circle10 sk-child"></div>'+
        '<div class="sk-circle11 sk-child"></div>'+
        '<div class="sk-circle12 sk-child"></div>'+
      '</div>';

/**********************************************************
*	TEMPLATE RENDERER
***********************************************************/
var template = {
	render: function(template,output,data,callback,append){
		var options = {
		  el: output,
		  template:  template,
		  data : data,
		  append : append || false,
          //magic: true,
		}
		// BIND HELPERS
		for (var a in rh){
			options.data[a] = rh[a];
		}
		var ractive = new Ractive(options);
		// IF CALLBACK
		if(callback) { callback()};
		return ractive;
	},
  
}

/**********************************************************
*	DATABASE CONTROLLER
***********************************************************/
var dbC = {
	query : function(url,type,params,callback,extra,context){
		jQuery.support.cors = true;
		loader.init(1);
		 $.ajax({
	        method : type,
	        context : context || this,
	        data: JSON.stringify(params) || "",
    		contentType: 'application/json',
	        url: url,
	        xhrFields: { withCredentials: true},
	        dataType: 'json'
	        }).done(function( response ) {
	        	loader.doProgress();
        		if(callback) { callback(response,extra) }
	        }).fail(function( response ) {
	           	// TO Do check session and reject conn
	           	console.log(response)
	           //	ctrl_user.rejectConn();
	    }); 
	}
}


/**********************************************************
*	REACTIVE HANDLERS
***********************************************************/
var rh = {
	// CONVERTIR FORMATO 
	timeConverter : function(value){
		return utils.timeConverter(value);
	},
	// CORRRECT CASE 
	cCase  : function(str){
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	},
	// MOmento F
	momentoCal : function(val){
	  moment.locale('es');
      var cal = moment.unix(val,'DD/MM/YYYY, h:mm:ss a','es').calendar();
      return  cal;
	},
    momentDate : function(val){
      moment.locale('es');
      var cal = moment(val).lang("es").calendar();
      console.log(cal,"CAL")
      return  cal;
    },
	sort: function ( list, property ) {
      return list.slice().sort( function ( a, b ) {
        return a[ property ] < b[ property ] ? -1 : 1;
      });
    },
    reverseA: function (arr ) {
      return arr.reverse()
    },
    // Format
    distancia : function(val){
        var km = val / 1000; 
        return km.toFixed(1);
    },
    tiempo : function(a){
          var hours = Math.trunc(a/60);
          var minutes = a % 60;
        
         return hours +":"+ (Math.ceil(minutes * 100)/100).toFixed(2);

    },
    moneda : function(val){
       return  "$" + Number(val).formatMoney(2, '.', ',');
    },
    imgclass : function(val){
        var item = JSON.search(categorias,'//*[id='+val+']');
        return '<img class="imgUnidadesList" src="'+ item[0].icon +'">';
    },
    pad : function(num) {
    var s = num+"";
    while (s.length < 2) s = "0" + s;
    return s;
    },
    check : function(items,id){
        console.log(items,id)
        for (var i = 0; i < items.length; i++) {
                if(items[i].id==id){
                    return 'checked';
                }
        }
    },
    // set disabled on extras
    checkD : function(items,id){
        for (var i = 0; i < items.length; i++) {
                if(items[i].id==id){
                    return '';
                }
        }
        return 'disabled';
    },
    checkIndex: function(items,id){
        for (var i = 0; i < items.length; i++) {
             console.log('encontro',items[i].id,id)
                if(items[i].id==id){
                    console.log('data.servicios.'+ i+ ".val")
                    return 'data.servicios.'+ i+ ".val";
                }
        }
    },
    setIVal : function(items,id){
         for (var i = 0; i < items.length; i++) {
                if(items[i].id==id){
                    return items[i].val;
                }
        }
    },
    // ultimo día de oferta
    validaH : function(fechas){
        var fechaI = {};
        for (var i = 0; i < fechas.length; i++) {
            if(fechas[i].tipo){
                fechaI= fechas[i].dia + " " + fechas[i].numDia + " " + fechas[i].abrMes 
            }
        }
        return fechaI;
    }

}


var loader = {
	loadedSize : 0,
	number_of_media : 0,
	init : function(numItems){
		$("#progressBar").width('0%').css({opacity:1});
		loader.loadedSize = parseFloat(0);
		loader.number_of_media = parseFloat(numItems);

	},
	doProgress : function(){
		loader.loadedSize++;
		var newWidthPercentage = (parseFloat(loader.loadedSize) / parseFloat(loader.number_of_media)) * 100;
		 loader.animateLoader(newWidthPercentage + '%');
	},
	animateLoader : function(newWidth){
		$("#progressBar").width(newWidth);
		 if(loader.loadedSize>=loader.number_of_media){
			 setTimeout(function(){
			 $("#progressBar").animate({opacity:0});
			 },300);
		 }
		 
	}
}



// Create a jGrowl
window.createGrowl = function(title,text,persistent,bgClass,id,time) {
    var target = $('.qtip.jgrowl:visible:last');

    if(id){
         var item = '<div id ="'+ id +'"></div>';
         $('#qtip-growl-container').append(item);
         item = '#' + id;
    }else{
        var item = '<div/>';
    }  

    var qtipObj = $(item).qtip({
        content: {
            text: text,
            title: {
               // text: title,
                button: $('<div class="closeGrowl"><div class="closeIco">x</div></div>')
            }
        },
        position: {
            target: [0,0],
            container: $('#qtip-growl-container')
        },
        show: {
            event: false,
            ready: true,
            effect: function() {
                $(this).stop(0, 1).animate({ opacity: 'toggle' }, 100, 'swing');
            },
            delay: 0,
            persistent: persistent
        },
        hide: {
            event: false,
            effect: function(api) {
                $(this).stop(0, 1).animate({ opacity: 'toggle' }, 100, 'swing');
            }
        },
        style: {
            width: 250,
            classes: 'qtip-light qtip-shadow qtip-rounded ' + bgClass,
            tip: false
        },
        events: {
            render: function(event, api) {

                if(!api.options.show.persistent) {
                    $(this).bind('mouseover mouseout', function(e) {
                        var lifespan = time || 3000;

                        clearTimeout(api.timer);
                        if (e.type !== 'mouseover') {
                            api.timer = setTimeout(function() { api.hide() }, lifespan);
                        }
                    })
                    .triggerHandler('mouseout');
                }
            } 
        }
    });

    return qtipObj
}



// Create a jGrowl
window.createAlertDiv = function(target,title,text,persistent,bgClass,customClass) {

    var target = $(target);
    
    var qtipObj = $('<div />').qtip({
        content: {
            text: '<div class="alCont">'+ text  +'</div>',
            title: {
               // text: title,
                //button: $('<div class="closeGrowl"><div class="closeIco">x</div></div>')
            }
        },
        position: {
            at: 'top left',  // Position my top left..
            target: target,
            container: target
        },
        show: {
            event: false,
            ready: true,
            effect: function() {
                $(this).stop(0, 1).animate({ opacity: 'toggle' }, 200, 'swing');
            },
            delay: 0,
            persistent: persistent
        },
        hide: {
            event: false,
            effect: function(api) {
                $(this).stop(0, 1).animate({ opacity: 'toggle' }, 200, 'swing');
            }
        },
        style: {
            width: "100%",
            classes: 'qtip-light qtip-shadow qtip-rounded ' + bgClass + ' ' + customClass,
            tip: false
        },
        events: {
            render: function(event, api) {
                if(!api.options.show.persistent) {
                    $(this).bind('mouseover mouseout', function(e) {
                        var lifespan = 5000;

                        clearTimeout(api.timer);
                        if (e.type !== 'mouseover') {
                            api.timer = setTimeout(function() { api.hide(e) }, lifespan);
                        }
                    })
                    .triggerHandler('mouseout');
                }
            } 
        }
    });

    return qtipObj
}

window.createModal = function(html){
    $('#modal').qtip({
                    content: {
                        text: html,
                        //button : true
                    },
                    position: {
                         my: 'top center',
                          at: 'top center',
                        target: $(window),
                        adjust : {
                            scroll: false,
                            y : 60
                        }
                    },
                  
                    show: {
                        ready: true,
                        modal: true
                    },
                    hide: false,
                    style: {
                        classes: 'qtip-light qtip-shadow qtip-rounded qtip-modal',
                        tip : false
                    },
                     events: {
        render: function(event, api) {
            // Grab the overlay element
            var elem = api.elements.overlay;
        }
    }
                }); 
}

window.createPopAction = function(html,target){
     var target = $(target);
    
    var qtipObj = $('<div />').qtip({
        content: html,
        position: {
            viewport : $(window),
            at: 'center right',  // Position my top left..
            target: target,
            container: target,
            my : "center left"
        },
        show: {
            
            ready: true,
            effect: function() {
                $(this).stop(0, 1).animate({ opacity: 'toggle' }, 200, 'swing');
            },
            delay: 0,
            persistent: true
        },
        hide: {
            event: 'unfocus click',
           fixed : true
        },
        style: {
            classes: 'qtip-light qtip-shadow qtip-rounded ',
            tip: true
        },
        events: {
            render: function(event, api) {
                if(!api.options.show.persistent) {
                    $(this).bind('mouseover mouseout', function(e) {
                        var lifespan = 5000;

                        clearTimeout(api.timer);
                        if (e.type !== 'mouseover') {
                            api.timer = setTimeout(function() { api.hide(e) }, lifespan);
                        }
                    })
                    .triggerHandler('mouseout');
                }
            } 
        }
    });

    return qtipObj
}



function exportToExcel(tbl,fileName){
var htmls = tbl;
            var uri = 'data:application/vnd.ms-excel;base64,';
            var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'; 
            var base64 = function(s) {
                return window.btoa(unescape(encodeURIComponent(s)))
            };

            var format = function(s, c) {
                return s.replace(/{(\w+)}/g, function(m, p) {
                    return c[p];
                })
            };


            var ctx = {
                worksheet : 'Worksheet',
                table : htmls
            }


            var link = document.createElement("a");
            link.download = fileName + ".xls";
            link.href = uri + base64(format(template, ctx));
            link.click();
}

function setMasks(){


    Inputmask.extendDefaults({
          'autoUnmask': true
        });
        Inputmask.extendDefinitions({
          'A': {
            validator: "[A-Za-z0-9\u0410-\u044F\u0401\u0451\u00C0-\u00FF\u00B5 ]",
            cardinality: 1,
            casing: "upper", //auto uppercasing
            skipOptionalPartCharacter: " "
          },
          '+': {
            validator: "[0-9A-Za-z\u0410-\u044F\u0401\u0451\u00C0-\u00FF\u00B5 ]",
            cardinality: 1,
            casing: "upper"
          },
          'B': {
            validator: "[0-9A-Za-z-\u0410-\u044F\u0401\u0451\u00C0-\u00FF\u00B5 ]",
            cardinality: 1,
            casing: "upper",
            skipOptionalPartCharacter: "-"
          },
          'C': {
            validator: "[.0-9A-Za-z-\u0410-\u044F\u0401\u0451\u00C0-\u00FF\u00B5.-_ ]",
            cardinality: 1,
            casing: "lower",
            skipOptionalPartCharacter: ""
          }
        });

   $(":input").inputmask();

        

}

function setSliders(rObj,update){


    $('[data-slider]').each(function(){
        function d(a,b){
            return parseFloat(a.attr(b) || a.attr('data-'+b));
        }



        var
        rac = $(this).attr('data-rac')
        ,min = d($(this),'min') || 0
        ,max = d($(this),'max')
        ,step = d($(this),'step')
        ,value = d($(this),'value')
        ,start = d($(this),'start') || 0
        ,range = !isNaN(min) && !isNaN(max) ? { 'min': min, 'max': max } : { 'min': 0, 'max': 100 }
        ,start = !isNaN(value) ? value : start
        ,settings = {
             range: range
            ,step: !isNaN(step) ? step : 1
            ,start: start
            ,connect: "upper"
            ,serialization: {
                resolution: 1
            }
        };

        if(update){
            try{
                $(this)[0].noUiSlider.destroy();
            } catch (e) {} 
           
         //$(this)[0].destroy();
        }


        var ui = noUiSlider.create($(this)[0],settings);
        ui.on('update', function(e){
           rObj.set('data.'+rac,parseFloat(e))
        });

       

    });
}


function setPops(){
       $('.popInfoCont').qtip({
        content: $(this).attr('title'),
        position: {
            at: 'top right',  // Position my top left..
            my : "top left",
            adjust : {
                          x: 5,
                      
                        }
        },
        show: {  
           effect: function(offset) {
            $(this).fadeIn(200); // "this" refers to the tooltip
          }
        },
        hide: {
        event: 'mouseleave',
        },
        style: {
            classes: 'qtip-light qtip-shadow qtip-rounded qtipInfo',
            tip: false
        },
       
    });

    }

// EMBEDED LIBS -------------------------------------------------


/*!
    Autosize 4.0.0
    license: MIT
    http://www.jacklmoore.com/autosize
*/
!function(e,t){if("function"==typeof define&&define.amd)define(["exports","module"],t);else if("undefined"!=typeof exports&&"undefined"!=typeof module)t(exports,module);else{var n={exports:{}};t(n.exports,n),e.autosize=n.exports}}(this,function(e,t){"use strict";function n(e){function t(){var t=window.getComputedStyle(e,null);"vertical"===t.resize?e.style.resize="none":"both"===t.resize&&(e.style.resize="horizontal"),s="content-box"===t.boxSizing?-(parseFloat(t.paddingTop)+parseFloat(t.paddingBottom)):parseFloat(t.borderTopWidth)+parseFloat(t.borderBottomWidth),isNaN(s)&&(s=0),l()}function n(t){var n=e.style.width;e.style.width="0px",e.offsetWidth,e.style.width=n,e.style.overflowY=t}function o(e){for(var t=[];e&&e.parentNode&&e.parentNode instanceof Element;)e.parentNode.scrollTop&&t.push({node:e.parentNode,scrollTop:e.parentNode.scrollTop}),e=e.parentNode;return t}function r(){var t=e.style.height,n=o(e),r=document.documentElement&&document.documentElement.scrollTop;e.style.height="";var i=e.scrollHeight+s;return 0===e.scrollHeight?void(e.style.height=t):(e.style.height=i+"px",u=e.clientWidth,n.forEach(function(e){e.node.scrollTop=e.scrollTop}),void(r&&(document.documentElement.scrollTop=r)))}function l(){r();var t=Math.round(parseFloat(e.style.height)),o=window.getComputedStyle(e,null),i="content-box"===o.boxSizing?Math.round(parseFloat(o.height)):e.offsetHeight;if(i!==t?"hidden"===o.overflowY&&(n("scroll"),r(),i="content-box"===o.boxSizing?Math.round(parseFloat(window.getComputedStyle(e,null).height)):e.offsetHeight):"hidden"!==o.overflowY&&(n("hidden"),r(),i="content-box"===o.boxSizing?Math.round(parseFloat(window.getComputedStyle(e,null).height)):e.offsetHeight),a!==i){a=i;var l=d("autosize:resized");try{e.dispatchEvent(l)}catch(e){}}}if(e&&e.nodeName&&"TEXTAREA"===e.nodeName&&!i.has(e)){var s=null,u=e.clientWidth,a=null,c=function(){e.clientWidth!==u&&l()},p=function(t){window.removeEventListener("resize",c,!1),e.removeEventListener("input",l,!1),e.removeEventListener("keyup",l,!1),e.removeEventListener("autosize:destroy",p,!1),e.removeEventListener("autosize:update",l,!1),Object.keys(t).forEach(function(n){e.style[n]=t[n]}),i.delete(e)}.bind(e,{height:e.style.height,resize:e.style.resize,overflowY:e.style.overflowY,overflowX:e.style.overflowX,wordWrap:e.style.wordWrap});e.addEventListener("autosize:destroy",p,!1),"onpropertychange"in e&&"oninput"in e&&e.addEventListener("keyup",l,!1),window.addEventListener("resize",c,!1),e.addEventListener("input",l,!1),e.addEventListener("autosize:update",l,!1),e.style.overflowX="hidden",e.style.wordWrap="break-word",i.set(e,{destroy:p,update:l}),t()}}function o(e){var t=i.get(e);t&&t.destroy()}function r(e){var t=i.get(e);t&&t.update()}var i="function"==typeof Map?new Map:function(){var e=[],t=[];return{has:function(t){return e.indexOf(t)>-1},get:function(n){return t[e.indexOf(n)]},set:function(n,o){e.indexOf(n)===-1&&(e.push(n),t.push(o))},delete:function(n){var o=e.indexOf(n);o>-1&&(e.splice(o,1),t.splice(o,1))}}}(),d=function(e){return new Event(e,{bubbles:!0})};try{new Event("test")}catch(e){d=function(e){var t=document.createEvent("Event");return t.initEvent(e,!0,!1),t}}var l=null;"undefined"==typeof window||"function"!=typeof window.getComputedStyle?(l=function(e){return e},l.destroy=function(e){return e},l.update=function(e){return e}):(l=function(e,t){return e&&Array.prototype.forEach.call(e.length?e:[e],function(e){return n(e,t)}),e},l.destroy=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],o),e},l.update=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],r),e}),t.exports=l});