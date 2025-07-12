import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, TextInput, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'Src/Navigation/types';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
const Feather = require('react-native-vector-icons/Feather').default;

type Follower = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
};

type Group = {
  id: number;
  chat_id: string;
  group_name: string;
  group_members: {
    members: Follower[];
    total_members: number;
  };
  is_single_chat: boolean;
  last_message?: { message?: string };
};

type ChatListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatListScreen'>;

const ChatListScreen = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const username = 'keval_joshi08'; // Replace with actual username from context if available

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const res = await axios.get('https://pashuahar.com/chat_app/chats/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("res......",res.data.groups);
      
      setGroups(res.data.groups || []);
    } catch (err) {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (group: Group) => {
    navigation.navigate('ChatScreen', { chatId: group.chat_id, chat: group });
  };

  const openNewChatModal = async () => {
    setModalVisible(true);
    setSelected([]);
    setGroupName('');
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const res = await axios.get('https://pashuahar.com/follower/following/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("here comes data...",res.data.data.results);
      
      setFollowers(
        Array.isArray(res.data.data.results)
          ? res.data.data.results.map((item: any) => item.following)
          : []
      );
    } catch (err) {
      setFollowers([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreateChat = async () => {
    console.log("selectes ......",selected);
    // return
    
    if (selected.length === 0 && groupName.length == 0 ) return;
    setCreating(true);
    const token = await AsyncStorage.getItem('accessToken');
    try {
      await axios.post('https://pashuahar.com/chat_app/chats/', {
        members: selected,
        group_name: groupName || 'Chat',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalVisible(false);
      fetchChats();
    } catch (err) {
      // handle error
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} />;

  // Filter groups by search (group name or member name/email)
  const filteredGroups = groups.filter(group => {
    const searchLower = search.toLowerCase();
    if (group.group_name && group.group_name.toLowerCase().includes(searchLower)) return true;
    if (group.group_members && group.group_members.members) {
      return group.group_members.members.some(member =>
        (member.first_name && member.first_name.toLowerCase().includes(searchLower)) ||
        (member.last_name && member.last_name.toLowerCase().includes(searchLower)) ||
        (member.email && member.email.toLowerCase().includes(searchLower))
      );
    }
    return false;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={24} color="#262626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{username}</Text>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="camera-outline" size={22} color="#bea063" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={openNewChatModal}>
            <Feather name="edit-2" size={22} color="#bea063" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search person or group"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#aaa"
        />
      </View>
      {/* Chat List */}
      <FlatList
        data={filteredGroups}
        keyExtractor={item => item.chat_id?.toString()}
        renderItem={({ item }: { item: Group }) => (
          <TouchableOpacity onPress={() => handleChatPress(item)} style={styles.chatItem}>
            <View style={styles.chatLeft}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} // Replace with actual user image
                style={styles.avatar}
              />
              <View style={styles.chatTextContainer}>
                <Text style={[styles.chatTitle, !item.last_message?.message && { fontWeight: 'bold' }]} numberOfLines={1}>
                  {item.group_name || 'Chat'}
                </Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.last_message?.message || 'No messages yet'}
                </Text>
              </View>
            </View>
            <View style={styles.chatRight}>
              {/* Blue dot for unread (simulate unread for demo) */}
              <View style={styles.unreadDot} />
              <Text style={styles.timeText}>2m</Text>
              <TouchableOpacity>
                <Ionicons name="camera-outline" size={20} color="#bea063" style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No chats found.</Text>}
      />
      {/* New Chat Modal (unchanged except icon fix) */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>New Message</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search followers"
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={Array.isArray(followers) ? followers.filter(f =>
              f.first_name.toLowerCase().includes(search.toLowerCase()) ||
              f.last_name.toLowerCase().includes(search.toLowerCase()) ||
              f.email.toLowerCase().includes(search.toLowerCase())
            ) : []}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item.id)} style={[styles.followerItem, selected.includes(item.id) && styles.selectedFollower]}>
                <Text style={styles.followerName}>{item.first_name} {item.last_name}</Text>
                {selected.includes(item.id) && <Feather name="check" size={18} color="#3897f0" />}
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No followers found.</Text>}
          />
          {selected.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 6 }}>Enter Group Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>
          )}
          {selected.length > 0 && (
            <TouchableOpacity
              style={[styles.createBtn, (selected.length > 1 && !groupName) && { backgroundColor: '#ccc' }]}
              onPress={handleCreateChat}
              disabled={creating || (selected.length > 1 && !groupName)}
            >
              <Text style={styles.createBtnText}>{creating ? 'Creating...' : 'Start Chat'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  headerIconBtn: {
    padding: 6,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#262626',
    flex: 1,
    textAlign: 'center',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTabBtn: {
    borderBottomWidth: 2,
    borderColor: '#bea063',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#bea063',
    fontWeight: 'bold',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  chatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  chatTextContainer: {
    flex: 1,
  },
  chatTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#262626',
  },
  lastMessage: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  chatRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginLeft: 8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3897f0',
    marginRight: 8,
    alignSelf: 'center',
  },
  timeText: {
    color: '#888',
    fontSize: 12,
    marginRight: 8,
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
    color: '#262626',
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  selectedFollower: {
    backgroundColor: '#f0f8ff',
  },
  followerName: {
    fontSize: 16,
    color: '#262626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginVertical: 16,
    fontSize: 16,
  },
  createBtn: {
    backgroundColor: '#3897f0',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    alignItems: 'center',
    padding: 10,
  },
  cancelBtnText: {
    color: '#3897f0',
    fontSize: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#262626',
    paddingVertical: 0,
  },
});

export default ChatListScreen; 