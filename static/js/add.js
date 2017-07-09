function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function toHex(s) {
    // utf8 to latin1
    var s = unescape(encodeURIComponent(s))
    var h = ''
    for (var i = 0; i < s.length; i++) {
        h += s.charCodeAt(i).toString(16)
    }
    return h;
}

function fromHex(h) {
    var s = ''
    for (var i = 0; i < h.length; i+=2) {
        s += String.fromCharCode(parseInt(h.substr(i, 2), 16))
    }
    return decodeURIComponent(escape(s))
}

var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function starterPlaylist() {
    sideBar = document.getElementById("sideBar");
    console.log(localStorage);
    for(var i=0, len=localStorage.length; i<len; i++) {
        var key = localStorage.key(i);
        var value = localStorage[key];
        console.log(key + " => " + value);
        
        localStorage.removeItem("");
        
        sideBar.innerHTML = sideBar.innerHTML + ('<li ><a onclick="makePlaylist(\'' + key + '\')">' + key +'</a></li>');
    }

}

function addPlaylist() {
	var newPlaylistName = prompt("Insert playlist name");
	if (! (newPlaylistName == "" || newPlaylistName == null)) {
	    console.log(newPlaylistName);
	    sideBar = document.getElementById("sideBar");
        sideBar.innerHTML = sideBar.innerHTML + ('<li><a onclick="makePlaylist(\'' + newPlaylistName + '\')">' + newPlaylistName +'</a></li>');
        localStorage.setItem(String(newPlaylistName), JSON.stringify([]));
	}
	
}

function makePlaylist(playlistName) {
    //localStorage.getItem(playlistName);
    
    textspace = document.getElementById("textspace");
    addButtonSpace = document.getElementById("addButtonSpace");
    infotext = document.getElementById("infotext");
    
    infotext.innerHTML = "";
    textspace.innerHTML = "";
    addButtonSpace.innerHTML = "";
    
    addButtonSpace.innerHTML = addButtonSpace.innerHTML + ('<div class="input-group"><input type="text" id="songText" class="form-control" placeholder="Song link..."><span class="input-group-btn"><button class="btn btn-default" type="button" onclick="addSong(\'' + playlistName + '\')">Add Song</button></span></div>');
    
    var songs = JSON.parse(localStorage.getItem(playlistName));
    if (songs) {
        var songsLength = songs.length;

        for(var i=0, songsLength; i<songsLength; i++) {
            var cName = randomString(16) + "_" + String(i);
            textspace.innerHTML = textspace.innerHTML + ('<div class=' + cName + '><a class="list-group-item" onclick="playSong(\'' + songs[i] + '\', \'' + cName + '\')"><div class="container">' + songs[i] + '</div></a></div>');
        }
    }
}

function tellServer(songName) {
    //$.post("/addsong", {"song" : toHex(songName) });
    $.get(("/addsong?song=" + toHex(songName)) , function(data, status){
        console.log(data);
    });
}


function getUrl(songName) {
    return "/static/songs/" + toHex(songName) + ".mp3";
}

function addSong(listName) {
    var songs = [];
    console.log(JSON.parse(localStorage.getItem(listName)));
    var songName = document.getElementById("songText").value;
    console.log(songName)
    
    if (songName) {
        tellServer(songName);
        var textspace = document.getElementById("textspace");
        var cName = randomString(16) + "_" + document.getElementsByClassName('songs')[0].childNodes[1].childNodes.length;
        textspace.innerHTML = textspace.innerHTML + ('<div class="' + cName + '"><a class="list-group-item" onclick="playSong(\'' + songName + '\', \'' + cName + '\')"><div class="container">' + songName + '</div></a></div>');
        
        if (localStorage.getItem(listName)) {
            var songs = JSON.parse(localStorage.getItem(listName));
            songs.push(songName);
            localStorage.setItem(String(listName), JSON.stringify(songs));
            console.log(localStorage.getItem(listName));
        }
    }
}

function getNextSong(currentPos) {
    var c_songs = document.getElementsByClassName('songs')[0].childNodes[1].childNodes;
    var c_songsLength = c_songs.length;

    for(var i=0, c_songsLength; i<c_songsLength; i++) {
        var song_ir = c_songs[i].className
        var song_ir_pos =  Number(song_ir.split("_")[1]);
        
        if (song_ir_pos == (currentPos + 1)) {
            break;
        }
    }
    
    if (! (song_ir_pos == currentPos)) {
        return song_ir;
    }
    else {
        return null;
    }
}

// function setPlayBar(currentPos) {
//     var c_songs = document.getElementsByClassName('songs')[0].childNodes[1].childNodes;
//     var c_songsLength = c_songs.length;

//     for(var i=0, c_songsLength; i<c_songsLength; i++) {
//         var song_ir = c_songs[i].className
//         var song_ir_pos =  Number(song_ir.split("_")[1]);
        
//         if (song_ir_pos == currentPos) {
//             //$("." + song_ir).css({"color" : "black", "background-color":"white"});
//             //$("." + song_ir + ":hover").css({"color" : "white", "background-color":"black"});
//             $( "." + song_ir + " .playbutton" ).html("<div class='playbutton' align='left'></div>");
//             console.log("Setting playbar css");
//         }
//         else {
//             //$("." + song_ir).css({"color" : "white", "background-color":"black"});
//             //$("." + song_ir + ":hover").css({"color" : "black", "background-color":"white"});
//             $( "." + song_ir + " .playbutton" ).empty();
            
//         }
//         // $("a.list-group-item").css({"color" : "0", "background-color":"0"});
//         // $(".list-group-item").css({"color" : "0", "background-color":"0"});
//     }
// }


function playSong(songName, cName) {
    Howler.unload();
    
    var currentPos = Number(cName.split("_")[1]);
    
    //Setting played bars css to white 
    
    //setPlayBar(currentPos)
    
    //Getting nextsong classname
    
    var nextSong = getNextSong(currentPos);
    
    var c_song = getUrl(songName);
    
    console.log(c_song);
    console.log(currentPos);
    
    
    
    
    if (! (nextSong == null)) {
        console.log(nextSong);
        var sound = new Howl({
          src: [c_song],
          volume: 1
        });
        
        sound.play();
        
        // Fires when the sound finishes playing.
        sound.on('end', function(){
          console.log('Finished!');
          playSong(document.getElementsByClassName(nextSong)[0].childNodes[0].childNodes[0].innerHTML, nextSong);
        });
        
        console.log("playing: " + songName);
        
        
    } else {
        var c_song = getUrl(songName);
        console.log(c_song);
        console.log("This is the last song");
        
        var sound = new Howl({
          src: [c_song],
          volume: 1
        });
        
        sound.play();
        
        // $('.playbutton').click(function() {
        //     $( "div" ).toggle();
            
        // });
        
        // Fires when the sound finishes playing.
        sound.on('end', function(){
          console.log('Finished!');
        });

        console.log("Playing: " + songName);
    }
    
}

function addInfoText() {
    infotext = document.getElementById("infotext");
    infotext.innerHTML += ('<h1>Piratestream</h1>');
}