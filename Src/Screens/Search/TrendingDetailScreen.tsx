import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, FlatList, Dimensions, SectionList, ActivityIndicator } from 'react-native';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
import axios from 'axios';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchStackParamList } from 'Navigation/types';
import Post from "../../Component/Post"
import { navigate } from '../../Component/Route';
import { SafeAreaView } from 'react-native-safe-area-context';
import MasonryList from '@react-native-seoul/masonry-list';

// Group `related` into rows of 2
const chunkArray = (arr: any[], size: number) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const TrendingDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const route = useRoute<RouteProp<SearchStackParamList, 'TrendingDetailScreen'>>();
  const post = route.params.post;
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('https://pashuahar.com/related-content/', {
          params: {
            type: 'post',
            id: post.id,
          },
        });
        setRelated(res.data?.data || []);
      } catch (e) {
        setError('Failed to fetch related content.');
        setRelated([]);
      }
      setLoading(false);
    };
    fetchRelated();
  }, [post.id]);
  const sections = [
    {
      title: 'Related',
      data: chunkArray(related, 2), // each item is an array of 2 posts
    },
  ];
const handleBack = () => {
  // if (navigation.canGoBack()) {
  //   navigation.goBack();
  // } else {
    (navigation as any).navigate('MainTab', { screen: 'SearchTab' });
  // }
};
  // Prepare props for <Post />
  const profile = post.profile || {};
  let userAvatar = '';
  // if (profile?.profile_picture) {
  //   userAvatar = profile.profile_picture?.startsWith('http')
  //     ? profile?.profile_picture
  //     : `http://192.168.1.160:9001${profile.profile_picture}`;
  // }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Main Post */}
        <Post
          id={post?.id?.toString()}
          username={profile.username || ''}
          media={post.media || []}
          caption={post.caption || ''}
          likes={post.like_count || 0}
          userAvatar={userAvatar}
          isLiked={post.is_liked || false}
          contentType={post.type || 'post'}
          navigation={navigation}
          allowComments={post.allow_comments !== false}
          commentCount={post.comment_count || 0}
          hideLikeCount={post.hide_like_count || false}
          location={post.location || ''}
          createdAt={post.created_at || ''}
          profile={profile}
          item={post}
        />

        {/* Related Content */}
        <Text style={styles.relatedTitle}>More to explore</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#bea063" style={styles.loadingText} />
        ) : error ? (
          <Text style={styles.loadingText}>{error}</Text>
        ) : (
          <MasonryList
            data={related}
            keyExtractor={(item: any, index: any) => `${item.id}-${index}`}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.relatedListContainer}
            renderItem={({ item }: any) => {
              let mediaUrl = '';
              if (Array.isArray(item.media) && item.media.length > 0) {
                mediaUrl = item.media[0]?.media_file || '';
              }

              const randomHeight = Math.floor(Math.random() * 120) + 200;
              const screenWidth = Dimensions.get('window').width;
              const columnWidth = screenWidth / 2 - 16;

              return (
                <TouchableOpacity
                  style={styles.relatedItem}
                  onPress={() =>
                    navigation.push('TrendingDetailScreen', { post: item })
                  }
                  activeOpacity={0.9}
                >
                  {mediaUrl ? (
                    <Image
                      source={{ uri: mediaUrl }}
                      style={[styles.relatedImage, { height: randomHeight, width: columnWidth }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      style={[styles.placeholderImage, { height: randomHeight, width: columnWidth, backgroundColor: '#ccc' }]}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  relatedTitle: {
    fontWeight: '600',
    fontSize: 16,
    margin: 16,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  relatedListContainer: {
    paddingBottom: 30,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  relatedItem: {
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  relatedImage: {
    borderRadius: 12,
  },
  placeholderImage: {
    borderRadius: 12,
  },
  emptySpace: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default TrendingDetailScreen; 