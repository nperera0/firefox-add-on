var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var { MatchPattern } = require("sdk/util/match-pattern");
var contextMenu = require("sdk/context-menu");
var Windows = require("sdk/windows").browserWindows;
var data = require("sdk/self").data; //data.folder?
var { open } = require('sdk/window/utils');//low-level api not working
var { getActiveView }=require("sdk/view/core");

// TODO: modify this to capture videoId
// from all variations of YouTube links.
var url_pattern = new MatchPattern(/https:\/\/www\.youtube\.com\/watch.*/);

// Contains updated boolean
// recording whether
// a playlist has started.
var isPlaylist = false;

// Construct a panel, loading its content from the "hover-tube.html"
// file in the "data" directory, and loading the "get-text.js" script
// into it.
var hover_tube = require("sdk/panel").Panel({
  id:'hover-tube',
  width: 420,
  height: 238, // element has 1px border!
  anchor: null,
  noautohide: true,
  position: {'bottom': 40, 'right': 25},
  contentURL: data.url("hover-tube.html"),
  contentStyle: [data.url("jquery-ui.css")],
  contentScriptFile: [ data.url("jquery.js"), data.url("jquery-ui.js"),data.url("migrate.js"), data.url("hover-tube.js") ]
});

getActiveView(hover_tube).setAttribute("noautohide", true);
getActiveView(hover_tube).setAttribute("level", 'floating');
getActiveView(hover_tube).setAttribute("type", "drag");
getActiveView(hover_tube).setAttribute("type", "resize");
getActiveView(hover_tube).setAttribute("titlebar", "normal");

/* both are needed in order to make the background transparent... */
getActiveView(hover_tube).setAttribute("type","content");
getActiveView(hover_tube).setAttribute("transparent","transparent");

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
    contextMenu.PredicateContext(function(arg){
        // only show this menu item if there is an existing playlist
        // console.log("checking if playlist exits")
        return isPlaylist;
    })
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



hover_tube.port.on("resize", function(payload){
  hover_tube.resize(payload.size.width, payload.size.height)
})

// change to 'broadcastPlaylist' here and in
// page script, content script to avoid confusion
hover_tube.port.on("updatePlaylist", function(_isPlaylist){
  isPlaylist = _isPlaylist;
})
