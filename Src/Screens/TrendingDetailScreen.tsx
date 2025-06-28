import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, FlatList, Dimensions, SectionList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchStackParamList } from '../Navigation/types';
import Post from '../Component/Post';
import { goBack } from '../Component/Route';
// import { SearchStackParamList } from '../../Navigation/types';

const screenWidth = Dimensions.get('window').width;

// Group `related` into rows of 2
const chunkArray = (arr: any[], size: number) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};



// type TrendingDetailScreenRouteProp = RouteProp<SearchStackParamList, 'TrendingDetail'>;

type TrendingDetailScreenRouteParams = {
  post: any;
};

const TrendingDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const route = useRoute<RouteProp<SearchStackParamList, 'TrendingDetailScreen'>>();
  const post = route.params.post;
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await axios.get('https://pashuahar.com/related-content/', {
          params: {
            type: 'post',
            id: post.id,
          },
        });
        setRelated(res.data?.data || []);
      } catch (e) {
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

  // Prepare props for <Post />
  const profile = post.profile || {};
  let userAvatar = '';
  if (profile.profile_picture) {
    userAvatar = profile.profile_picture.startsWith('http')
      ? profile.profile_picture
      : `http://192.168.1.160:9001${profile.profile_picture}`;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Back button overlay */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 40,
          left: 16,
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 6,
          elevation: 3,
          zIndex: 10,
        }}
        onPress={() => {
         goBack()
        }}
      >
        <Icon name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

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
      <Text style={{ fontWeight: '600', fontSize: 16, margin: 16 }}>More to explore</Text>
      {loading ? (
        <Text style={{ textAlign: 'center' }}>Loading...</Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.map(i => i.id).join('_') + index}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 30, paddingTop: 8, paddingHorizontal: 8 }}
          renderItem={({ item: row }) => (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              {row.map((item: any, index: number) => {
                const mediaUrl =
                  Array.isArray(item.media) && item.media.length > 0
                    ? item.media[0]?.media_file
                    : '';

                return (
                  <TouchableOpacity
                    key={item.id?.toString() || index.toString()}
                    style={{
                      width: (screenWidth - 36) / 2,
                      aspectRatio: 1,
                      backgroundColor: '#fff',
                      borderRadius: 18,
                      marginHorizontal: 4,
                      overflow: 'hidden',
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOpacity: 0.06,
                      shadowOffset: { width: 0, height: 2 },
                      shadowRadius: 8,
                    }}
                    onPress={() =>
                      navigation.push('TrendingDetailScreen', { post: item })
                    }
                    activeOpacity={0.9}
                  >
                    {mediaUrl ? (
                      <Image
                        source={{ uri: mediaUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#eee',
                        }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
              {/* Fill if only 1 item in row to balance grid */}
              {row.length === 1 && (
                <View style={{ flex: 1, marginHorizontal: 4 }} />
              )}
            </View>
          )}
        />
      )}
    </ScrollView>
  );
};

export default TrendingDetailScreen; 