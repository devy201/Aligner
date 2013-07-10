

chrome.browserAction.onClicked.addListener(function(tab){
    console.log('Turning ' + tab.url + ' red!');
    chrome.tabs.executeScript(null, {file: "content.js"});
    chrome.tabs.insertCSS(null, {file: "wp_style.css"});
});