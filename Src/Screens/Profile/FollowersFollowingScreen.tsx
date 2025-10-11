import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
const Icon = require('react-native-vector-icons/Ionicons').default;
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getFollowersList, getFollowingList, unfollowUser } from '../../Api/Api';

const FollowersFollowingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { type, userId, username,isFromUUserProfile } = route.params as { type: 'followers' | 'following'; userId: string; username: string,isFromUUserProfile:any };
  // console.log("type, userId, username",isFromUUserProfile,userId,username);
  

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
      console.log("=== FETCHING FOLLOWERS/FOLLOWING DATA ===");
      console.log("tabType:", tabType, "userId:", userId, "isFromUUserProfile:", isFromUUserProfile);
      
      let users: any[] = [];
      
      if (isFromUUserProfile) {
        // Fetch for specific user
        if (tabType === 'followers') {
          users = await getFollowersList(userId?.toString());
        } else {
          users = await getFollowingList(userId?.toString());
        }
      } else {
        // Fetch for current user
        if (tabType === 'followers') {
          users = await getFollowersList();
        } else {
          users = await getFollowingList();
        }
      }
      
      console.log("followers following screen data:", users);
      setUsers(users);
     
    } catch (err) {
      console.log("error in followers following screen", err);
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
    console.log("=== UNFOLLOWING USER ===");
    console.log("user to unfollow:", user?.following?.id);
    
    try {
      setLoading(true);
      
      // Use the configured API function
      const success = await unfollowUser(user?.following?.id);
      
      if (success) {
        // Remove user from list on success
        setUsers(prev => prev.filter(u => u.id !== user.id));
        console.log("Successfully unfollowed user");
      } else {
        setError('Failed to unfollow user');
      }
    } catch (err) {
      console.log("Error unfollowing user:", err);
      setError('Failed to unfollow user');
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: any }) => {
    // Pick the correct user object based on tab
    const userObj = activeTab === 'followers' ? item.follower : item.following;
    const avatar = userObj?.profile_picture;
    const username = userObj?.username || '';
    const fullName = (userObj?.first_name || '') + (userObj?.last_name ? ' ' + userObj.last_name : '');

    return (
      <TouchableOpacity
        style={styles.userRow}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('UserProfile', { userId: userObj?.id,isFromSearch: true, username,isFromFollower:true });
        }}
      >
       { avatar ?  <Image source={{ uri: avatar }} style={styles.avatar} />
      :
       <View style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: '#f5f5f5',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: '#bea063',
                overflow: 'hidden',
                marginRight: 4,
              }}>
                <Ionicons name="person-circle" size={38} color="#bea063" />
              </View> 
      }
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.fullName}>{fullName}</Text>
        </View>
        {activeTab === 'following' && !isFromUUserProfile && (
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
          <Icon name="arrow-back" size={26} color="#bea063" />
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
        <SectionList
          sections={[{ title: 'All ' + activeTab, data: users }]}
          keyExtractor={item => item.id?.toString() || item.username}
          renderItem={renderUserItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#bea063',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 32,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bea063',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#bea063',
  },
  tabText: {
    color: '#bea063',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#bea063',
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#bea063',
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
    borderBottomColor: '#bea063',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#bea06333',
  },
  username: {
    color: '#bea063',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fullName: {
    color: '#bea063',
    fontSize: 13,
  },
  followButton: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#bea063',
    marginRight: 8,
  },
  followingButton: {
    backgroundColor: '#bea06399',
  },
  requestedButton: {
    backgroundColor: '#bea06355',
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