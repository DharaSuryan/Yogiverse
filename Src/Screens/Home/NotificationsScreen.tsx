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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../Navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Notification } from '../../Types';
import { useFocusEffect } from '@react-navigation/native';

type NotificationsScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Notifications'>;
};

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    userId: '2',
    username: 'user2',
    userProfilePicture: 'https://i.pravatar.cc/150?u=2',
    postId: '1',
    timestamp: '2h',
    isRead: false,
  },
  {
    id: '2',
    type: 'comment',
    userId: '3',
    username: 'user3',
    userProfilePicture: 'https://i.pravatar.cc/150?u=3',
    postId: '1',
    commentId: '1',
    timestamp: '3h',
    isRead: false,
  },
  {
    id: '3',
    type: 'follow',
    userId: '4',
    username: 'user4',
    userProfilePicture: 'https://i.pravatar.cc/150?u=4',
    timestamp: '4h',
    isRead: true,
  },
  {
    id: '4',
    type: 'mention',
    userId: '5',
    username: 'user5',
    userProfilePicture: 'https://i.pravatar.cc/150?u=5',
    postId: '2',
    commentId: '2',
    timestamp: '5h',
    isRead: false,
  },
];

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

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
  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Navigate based on notification type
    if (notification.postId) {
      navigation.navigate('PostDetails', { postId: notification.postId });
    } else if (notification.type === 'follow') {
      navigation.navigate('Profile');
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}>
      <Image
        source={{ uri: item.userProfilePicture }}
        style={styles.userAvatar}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          <Text style={styles.username}>{item.username}</Text>{' '}
          {getNotificationText(item)}
        </Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <Ionicons
        name={getNotificationIcon(item.type)}
        size={20}
        color={item.type === 'like' ? '#ed4956' : '#666'}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  listContainer: {
    padding: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  unreadNotification: {
    backgroundColor: '#fafafa',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  notificationText: {
    fontSize: 14,
    color: '#262626',
  },
  username: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 2,
  },
});

export default NotificationsScreen; 