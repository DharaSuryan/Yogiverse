import React from 'react';
import { ScrollView } from 'react-native';
import Post from '../../Component/Post';
import { RouteProp, useRoute } from '@react-navigation/native';

// Define the type for the route params
interface CollectionPostDetailParams {
  post: any;
}

type CollectionPostDetailRouteProp = RouteProp<{ CollectionPostDetail: CollectionPostDetailParams }, 'CollectionPostDetail'>;

export default function CollectionPostDetailScreen({ navigation }: any) {
  const route = useRoute<CollectionPostDetailRouteProp>();
  const { post } = route.params;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>
      <Post
        id={post.id?.toString()}
        username={post.profile?.username}
        media={post.media}
        caption={post.caption}
        likes={post.like_count}
        userAvatar={post.profile?.profile_picture}
        isLiked={post.is_liked ?? false}
        contentType={post.type}
        navigation={navigation}
        allowComments={post.allow_comments}
        commentCount={post.comment_count}
        hideLikeCount={post.hide_like_count}
        location={post.location}
        createdAt={post.created_at}
        profile={post.profile}
        item={post}
        isdrmoDetails={true}
      />
    </ScrollView>
  );
} 
