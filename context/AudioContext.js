import React, { createContext, useState, useContext, useRef } from 'react';
import { Audio } from 'expo-av';
import { songService } from '../services/songService';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [playlistSource, setPlaylistSource] = useState('all');

  //This logic ensures the app to play in silent mode
  React.useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: 1,
          playsInSilentModeIOS: true, 
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
        });
        
      } catch (err) {
        
      }
    };

    configureAudio();
  }, []);

  
  // Use ref to track current song 
  const currentSongRef = useRef(null);
  
  // Update ref whenever currentSong changes
  React.useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  const changePlaylist = (songs, source) => {
    setPlaylist(songs);
    setPlaylistSource(source);
  };

  const playNextSong = async () => {
    const currentSongValue = currentSongRef.current;
    
    if (!currentSongValue || playlist.length === 0) return;
    
    // Check both songId and id properties
    const currentSongId = currentSongValue.songId || currentSongValue.id;
    
    // Modified findIndex to check both ID formats
    const currentIndex = playlist.findIndex(song => {
      const songId = song.songId || song.id;
      return songId === currentSongId;
    });
    
    if (currentIndex === -1 || currentIndex === playlist.length - 1) return;
    
    const nextSong = playlist[currentIndex + 1];
    await playSound(nextSong);
  };

  const playPreviousSong = async () => {
    const currentSongValue = currentSongRef.current;
    
    if (!currentSongValue || playlist.length === 0) return;
    
    // Check both songId and id properties
    const currentSongId = currentSongValue.songId || currentSongValue.id;
    
    // Modified findIndex to check both ID formats
    const currentIndex = playlist.findIndex(song => {
      const songId = song.songId || song.id;
      return songId === currentSongId;
    });
    
    if (currentIndex === -1 || currentIndex === 0) return;
    
    const previousSong = playlist[currentIndex - 1];
    await playSound(previousSong);
  };

  const playSound = async (song) => {
    try {
      // Handle playing the same song
      if (currentSong?.songId === song.songId && sound) {
        if (isPlaying) {
          await pauseSound();
          return;
        } else {
          await resumeSound();
          return;
        }
      }
      
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Update the state and ref BEFORE creating the new sound
      setCurrentSong(song);
      currentSongRef.current = song;

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.fileUrl },
        { 
          shouldPlay: true,
          isLooping: false,
          progressUpdateIntervalMillis: 500
        },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);

      //record song play
      try {
        await songService.recordSongPlay(song.songId);
      } catch (error) {
        // Just log the error but don't stop playback if this fails
        console.error('Failed to record song play:', error);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const pauseSound = async () => {
    try {
      if (sound) {
        await sound.setStatusAsync({ shouldPlay: false });
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  };

  const resumeSound = async () => {
    try {
      if (sound) {
        await sound.setStatusAsync({ shouldPlay: true });
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error resuming sound:', error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;
    
    // Set playing state based on playback status
    setIsPlaying(status.isPlaying);
    
    // If song finished
    if (status.didJustFinish) {
      const songJustFinished = currentSongRef.current;
      
      if (songJustFinished && playlist.length > 0) {
        const currentIndex = playlist.findIndex(song => song.songId === songJustFinished.songId);
        
        if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
          const nextSong = playlist[currentIndex + 1];
          
          // Use timeout to ensure proper cleanup between tracks
          setTimeout(() => {
            playSound(nextSong);
          }, 500);
        }
      }
    }
  };

  const stopSound = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        // Don't reset currentSong here - useful to remember what was playing
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };
//clean up when not using audio provider anymore
  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  return (
    <AudioContext.Provider 
      value={{ 
        sound,
        currentSong,
        isPlaying,
        playlist,
        playlistSource,
        playSound,
        pauseSound,
        resumeSound,
        playNextSong,
        playPreviousSong,
        changePlaylist,
        stopSound
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);