/**
 * Created by vlyamzin on 7/3/13.
 */

/*Image object*/
function Image(options){
    var imageObject = document.createElement('span'),
        imageTag = imageObject.getElementsByTagName('img'),
        visible = document.createAttribute('class'),
        style = document.createAttribute('style'),
        realWidth, realHeight,
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

    this.setImageParams = function(source){
        if(source != ''){
            style.nodeValue = 'left:'+settings.xCoord+'px; top:'+settings.yCoord+'px; opacity:'+settings.opacity+';';
            imageObject.setAttributeNode(style);
            imageTag[0].setAttribute('src', source);
            realWidth = imageTag[0].offsetWidth;
            realHeight = imageTag[0].offsetHeight;

            //scale image from saved settings
            imageTag[0].style.width = realWidth * settings._scale + 'px';
            imageTag[0].style.height = realHeight * settings._scale + 'px';
        }
    };

    this.getImageParams = function(){
        return imageTag[0].getAttribute('src');
    };

    this.createDomElem = function(){
        imageObject.setAttribute('id', id);
        imageObject.innerHTML = ['<img class="thumb" />'].join('');
        this.setVisibility(true);
        document.body.appendChild(imageObject);
    };

    this.removeDomeElem = function(){
        document.body.removeChild(imageObject);
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

    this.setScale = function(value){
        if(realWidth || realHeight){
            imageTag[0].style.width = realWidth * value + 'px';
            imageTag[0].style.height = realHeight * value + 'px';
        }
        settings._scale = value;
    }

    this.getSettings = function(){
        return settings;
    };
}
/*Modal window object*/
function WpWindow(){
    var popup_window_template =
        '<header id="wp-header">' +
            '<p>Aligner</p>'+
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
                '<input type="number" id="scale" min="0.1" max="5" step="0.1"/>'+
                '<label for="scale">Scale</label>'+
            '</div>'+
            '<button id="change-visibility" disabled="disabled">Hide</button>' +
            '<input type="file" id="add-img"/>' +
        '</main>';
    var contVisibility = document.createAttribute('class');
    var flag = true;
    var image;
    var that = this;
    var key = getURL();     //keyname for local storage. generated from url

    var position = {
        top: '10px',
        left: '10px'
    };

    function getURL(){
        var currentURL = document.createElement('a');
        currentURL.href = document.URL;
        return currentURL.pathname;
    }


    this.saveSettings = function(){
        //if function return Image Object
        if(!this.getImageObject() === false){
            localStorage.setItem(key+'wp-image-settings', JSON.stringify(this.getImageObject().getSettings()));
            localStorage.setItem(key+'wp-image-src', JSON.stringify(this.getImageObject().getImageParams()));
        }
    };

    this.loadSettings = function(){
        return JSON.parse(localStorage.getItem(key+'wp-image-settings'));
    };

    this.loadImgFromStorage = function(){
        var imgSourse = JSON.parse(localStorage.getItem(key+'wp-image-src'));
        if(imgSourse){
            document.getElementById('change-visibility').disabled = false;
            return imgSourse;
        }
        else{
            return '';  //blank source path;
        }
    }

    this.deleteWindow = function(){
        var el = $('wp-window');
        var image = $('thumb-img');

        this.saveSettings();
        if(el){
            el.parentNode.removeChild(el);
        }
        if(image){
            image.parentNode.removeChild(image);
        }
        image = null;
        that = null;
    };

    this.addWindow = function(){
        var window = $('wp-window');
        if(window){
            this.deleteWindow();
        }
        this.loadWindowPosition();
        var el = document.createElement('div');
        image = new Image(this.loadSettings());
        el.setAttribute("id", "wp-window");
        el.setAttribute("style", "top:"+position.top+"; left: "+position.left+";");
        el.innerHTML = popup_window_template;
        document.body.appendChild(el);

        image.createDomElem();
        image.setImageParams(this.loadImgFromStorage());

        (function(theImage){
            var settings = theImage.getSettings();
            document.getElementById('x-coord').value = settings.xCoord;
            document.getElementById('y-coord').value = settings.yCoord;
            document.getElementById('opacity').value = settings.opacity * 100;
            document.getElementById('scale').value = settings._scale;
        })(image);



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
    };

    this.saveWindowPosition = function(top, left){
        if(top || left){
            position.top = top;
            position.left = left;
        }
        localStorage.setItem(key+'wp-window-settings', JSON.stringify(position));
    };

    this.loadWindowPosition = function(){
        var settings = JSON.parse(localStorage.getItem(key+'wp-window-settings'));
        if(settings == null){
            position.top = '10px';
            position.left = '10px';
        }
        else{
            position = settings;
        }
    };

    this.uploadImage = function(event, callback){
        var files = event.target.files; // FileList Object
        image.removeDomeElem();
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
                    image.setImageParams(e.target.result);
                    document.getElementById('change-visibility').disabled = false;

                    //file reader is asynchronous function
                    //it needs callback in some way
                    if(callback){
                        callback();
                    }
                }
            })(f);

            reader.readAsDataURL(f);
        }
    };

    this.getImageObject = function(){
        if(image){
            return image;
        }
        else{
            return false;
        }
    };

    this.addWindow();
}

var _window = new WpWindow();


function visibilityHandler(){
    if(_window.getImageObject().getVisibility() == 'visible'){
        _window.getImageObject().setVisibility(false);
    }
    else{
        _window.getImageObject().setVisibility(true);
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
    var el = $('wp-window');
    return {
        move : function(divid,xpos,ypos){
            $(divid).style.left = xpos + 'px';
            $(divid).style.top = ypos + 'px';
        },
        startMoving : function(evt){
            evt = evt || window.event;
            if(evt.target == "span") { return }
            var posX = evt.clientX,
                posY = evt.clientY,
                divTop = el.style.top,
                divLeft = el.style.left;
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
            document.onmousemove = function(){}
            _window.saveWindowPosition(el.style.top, el.style.left);
        }
    }
}();


//handlers for inputs and buttons
$('add-img').addEventListener('change', function(event){
    _window.uploadImage(event, function(){
        _window.saveSettings();
    });

}, false);
$('x-coord').addEventListener('change', function(){
    var xValue = this.value;
    if(xValue){
        _window.getImageObject().move(xValue, 'x');
        _window.saveSettings();
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
        _window.getImageObject().move(yValue, 'y');
        _window.saveSettings();
    }
}, false);
$('opacity').addEventListener('change', function(){
    _window.getImageObject().setOpacity(this.value/100);
    _window.saveSettings();
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
    _window.deleteWindow();
}, false);
$('close').addEventListener('touchstart', function(e){
    e.preventDefault();
    this.click();
    return false;
}, false);
$('scale').addEventListener('change', function(){
    _window.getImageObject().setScale(this.value);
    _window.saveSettings();
});
