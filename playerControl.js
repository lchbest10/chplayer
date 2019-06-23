const electron = require('electron');
const fs = require('fs');
const ipc = electron.ipcRenderer;
const path = require('path');
const mm = require('musicmetadata');

const musictitle = $('#musictitle');
const artistname = $('#artistname');
const duration = $('#duration');
const musicProgress = $('#musicProgress')[0];
const volumeSlider = $('#volumeSlider')[0];
var albumimage = $('#albumimage');

var current_song = new Audio();
var filename;
var filepath;

ipc.on('selected-filepath', (event, p) => {
    if(!current_song.paused) {
      current_song.pause();

    }
    filepath = p;
    filename = path.parse(filepath + '');
    musictitle.text('[' + filename.base + ']');

    var parser = mm(fs.createReadStream(filepath + ''),{duration: true},(err,metadata) => {
        if(err) throw err;
        artistname.text('[' + metadata.artist + ']'); 
        timeLength = metadata.duration;
        var minute = Math.floor(metadata.duration / 60);
        var second = Math.floor(metadata.duration - minute * 60);
        if(minute < 10) minute = '0' + minute;
        if(second < 10) second = '0' + second; 
        duration.text(minute + ':' + second);
    });
    initSong();
});

function initSong() {
  current_song = new Audio();
  current_song.src = filepath;
  current_song.autoplay = true;
  current_song.loop = false;
  current_song.addEventListener("load",function() {
    current_song.play();
  },true)
  current_song.addEventListener("timeupdate",function() { seektimeupdate(); });
  current_song.addEventListener("mousemove", function() { seek(); });
  volumeSlider.addEventListener("mousemove", function() { setVolume(); });
  musicProgress.addEventListener("mousedown", function(event) { seeking = true; 
    seek(event.pageX)});
  musicProgress.addEventListener("mouseup", function() { seeking = false});
}

function seek(mx) {
    let rp = parseInt(musicProgress.offsetLeft);
    let w = parseInt(musicProgress.clientWidth);
    let dx = current_song.duration / w;
    let rmx = mx - rp
    current_song.currentTime = (dx * rmx);
}

function seektimeupdate() {
  var nt = current_song.currentTime * (100 / current_song.duration);
  musicProgress.value = nt;
  var rested = current_song.duration - current_song.currentTime;
  var restedmin = Math.floor(rested / 60);
  var restedsec = Math.floor(rested - restedmin * 60);
  if(restedsec < 10) { restedsec = "0" + restedsec; }
  if(restedmin < 10) { restedmin = "0" + restedmin; }
  duration.text(restedmin+":"+restedsec);
}

function setVolume() {
  current_song.volume = volumeSlider.value / 100;
}

$('#playButton').click( () => {
  if(jQuery.isEmptyObject(current_song)) 
    return;
  if(!current_song.paused) {
    current_song.pause();
    jQuery('#playButton').css({"background":"url(res/play.png)", "background-size": "25px" });
  }
  else {
    current_song.play();
    jQuery('#playButton').css({"background":"url(res/pause.png)", "background-size": "25px" });
  } 
})

$('#muteButton').click( () => {
  if(!current_song.muted) {
    current_song.muted = true;
    jQuery('#muteButton').css({"background":"url(res/mute.png)", "background-size": "25px" });
  }
  else {
    current_song.muted = false;
    jQuery('#muteButton').css({"background":"url(res/speaker.png)", "background-size": "25px" });
  }
})


$(window).on("wheel", e => {
  var delta = e.originalEvent.deltaY;
  if(delta > 0) volumeSlider.value--;
  else          volumeSlider.value++;
  setVolume();
});


