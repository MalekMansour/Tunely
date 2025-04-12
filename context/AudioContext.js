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
        console.error('Error configuring audio:', err);
      }
    };

    configureAudio();
  }, []);

  const currentSongRef = useRef(null);
  React.useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  const playSoundCallIdRef = useRef(0);

  const changePlaylist = (songs, source) => {
    setPlaylist(songs);
    setPlaylistSource(source);
  };

  const playNextSong = async () => {
    const currentSongValue = currentSongRef.current;
    if (!currentSongValue || playlist.length === 0) return;
    const currentSongId = currentSongValue.songId || currentSongValue.id;
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
    const currentSongId = currentSongValue.songId || currentSongValue.id;
    const currentIndex = playlist.findIndex(song => {
      const songId = song.songId || song.id;
      return songId === currentSongId;
    });
    if (currentIndex === -1 || currentIndex === 0) return;
    const previousSong = playlist[currentIndex - 1];
    await playSound(previousSong);
  };

  const playSound = async (song) => {
    playSoundCallIdRef.current += 1;
    const thisCallId = playSoundCallIdRef.current;

    // If any sound is currently playing, immediately stop it.
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading previous sound:', error);
      }
      setSound(null);
      setIsPlaying(false);
    }

    // If the same song is tapped (toggle pause/resume), handle it immediately.
    if (currentSong?.songId === song.songId && sound) {
      if (isPlaying) {
        await pauseSound();
        return;
      } else {
        await resumeSound();
        return;
      }
    }
    
    // Update the song state before creating the new sound.
    setCurrentSong(song);
    currentSongRef.current = song;

    let newSound;
    try {
      const { sound: loadedSound } = await Audio.Sound.createAsync(
        { uri: song.fileUrl },
        { 
          shouldPlay: true,
          isLooping: false,
          progressUpdateIntervalMillis: 500
        },
        onPlaybackStatusUpdate
      );
      newSound = loadedSound;
    } catch (error) {
      console.error('Error creating sound:', error);
      return;
    }

    // If another call has started meanwhile, cancel this one immediately.
    if (thisCallId !== playSoundCallIdRef.current) {
      try {
        await newSound.unloadAsync();
      } catch (error) {
        console.error('Error unloading canceled sound:', error);
      }
      return;
    }
    
    setSound(newSound);
    setIsPlaying(true);

    try {
      await songService.recordSongPlay(song.songId);
    } catch (error) {
      console.error('Failed to record song play:', error);
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
    
    setIsPlaying(status.isPlaying);
    
    // When a song finishes playing, automatically play the next song if available.
    if (status.didJustFinish) {
      const songJustFinished = currentSongRef.current;
      if (songJustFinished && playlist.length > 0) {
        const currentIndex = playlist.findIndex(song => song.songId === songJustFinished.songId);
        if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
          const nextSong = playlist[currentIndex + 1];
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
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };

  // Clean up when unmounting the AudioProvider.
  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

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
