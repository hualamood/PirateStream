from __future__ import unicode_literals
from functools import partial
from flask import *
import json
import sys
import base64
import couchdb
import youtube_dl
import codecs
import os


SECRET_KEY = 'dev key'

DATABASE = 'musicdb'
SECRET_KEY = 'development key'

app = Flask(__name__)

app.secret_key = SECRET_KEY

server = couchdb.Server()
try:
    db = server[DATABASE]
except:
    db = server.create(DATABASE)

del db['songs']

try:
    print db['songs']
except:
    db['songs'] = {
        'youtube': [],
        'soundcloud': []
    }
    
def youtube_title(song):
    y_part = song[-11:]
    ydl = youtube_dl.YoutubeDL()
    r = None
    url = "https://www.youtube.com/watch?v={0}".format(y_part)
    with ydl:
        r = ydl.extract_info(url, download=False)  # don't download, much faster 
    
    # print some typical fields
    return r['title']
    

def download_youtube(song):
    hexlify = codecs.getencoder("hex")
    
    doc = db.get('songs')
    songs = doc['youtube']
    
    y_part = song[-11:]
    
    if y_part in songs:
        return
    else:
        songs.append(y_part)
        db.save(doc)
        
        options = {
            'format': 'bestaudio/best',
            'outtmpl': 'static/songs/{0}.%(ext)s'.format(hexlify(song)[0]),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }   
        with youtube_dl.YoutubeDL(options) as ydl:
            download_link = 'http://www.youtube.com/watch?v={0}'.format(y_part)
            print("Downloading from: {0}".format(download_link))
            ydl.download([download_link])

def download_soundcloud(song):
    hexlify = codecs.getencoder("hex")
    
    doc = db.get('songs')
    songs = doc['soundcloud']
    
    d_song = hexlify(song)[0]
    
    if d_song in songs:
        return
    else:
        songs.append(d_song)
        db.save(doc)
        
        options = {
            'format': 'bestaudio/best',
            'outtmpl': 'static/songs/{0}.%(ext)s'.format(hexlify(song)[0]),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }   
        with youtube_dl.YoutubeDL(options) as ydl:
            print("Downloading from: {0}".format(song))
            ydl.download([song])
    

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')
    
# @app.route('/stream', methods=['GET'])
# def stream():
#     song = request.args.get('song')
    
#     if song:
#         filename = '/static/songs/{0}.mp3'.format(song)
#         read_chunk = partial(os.read, filename, 1024)
#         return Response(iter(read_chunk, b''), mimetype='audio/mp3')

@app.route('/get_title')
def get_title():
    return youtube_title(request.args.get('song').decode('hex'))

@app.route('/addsong', methods=['GET'])
def addsong():
    print request.args.get('song')
    song = (request.args.get('song')).decode("hex")
    print song
    
    if ("youtube" in song) or ("youtu.be" in song):
        print("User requested youtube video")
        download_youtube(song)
        return "ok!"
        
    elif "soundcloud.com" in song:
        print("User requested from soundcloud")
        download_soundcloud(song)
        return "ok!"
    else:
        return "Invalid url!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
