/*
Copyright (C) 2018 Alkis Georgopoulos <alkisg@gmail.com>.
SPDX-License-Identifier: CC-BY-SA-4.0*/

var act = null;
function onError(message, source, lineno, colno, error) {
  alert(sformat('Σφάλμα προγραμματιστή!\n'
    + 'message: {}\nsource: {}\nlineno: {}\ncolno: {}\nerror: {}',
  message, source, lineno, colno, error));
}

// ES6 string templates don't work in old Android WebView
function sformat(format) {
  var args = arguments;
  var i = 0;
  return format.replace(/{(\d*)}/g, function sformatReplace(match, number) {
    i += 1;
    if (typeof args[number] !== 'undefined') {
      return args[number];
    }
    if (typeof args[i] !== 'undefined') {
      return args[i];
    }
    return match;
  });
}

// Return an integer from 0 to num-1.
function random(num) {
  return Math.floor(Math.random() * num);
}

// Return a shuffled copy of an array.
function shuffle(a) {
  var result = a;
  var i;
  var j;
  var temp;

  for (i = 0; i < result.length; i += 1) {
    j = random(result.length);
    temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

function ge(element) {
  return document.getElementById(element);
}

function onResize(event) {
  var w = window.innerWidth;
  var h = window.innerHeight;
  if (w / h < 640 / 360) {
    document.body.style.fontSize = sformat('{}px', 10 * w / 640);
  } else {
    document.body.style.fontSize = sformat('{}px', 10 * h / 360);
  }
}

function doPreventDefault(event) {
  event.preventDefault();
}

function onHome(event) {
  window.history.back();
}

function onHelp(event) {
  ge('help').style.display = 'flex';
  ge('audiohelp').currentTime = 0;
  ge('audiohelp').play();
}

function onHelpHide(event) {
  ge('help').style.display = '';
  ge('audiohelp').pause();
}

function onAbout(event) {
  window.open('credits/index_DS_II.html');
}

function onFullScreen(event) {
  var doc = window.document;
  var docEl = doc.documentElement;
  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen
    || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen
    || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if (!doc.fullscreenElement && !doc.mozFullScreenElement
    && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  } else {
    cancelFullScreen.call(doc);
  }
}

function reset(event) {
    svg = ge('bc');
    while (svg.lastChild) {
      svg.removeChild(svg.lastChild);
    }
    for (var i=0; i<7; i++){
      for (var j=0; j<5; j++){
        act.cells[i][j].innerHTML = "";
        act.weather[i][j] = 0;
      }
    }
}


function drawBC(){
  var colors = ['#707dab','#6D9367','#ff713f','#27c6d9','#f06290'];
  var svg = ge('bc');
  while (svg.lastChild) {
    svg.removeChild(svg.lastChild);
  }
  var svgns = "http://www.w3.org/2000/svg";
  for (var j = 0; j < 5; j++) {
      var daysOfWeather = 0;
      for (i = 0; i < 7; i++){
        daysOfWeather += act.weather[i][j];
        var rect = document.createElementNS(svgns, 'rect');
        rect.setAttributeNS(null, 'x', sformat('{}em',0.1 + j*4 + 0.15*j));
        rect.setAttributeNS(null, 'y', sformat('{}em',22-(daysOfWeather/7)*22));
        rect.setAttributeNS(null, 'height', sformat('{}em',22/7));
        rect.setAttributeNS(null, 'width', sformat('4em'));
        rect.setAttributeNS(null, 'fill', colors[j]);
        rect.setAttributeNS(null, 'stroke', '#aaaaaa');
        rect.setAttributeNS(null, 'stroke-width', '0.1em')
        svg.appendChild(rect);
      }
  }
}

function cellIndex(obj,isImage){
  if (isImage){
    rowString = obj.id[2];
    row = parseInt(rowString);
    colString = obj.id[3];
    col = parseInt(colString);
    return([row,col]);
  }
  else{
    rowString = obj.id[1];
    row = parseInt(rowString);
    colString = obj.id[2];
    col = parseInt(colString);
    return([row,col]);
  }
}

function cellClick(event){
  var cellij;
  if (event.target.tagName.toUpperCase() == 'IMG'){
    cellij = cellIndex(event.target,true);
  }
  else{
    cellij = cellIndex(event.target,false);
  }

  var i = cellij[0];
  var j = cellij[1];
  if (act.weather[i][j] == 1){
    act.cells[i][j].innerHTML = "";
    act.weather[i][j] = 0;
  }
  else{//remember to erase the other 1 if it's there
    for (var k=0; k<5; k++){
      if ((act.weather[i][k] == 1) && k!=j){
        act.weather[i][k] = 0;
        act.cells[i][k].innerHTML = "";
      }
    }
    act.cells[i][j].innerHTML = sformat("<img id='im{}{}' src='resource/checkmark.svg'/>",i,j);
    act.weather[i][j] = 1;
  }
}
function init() {
  var i,j;
  act = {
    weather: [[0,0,0,0,0],
              [0,0,0,0,0],
              [0,0,0,0,0],
              [0,0,0,0,0],
              [0,0,0,0,0],
              [0,0,0,0,0],
              [0,0,0,0,0]],
    cells: []
  }
  for (i=0; i<7; i++){
    act.cells.push([])
    for (j=0; j<5; j++){      
      act.cells[i].push(ge(sformat('i{}{}',i,j)));
      act.cells[i][j].onclick = cellClick;
      act.cells[i][j].innerHTML = "";
    }
  }
  // Internal level number is zero-based; but we display it as 1-based.
  // We allow/fix newLevel if it's outside its proper range.
  onResize();
  // Create a <style> element for animations, to avoid CORS issues on Chrome
  // TODO: dynamically? document.head.appendChild(document.createElement('style'));
  // Install event handlers
  document.body.onresize = onResize;
  ge('bar_home').onclick = onHome;
  ge('bar_help').onclick = onHelp;
  ge('help').onclick = onHelpHide;
  ge('bar_about').onclick = onAbout;
  ge('bar_fullscreen').onclick = onFullScreen;
  ge('bar_reset').onclick = reset;
  ge('bar_graph').onclick = drawBC;
  for (i = 0; i < document.images.length; i += 1) {
    document.images[i].ondragstart = doPreventDefault;
  }
}

window.onerror = onError;
window.onload = init;
// Call onResize even before the images are loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onResize);
} else {  // `DOMContentLoaded` already fired
  onResize();
}
