var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var { MatchPattern } = require("sdk/util/match-pattern");
var contextMenu = require("sdk/context-menu");
var Windows = require("sdk/windows").browserWindows;
var data = require("sdk/self").data; //data.folder?
var { open } = require('sdk/window/utils');//low-level api not working
var { getActiveView }=require("sdk/view/core");

var url_pattern = new MatchPattern(/https:\/\/www\.youtube\.com\/watch.*/);


// Construct a panel, loading its content from the "hover-tube.html"
// file in the "data" directory, and loading the "get-text.js" script
// into it.
var hover_tube = require("sdk/panel").Panel({
  id:'hover-tube',
  width: 320,
  height: 240,
  anchor: null, 
  noautohide: true,
  backdrag: true,
  position: {'bottom': 40, 'right': 25},
  contentURL: data.url("hover-tube.html"),
  contentScriptFile: [ data.url("jquery.js"), data.url("migrate.js"), data.url("hover-tube.js") ]
});
getActiveView(hover_tube).setAttribute("noautohide", true);
getActiveView(hover_tube).setAttribute("titlebar", "normal");
getActiveView(hover_tube).setAttribute("backdrag", true);
getActiveView(hover_tube).setAttribute("level", 'parent');
getActiveView(hover_tube).setAttribute("type", "arrow")



//var chromeWindow = viewFor(browserWindows);

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Youtube Hover",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: togglePanel
});

//right-click menu button for "Play in Youtube Hover"
var menuItemPlay = contextMenu.Item({
  label: "Play in Youtube Hover",
  context:[
    contextMenu.URLContext(["*.youtube.com"]), 
    contextMenu.SelectorContext("a"),
  ], 
  contentScript: 'self.on("click", function (node,data) { self.postMessage(node.href) });',
  onMessage: function(_youtubeURL){
      showPanel()
      hover_tube.port.emit("playTrack", _youtubeURL.split("watch?v=").pop())
  }
});


//right-click menu button for "Add to Youtube Hover Playlist"
var menuItemAddtoList = contextMenu.Item({
  label: "Add to Youtube Hover Playlist",
  context:[
    contextMenu.URLContext(["*.youtube.com"]), 
    contextMenu.SelectorContext("a"),
  ], 
  contentScript: 'self.on("click", function (node,data) { self.postMessage(node.href) });',
  onMessage: function(_youtubeURL){
      showPanel()
      hover_tube.port.emit("addToPlaylist", _youtubeURL.split("watch?v=").pop())
  }
});

//handles clicking the menu bar addon button
function togglePanel() {
  if (!hover_tube.isShowing)
    hover_tube.show();
  else{
    hover_tube.hide();
    hover_tube.port.emit("stopVideo")
  }
}

// shows panel
function showPanel(){
  if (!hover_tube.isShowing)
    hover_tube.show();
}

//dummy function to open a new window with the iframe
function openHoverPanel(url) {
  var ifHeader="https://www.youtube.com/embed/"
  var ifURL=ifHeader.concat(url.slice(32));
  //console.log(ifURL);
  
  Windows.open(ifURL);
  var chromewindow = getActiveView(Windows.open(ifURL));
  chromewindow.close();
  chromewindow.open(ifURL,
        "DescriptiveWindowName",
      "width=560,height=315,resizable,scrollbars=no,status=1,alwaysRaised");
}