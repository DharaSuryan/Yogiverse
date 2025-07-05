import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';

const ProfilePostDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { post } = route.params; // post object passed from ProfileScreen

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: '1', user: 'user1', text: 'Amazing!' },
    { id: '2', user: 'user2', text: 'Love this!' },
    { id: '3', user: 'user3', text: 'So inspiring!' },
  ]);

  const handleLike = () => setLiked(l => !l);
  const handleSave = () => setSaved(s => !s);

  const handleAddComment = () => {
    if (comment.trim()) {
      setComments(prev => [
        ...prev,
        { id: Date.now().toString(), user: 'you', text: comment },
      ]);
      setComment('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTab', { screen: 'Profile' })}>
          <Icon name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* User Info */}
      <View style={styles.userRow}>
        <Image source={{ uri: post.user?.profileImage || 'https://picsum.photos/200' }} style={styles.avatar} />
        <Text style={styles.username}>
          {post.user?.username || 'username'}
          {post.user?.isVerified && (
            <Icon name="checkmark-circle" size={14} color="#0095f6" style={{ marginLeft: 4 }} />
          )}
        </Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.time}>{post.timestamp || 'now'}</Text>
      </View>

      {/* Post Image */}
      <Image source={{ uri: post.image }} style={styles.postImage} />

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={handleLike}>
          <Icon name={liked ? 'heart' : 'heart-outline'} size={28} color={liked ? '#e74c3c' : '#222'} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="chatbubble-outline" size={28} color="#222" style={styles.actionIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="paper-plane-outline" size={28} color="#222" style={styles.actionIcon} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleSave}>
          <Icon name={saved ? 'bookmark' : 'bookmark-outline'} size={28} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      <Text style={styles.likes}>{liked ? (post.likes + 1) : post.likes} likes</Text>

      {/* Caption */}
      <View style={styles.captionRow}>
        <Text style={styles.username}>{post.user?.username || 'username'}</Text>
        <Text style={styles.caption}> {post.caption}</Text>
      </View>

      {/* Comments */}
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <Text style={styles.commentUser}>{item.user}</Text>
            <Text style={styles.commentText}> {item.text}</Text>
          </View>
        )}
        style={styles.commentsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Comment */}
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.addCommentRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={comment}
            onChangeText={setComment}
            onSubmitEditing={handleAddComment}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleAddComment}>
            <Icon name="send" size={24} color="#bea063" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  dot: {
    marginHorizontal: 6,
    color: '#888',
    fontSize: 16,
  },
  time: {
    color: '#888',
    fontSize: 13,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#eee',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionIcon: {
    marginLeft: 16,
  },
  likes: {
    fontWeight: 'bold',
    marginLeft: 12,
    marginBottom: 4,
    color: '#222',
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  caption: {
    color: '#222',
    fontSize: 15,
    flexShrink: 1,
  },
  commentsList: {
    paddingHorizontal: 12,
    flexGrow: 0,
    marginBottom: 8,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  commentUser: {
    fontWeight: 'bold',
    color: '#222',
  },
  commentText: {
    color: '#222',
  },
  addCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 8,
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    marginRight: 8,
  },
});

export default ProfilePostDetailScreen;