import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  BackHandler,
  SectionList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, HomeStackParamList } from '../../Navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Notification } from '../../Navigation/types';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../../Component/Route';

type NotificationsScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Notifications'>;
};

// Helper to format time ago (weeks)
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffW = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  if (diffW > 0) return `${diffW}w`;
  const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffD > 0) return `${diffD}d`;
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH > 0) return `${diffH}h`;
  const diffM = Math.floor(diffMs / (1000 * 60));
  if (diffM > 0) return `${diffM}m`;
  return 'now';
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {

    fetchNotifications();
  }, []);
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      const res = await axios.get('https://pashuahar.com/follower/notifications/', { headers });
      const allNotifications = res.data?.data?.results || [];
      const unreadNotifications = allNotifications
      setNotifications(unreadNotifications);
      console.log("res.data?.data", res.data?.data?.results, res.data?.data?.results[0].data?.type);

    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      case 'follow':
        return 'person-add';
      case 'mention':
        return 'at';
      default:
        return 'notifications';
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'mention':
        return 'mentioned you in a comment';
      default:
        return 'interacted with your post';
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          BackHandler.exitApp(); // Exit app if there's no back screen
        }
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const handleApprove = async (item: any) => {
    console.log("itemitemitem", item?.user?.id, item?.id);
    // return

    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };
      await axios.post(
        'https://pashuahar.com/follower/follow-request/',
        {
          request_id: item?.data?.request_id,
          action: 'approve'
        },
        { headers }
      );
      // Mark notification as read
      await axios.post(
        `https://pashuahar.com/follower/notifications/${item?.id}/read/`,
        {},
        { headers }
      );
      fetchNotifications();
      Alert.alert('Success', 'Follow request approved!');
      // Optionally update notification state here
    } catch (e) {
      console.log("eororo", e);
      fetchNotifications();
      Alert.alert('Error', 'Failed to approve follow request.');
    }
  };
  const handleReject = async (item: any) => {
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };
      await axios.post(
        'https://pashuahar.com/follower/follow-request/',
        {
          request_id: item?.data?.request_id,
          action: 'reject'
        },
        { headers }
      );
      // Mark notification as read
      await axios.post(
        `https://pashuahar.com/follower/notifications/${item?.id}/read/`,
        {},
        { headers }
      );
      fetchNotifications();
      Alert.alert('Success', 'Follow request rejected!');
      // Optionally update notification state here
    } catch (e) {
      fetchNotifications();
      Alert.alert('Error', 'Failed to reject follow request.');
    }
  };

  const handleNotificationPress = async (item: any) => {
    console.log("Pressed notification:", item?.id);
    // console.log("itemitemitem12244",item?.id,  item?.data?.follower_id , item?.data?.following_id , item?.data?.liker_id , item?.data?.commenter_id);
    let user_id = item?.data?.follower_id || item?.data?.following_id || item?.data?.liker_id || item?.data?.commenter_id || item?.data?.actor_id;
    console.log("user_id:", user_id);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      console.log("Calling read API:", `https://pashuahar.com/follower/notifications/${item?.id}/read/`);
      await axios.post(
        `https://pashuahar.com/follower/notifications/${item?.id}/read/`,
        {},
        { headers }
      );
      console.log("Read API call successful for notification:", item?.id);
      console.log("yes comes .....");

    } catch (e) {
      console.log("eororo", e);

      // handle error (optional)
    }
    // Navigate to user profile or post
    if (user_id) {
      navigation.navigate('UserProfile' as any, { userId: user_id?.toString(), isFromSearch: true, isFromNotification: true, });
      // navigate('MainTab', {
      //   screen: 'ProfileTab',
      //   params: {
      //     screen: 'Profile',
      //     params: {
      //       userId: user_id.toString(),
      //       isFromSearch: true
      //     }
      //   }
      // });
      // navigation.navigate('UserProfile' as any, { userId: user_id });
    } else if (item.postId) {
      navigation.navigate('PostDetails', { postId: item.postId });
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const isFollowRequest = item?.data?.type === "follow_request";
    const username = item?.user?.username || "";
  
    // Avatar fallback
    const avatarUri =
      item?.data?.follower_profile_picture ||
      item?.data?.liker_profile_picture ||
      item?.data?.commenter_profile_picture ||
      item?.user?.profile_picture ||
      "https://i.pravatar.cc/150?u=" + (item?.user?.id || "default");
  
    // Media (thumbnail)
    let imageUri: string | undefined;
    if (Array.isArray(item?.data?.media)) {
      imageUri = item?.data?.media[0];
    } else {
      imageUri = item?.data?.media;
    }
  
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 16,
        }}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        {/* Left → Avatar */}
        <Image
          source={{ uri: avatarUri }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#eee",
            marginRight: 12,
          }}
        />
  
        {/* Middle → Content */}
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={{ fontSize: 14, color: "#bea063", flexShrink: 1 }}>
            {/* {username ? <Text style={{ fontWeight: "600" }}>{username} </Text> : null} */}
            {item?.body}
          </Text>
          <Text style={{ fontSize: 12, color: "#bea063", marginTop: 2 }}>
            {formatTimeAgo(item?.created_at)}
          </Text>
  
          {isFollowRequest && item?.is_read === false && (
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 6,
                  backgroundColor: "#0095f6",
                  marginRight: 8,
                }}
                onPress={() => handleApprove(item)}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 6,
                  backgroundColor: "#eee",
                }}
                onPress={() => handleReject(item)}
              >
                <Text style={{ color: "#000", fontWeight: "600" }}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
  
        {/* Right → Media Thumbnail */}
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 6,
              marginLeft: 12,
              backgroundColor: "#eee",
            }}
          />
        )}
      </TouchableOpacity>
    );
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#bea063' }}>Loading notifications...</Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#bea063' }}>{error}</Text>
          </View>
        ) : (
          <SectionList
            sections={[{ title: 'All', data: notifications }]}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderNotification({ item })}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            onRefresh={fetchNotifications}
            refreshing={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#bea063',
  },
  listContainer: {
    padding: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 2,
    borderRadius: 8,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    // borderColor:'#333333'
    // backgroundColor: '#333',
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationText: {
    color: '#bea063',
    fontSize: 15,
  },
  username: {
    fontWeight: 'bold',
    color: '#bea063',
  },
  timestamp: {
    color: '#bea063',
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: '#bea063',
    borderColor: '#bea063',
    marginRight: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#fff',
    borderColor: '#bea063',
  },
  rejectButtonText: {
    color: '#bea063',
    fontWeight: 'bold',
  },
});

export default NotificationsScreen; 