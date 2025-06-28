import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
const Icon = require('react-native-vector-icons/Ionicons').default;
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FollowersFollowingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { type, userId, username } = route.params as { type: 'followers' | 'following'; userId: string; username: string };

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(type);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tabType: 'followers' | 'following') => {
    setLoading(true);
    setError(null);
    try {
      const authToken = await AsyncStorage.getItem('accessToken');

      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      // Replace with your actual API endpoints
      // const params = {
      //   page: 1,
      //   page_size: 20,
      // }
      const endpoint = tabType === 'followers'
        ? `https://pashuahar.com/follower/followers`
        : `https://pashuahar.com/follower/following`
      const res = await axios.get(endpoint,{headers});
      console.log("followers following screen",res.data?.data?.results);
      
      setUsers(res.data.data?.results || []);
    } catch (err) {
      console.log("error in followers following screen",err);
      
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = (user: any) => {
    // Implement follow/unfollow/request logic here
    // Optionally update UI optimistically
  };

  const handleRemove = async (user: any) => {
    console.log("user",user?.following?.id);
    // return
    
    
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem('accessToken');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };
      // Call unfollow API
      await axios.post('https://pashuahar.com/follower/unfollow/', {
        user_id: user?.following?.id
      }, { headers });
      // Remove user from list on success
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      console.log("here come here",err);
      
      setError('Failed to unfollow user');
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: any }) => {
    // Pick the correct user object based on tab
    const userObj = activeTab === 'followers' ? item.follower : item.following;
    const avatar = userObj?.profile_picture || 'https://picsum.photos/100';
    const username = userObj?.username || '';
    const fullName = (userObj?.first_name || '') + (userObj?.last_name ? ' ' + userObj.last_name : '');

    return (
      <TouchableOpacity
        style={styles.userRow}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('UserProfile', { userId: userObj?.id, username });
        }}
      >
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.fullName}>{fullName}</Text>
        </View>
        {activeTab === 'following' && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={e => {
              e.stopPropagation();
              handleRemove(item);
            }}
          >
            <Icon name="close" size={22} color="#aaa" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{username}</Text>
      </View>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>Following</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 30 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id?.toString() || item.username}
          renderItem={renderUserItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListHeaderComponent={<Text style={styles.sectionTitle}>All {activeTab}</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181818' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#181818',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 32,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#181818',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  tabText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginVertical: 16,
    marginLeft: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#181818',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#333',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fullName: {
    color: '#aaa',
    fontSize: 13,
  },
  followButton: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#222',
    marginRight: 8,
  },
  followingButton: {
    backgroundColor: '#333',
  },
  requestedButton: {
    backgroundColor: '#444',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  removeButton: {
    padding: 4,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 30,
  },
});

export default FollowersFollowingScreen; 