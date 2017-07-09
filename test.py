from __future__ import unicode_literals
import youtube_dl
import base64
import codecs

def download_youtube(song):
    hexlify = codecs.getencoder("hex")
    y_part = song[-11:]

    #options = {'outtmpl': '{0}'.format(base64.b64encode(song))}  # save file as the YouTube ID
    
    options = {
        'format': 'bestaudio/best',
        'outtmpl': '/static/{0}.%(ext)s'.format(hexlify(song)[0]),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        
    }
    
    with youtube_dl.YoutubeDL(options) as ydl:
        #download_link = 'http://www.youtube.com/watch?v={0}'.format(y_part)
        download_link = song
        print("Downloading from: {0}".format(download_link))
        ydl.download([download_link])
        
download_youtube('https://www.youtube.com/watch?v=lXMskKTw3Bc')