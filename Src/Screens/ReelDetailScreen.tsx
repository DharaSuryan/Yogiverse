import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Image } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const ReelDetailScreen = ({ route }) => {
  const { reel } = route.params;
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.seek(0);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: reel.video_file }}
        style={styles.video}
        resizeMode="cover"
        paused={!isPlaying}
        repeat
        muted={isMuted}
      />

      {/* Overlay controls */}
      <View style={styles.overlay}>
        {/* Left side - reel info */}
        <View style={styles.leftContainer}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: reel.profile.profile_picture }}
              style={styles.profilePic}
            />
            <Text style={styles.username}>{reel.profile.username}</Text>
          </View>
          
          <Text style={styles.caption}>{reel.caption}</Text>
          
          <View style={styles.musicContainer}>
            <Icon name="musical-notes" size={16} color="white" />
            <Text style={styles.musicText}>{reel.music_track || 'Original Audio'}</Text>
          </View>
        </View>

        {/* Right side - actions */}
        <View style={styles.rightContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="heart-outline" size={28} color="white" />
            <Text style={styles.actionText}>{reel.like_count}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="chatbubble-outline" size={28} color="white" />
            <Text style={styles.actionText}>{reel.comment_count}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="paper-plane-outline" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
            <Icon 
              name={isMuted ? "volume-mute-outline" : "volume-high-outline"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Play/Pause overlay */}
      <TouchableOpacity 
        style={styles.playPauseOverlay}
        onPress={togglePlayPause}
        activeOpacity={0.8}
      >
        {!isPlaying && (
          <Icon name="play" size={60} color="rgba(255,255,255,0.7)" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
  },
  rightContainer: {
    justifyContent: 'flex-end',
    padding: 15,
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  caption: {
    color: 'white',
    marginBottom: 10,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  musicText: {
    color: 'white',
    marginLeft: 5,
  },
  actionButton: {
    marginBottom: 20,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    marginTop: 5,
  },
  muteButton: {
    marginTop: 20,
  },
  playPauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReelDetailScreen;