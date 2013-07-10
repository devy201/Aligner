/**
 * Created by vlyamzin on 7/3/13.
 */

/*Image object*/
function Image(options){
    var imageObject = document.createElement('span'),
        imageTag = imageObject.getElementsByTagName('img'),
        visible = document.createAttribute('class'),
        style = document.createAttribute('style'),
        //xCoord = 0, yCoord = 0, opacity = 0.5,
        id = "thumb-img";

    var settings = {
        xCoord: options ? options.xCoord : 0,
        yCoord: options ? options.yCoord : 0,
        opacity: options ? options.opacity : 0.5,
        _scale: options ? options._scale : 1
    };

    this.setVisibility = function(isVisible){
        if(isVisible){
            visible.nodeValue = 'visible';
        }
        else{
            visible.nodeValue = 'invisible';
        }
        imageObject.setAttributeNode(visible);
    };

    this.getVisibility = function(){
        return imageObject.getAttribute('class');
    };

    this.setImageSrc = function(source){
        imageTag[0].setAttribute('src', source)
    };

    this.createDomElem = function(){
        imageObject.setAttribute('id', id);
        imageObject.innerHTML = ['<img class="thumb" />'].join('');
        this.setVisibility(true);
        document.body.appendChild(imageObject);
    };

    this.move = function(value, direction){
        if(direction === "x"){
            settings.xCoord = value || 0;
        }
        else if(direction === 'y'){
            settings.yCoord = value || 0;
        }
        style.nodeValue = 'left:'+settings.xCoord+'px; top:'+settings.yCoord+'px; opacity:'+settings.opacity+';';
        imageObject.setAttributeNode(style);
    };

    this.setOpacity = function(value){
        if(value > 0){
            settings.opacity = value;
        }
        style.nodeValue = 'left:'+settings.xCoord+'px; top:'+settings.yCoord+'px; opacity:'+settings.opacity+';';
        imageObject.setAttributeNode(style);
    };

    this.saveSettings = function(){
        sessionStorage.setItem('wpSettings', JSON.stringify(settings));
    };

    console.log(settings);
}
/*Modal window object*/
function WpWindow(){
    var popup_window_template =
        '<header id="wp-header">' +
            '<p>Well Pixel</p>'+
            '<span id="close" class="icon"></span>'+
            '<span id="minimize" class="icon"></span>'+
        '</header>'+
        '<main id="wp-content">' +
            '<div class="line">'+
                '<input type="number" id="x-coord"/>'+
                '<label for="x-coord">X coord (px)</label>'+
            '</div>'+
            '<div class="line">'+
                '<input type="number" id="y-coord">' +
                '<label for="y-coord">Y coord (px)</label>'+
            '</div>'+
            '<div class="line">'+
                '<input type="number" id="opacity" min="0" max="100">' +
                '<label for="opacity">Opacity (%)</label>'+
            '</div>'+
            '<div class="line">'+
                '<input type="number" id="scale" min="0.01" max="5" step="0.1"/>'+
                '<label for="scale">Scale</label>'+
            '</div>'+
            '<button id="change-visibility" disabled="disabled">Hide</button>' +
            '<input type="file" id="add-img"/>' +
        '</main>';
    var contVisibility = document.createAttribute('class');
    var flag = true;

    this.deleteWindow = function(){
        var el = $('wp-window');
        var image = $('thumb-img');
        if(el){
            el.parentNode.removeChild(el);
        }
        if(image){
            image.parentNode.removeChild(image);
        }
    };

    this.addWindow = function(){
        var window = $('wp-window');
        if(window){
            this.deleteWindow();
        }
        var el = document.createElement('div');
        el.setAttribute("id", "wp-window");
        el.setAttribute("style", "top: 10px; left: 10px;")
        el.innerHTML = popup_window_template;
        document.body.appendChild(el);

        var minimize = document.getElementById('minimize');
        var close = document.getElementById('close');
        var iconUrl = chrome.extension.getURL("glyphicons-halflings.png");
        minimize.setAttribute('style', 'background-image: url('+iconUrl+')');
        close.setAttribute('style', 'background-image: url('+iconUrl+')');
    };

    this.minimizeWindow = function(){
        var content = $('wp-content');
        if(flag){
            contVisibility.nodeValue = 'minimized';
            flag = false;
        }
        else{
            contVisibility.nodeValue = '';
            flag = true;
        }
        content.setAttributeNode(contVisibility);
    }

    this.uploadImage = function(event){
        var files = event.target.files; // FileList Object
        image.createDomElem();

        for (var i = 0, f; f = files[i]; i++){

            //prevent function if not image
            if(!f.type.match('image.*')){
                continue;
            }

            var reader = new FileReader();

            //closure to capture file information
            reader.onload = (function(theFile){
                return function(e){
                    //render image
                    /*var span = document.createElement('span');
                     span.setAttribute('id', 'thumb-img');
                     span.setAttribute('style', 'display: block');
                     span.innerHTML = ['<img class="thumb" src="', e.target.result, '" title="', escape(theFile.name), '"/>'].join('');
                     document.body.appendChild(span);*/
                    image.setImageSrc(e.target.result);
                    document.getElementById('change-visibility').disabled = false;

                }
            })(f);

            reader.readAsDataURL(f);
        }
    };

    this.loadSettings = function(){
        return JSON.parse(sessionStorage.getItem('wpSettings'));
    }

    this.addWindow();
}

var _window = new WpWindow();
var image = new Image(_window.loadSettings());


function visibilityHandler(){
    if(image.getVisibility() == 'visible'){
        image.setVisibility(false);
    }
    else{
        image.setVisibility(true);
    }
    if(this.innerHTML === "Show") this.innerHTML = 'Hide';
    else this.innerHTML = "Show";
}

function $(el){
    return document.getElementById(el);
}

//code for dragging element
// Coded by TheZillion in a quarter of an hour. [thezillion.wordpress.com]

var tzdragg = function(){
    return {
        move : function(divid,xpos,ypos){
            var a = $(divid);
            $(divid).style.left = xpos + 'px';
            $(divid).style.top = ypos + 'px';
        },
        startMoving : function(evt){
            evt = evt || window.event;
            if(evt.target == "span") { return }
            var posX = evt.clientX,
                posY = evt.clientY,
                a = $('wp-window'),
                divTop = a.style.top,
                divLeft = a.style.left;
            divTop = divTop.replace('px','');
            divLeft = divLeft.replace('px','');
            var diffX = posX - divLeft,
                diffY = posY - divTop;
            document.onmousemove = function(evt){
                evt = evt || window.event;
                var posX = evt.clientX,
                    posY = evt.clientY,
                    aX = posX - diffX,
                    aY = posY - diffY;
                tzdragg.move('wp-window',aX,aY);
            }
        },
        stopMoving : function(){
            var a = document.createElement('script');
            document.onmousemove = function(){}
        }
    }
}();


//handlers for inputs and buttons
$('add-img').addEventListener('change', function(event){
    _window.uploadImage(event);
}, false);
$('x-coord').addEventListener('change', function(){
    var xValue = this.value;
    if(xValue){
        image.move(xValue, 'x');
    }
}, false);
$('change-visibility').addEventListener('click', visibilityHandler, false);
$('change-visibility').addEventListener('touchstart', function(e){
    e.preventDefault();
    this.click();
    return false;
}, false);
$('y-coord').addEventListener('change', function(){
    var yValue = this.value;
    if(yValue){
        image.move(yValue, 'y');
    }
}, false);
$('opacity').addEventListener('change', function(){
    image.setOpacity(this.value/100);
}, false);

$('wp-header').addEventListener('mousedown', tzdragg.startMoving, false);
$('wp-header').addEventListener('touchstart', tzdragg.startMoving, false);
$('wp-header').addEventListener('mouseup', tzdragg.stopMoving, false);
$('wp-header').addEventListener('touchend', tzdragg.stopMoving, false);
$('minimize').addEventListener('click', _window.minimizeWindow, false);
$('minimize').addEventListener('touchstart', function(e){
    e.preventDefault();
    this.click();
    return false;
}, false);
$('close').addEventListener('click', function(){
    image.saveSettings();
    _window.deleteWindow();
    _window = null;
    image = null;
}, false);
$('close').addEventListener('touchstart', function(e){
    e.preventDefault();
    this.click();
    return false;
}, false);
