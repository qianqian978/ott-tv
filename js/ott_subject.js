var OTT_POSITION_INDEX = sessionStorage.getItem('OTT_POSITION_INDEX') || null;

var OTT_ROOT = FocusEngine.render();

var OTT_MENU = OTT_ROOT.getWidgetById('ott-widget-menu');
var OTT_INDEX_LIST = OTT_ROOT.getWidgetById('ott-widget-indexlist');
var OTT_MENU_CACHE = {};

var timeout1,timeout2;

if(OTT_POSITION_INDEX){
	var position_index = JSON.parse(OTT_POSITION_INDEX);
	var default_node = OTT_ROOT.getWidgetById(position_index.nodeId);
	default_node.focus();
}else{
    OTT_INDEX_LIST.childWidgets[0].childWidgets[0].focus();
}

OTT_MENU.on('switchend', function(e){
    var node = e.currentTarget.getFocusedChildWidget();
    var jumpId = node.con.dataset.tag;

    if(e.keyCode == 39){
        var cacheNode = OTT_ROOT.getWidgetById(jumpId);
        if(cacheNode){
            OTT_INDEX_LIST.setCachedChildWidget(cacheNode);
        }
        OTT_INDEX_LIST.focus()
    }
});

var OTT_MENU_LIST = OTT_MENU.childWidgets;
for(var i=0;i<OTT_MENU_LIST.length;i++){
    var jumpId = OTT_MENU_LIST[i].con.dataset.tag;
    OTT_MENU_CACHE[jumpId] = OTT_MENU_LIST[i];

    OTT_MENU_LIST[i].on('focus',function(e){
        var cacheNode = OTT_ROOT.getWidgetById(jumpId);
        if(cacheNode){
            OTT_INDEX_LIST.scrollToWidget(cacheNode);
        }
    })
}


OTT_INDEX_LIST.on('switchend', function(e){
    if(e.keyCode == 37){
        var mod = OTT_INDEX_LIST.getFocusedChildWidget();
        if(OTT_MENU_CACHE[mod.con.id]){
            OTT_MENU_CACHE[mod.con.id].focus()
        }else{
            OTT_MENU.focus()
        }
    }
});

var OTT_INDEX_CHILDS = OTT_INDEX_LIST.childWidgets;
for(var i=0;i<OTT_INDEX_CHILDS.length;i++){
    var node = OTT_INDEX_CHILDS[i];  
    handleLeafNode(node)
}

function handleLeafNode(node){
    if(node.childWidgets.length > 0){
        var childNodes = node.childWidgets;
        for(var j=0;j<childNodes.length;j++){
            var leafNode = childNodes[j];
            handleLeafNode(leafNode)
        }
    }else{
        var scroll_div = node.con.getElementsByClassName('ott-bookListTitle')[0];
        var scroll_title = node.con.getElementsByClassName('ott-bookListTitle')[0].getElementsByClassName('scroll-title')[0];
        var div_width = scroll_div.clientWidth;
        var span_width = scroll_title.clientWidth;
        node.on('focus',function(){
            loopTitle(div_width - span_width,'focus',node);
        });
        node.on('blur',function(){
            loopTitle(div_width - span_width,'blur',node);
        });
        node.on('ok',function(){
            var dom= node.con;
            var link = dom.getElementsByTagName('a')[0].href;
            var type = dom.getElementsByTagName('a')[0].dataset.type;
            if(type == 7){
                //window.ott_UES.openUES(link);
                var session_id = 'OTT_DETAIL_'+dom.dataset.cid;

               if(sessionStorage.getItem(session_id)){sessionStorage.removeItem(session_id)}
                window.location.href = link;
            }else{
                window.ott_UES.go(link);
            }
        });
    }
}

function loopTitle(w, type,node){
    var scroll_title = node.con.getElementsByClassName('ott-bookListTitle')[0].getElementsByClassName('scroll-title')[0];
    if(w < 0 && type == 'focus'){
		var t = Math.abs( Math.ceil(w / 10) );
		var effect = 'transition-duration:'+t+'s;transition-timing-function:linear;-webkit-transition-duration:'+t+'s;transition-timing-function:linear;';
		effect += 'transform:translateX('+ w +'px);-webkit-transform:translateX('+ w +'px);';
		scroll_title.setAttribute('style',effect);
		timeout1 = setTimeout(function(){
	     scroll_title.setAttribute('style','transition:0;transform:translateX(0px);transition-property:transform;-webkit-transition:0;-webkit-transform:translateX(0px);-webkit-transition-property:transform;');
	},t*1000 + 500);
	timeout2 = setTimeout(function(){loopTitle(w,type,node)},t*1000 + 1000);
    }else{
        scroll_title.setAttribute('style','');
        clearTimeout(timeout1);
        clearTimeout(timeout2);
    }
}
/**
 * 当页面关闭时存储当前位置
 */
window.onunload = function(){
	if(!OTT_ROOT) return;

	var focused_node = OTT_ROOT.getFocusedLeaf();
	var cache = {
		nodeId:focused_node.con.id
	}

	sessionStorage.setItem('OTT_POSITION_INDEX',JSON.stringify(cache))
}
