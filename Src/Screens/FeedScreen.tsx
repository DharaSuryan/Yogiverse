import React from 'react';
import {View, FlatList, StyleSheet, RefreshControl} from 'react-native';
import Post from '../Component/Post';

interface PostItem {
  id: string;
  username: string;
  imageUrl: string;
  caption: string;
  likes: number;
  userAvatar: string;
}

// Temporary mock data
const MOCK_POSTS: PostItem[] = [
  {
    id: '1',
    username: 'yogiuser1',
    imageUrl: 'https://picsum.photos/500/500',
    caption: 'Practicing my morning yoga routine 🧘‍♀️ #yogalife',
    likes: 42,
    userAvatar: 'https://picsum.photos/100/100',
  },
  {
    id: '2',
    username: 'mindfulyogi',
    imageUrl: 'https://picsum.photos/501/501',
    caption: 'Finding peace in warrior pose ✨ #yogapractice',
    likes: 89,
    userAvatar: 'https://picsum.photos/101/101',
  },
];

const FeedScreen = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Here you would typically fetch new posts
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderPost = ({item}: {item: PostItem}) => (
    <Post
      username={item.username}
      imageUrl={item.imageUrl}
      caption={item.caption}
      likes={item.likes}
      userAvatar={item.userAvatar}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_POSTS}
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