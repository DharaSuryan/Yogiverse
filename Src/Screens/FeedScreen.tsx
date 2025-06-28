import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Text } from 'react-native';
import Post from '../Component/Post';
import axios from 'axios';
import { Post as PostType } from 'Src/Types';
import { useNavigation } from '@react-navigation/native';

const FeedScreen = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://192.168.1.160:9001/posts/');
      setPosts(res.data?.data || []);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts().finally(() => setRefreshing(false));
  }, []);

  const renderPost = ({ item }: { item: PostType }) => (
    <Post
      id={item.id}
      username={item.username}
      imageUrl={item.imageUrl}
      caption={item.caption}
      likes={item.likes}
      userAvatar={item.userProfilePicture}
      isLiked={item.isLiked}
      contentType={"post"}
      navigation={navigation}
    />
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, marginTop: 40 }} />;
  }
  if (error) {
    return <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default FeedScreen; 