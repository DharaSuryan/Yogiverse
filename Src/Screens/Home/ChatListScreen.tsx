import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, TextInput, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'Src/Navigation/types';
import Icon from 'react-native-vector-icons/Feather';

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
  unread_messages: number;
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchChats();
    // Get current user id for rendering chat list avatars
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUserId(user.id);
        }
      } catch {}
    })();
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const res = await axios.get('https://pashuahar.com/chat_app/chats/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("res......",res.data.groups[0]?.group_members);
      
      setGroups(res.data.groups || []);
    } catch (err) {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (group: Group) => {
    navigation.navigate('ChatScreen', {
      chatId: group.chat_id,
      chat: group,
      is_single_chat: group.is_single_chat,
      chat_name: group.group_name, // or group.chat_name if you want
      group_members: group.group_members
    });
  };

  const handleGroupDetails = async (group: Group) => {
    // Get current user id from AsyncStorage (or context if available)
    let current_user_id = null;
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        current_user_id = user.id;
      }
    } catch {}
    navigation.navigate('GroupDetailsScreen', { group: { ...group, current_user_id } });
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

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header with New Chat button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity onPress={openNewChatModal} style={styles.newChatBtn}>
          <Icon name="edit-2" size={22} color="#262626" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={groups}
        keyExtractor={item => item.chat_id?.toString()}
        renderItem={({ item }: { item: Group }) => {
          let avatar = null;
          let displayName = item.group_name || 'Chat';
          if (item.is_single_chat && currentUserId && item.group_members?.members) {
            const otherMember = item.group_members.members.find((m: any) => m.id !== currentUserId);
            if (otherMember) {
              avatar = otherMember.profile_picture;
              displayName = `${otherMember.first_name} ${otherMember.last_name}`;
            }
          }
          return (
            <TouchableOpacity onPress={() => handleChatPress(item)} onLongPress={() => handleGroupDetails(item)} style={styles.chatItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                  ) : (
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ color: '#fff', fontSize: 18 }}>{displayName[0]}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.chatTitle, item.unread_messages > 0 && { fontWeight: 'bold' }]}>{displayName}</Text>
                    <Text style={styles.memberCount}>{item.group_members?.total_members || 0} member{item.group_members?.total_members === 1 ? '' : 's'}</Text>
                    <Text style={styles.lastMessage}>{item.last_message?.message || 'No messages yet'}</Text>
                  </View>
                </View>
                {item.unread_messages > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{item.unread_messages}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No chats found.</Text>}
      />
      {/* New Chat Modal */}
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
                {selected.includes(item.id) && <Icon name="check" size={18} color="#3897f0" />}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#262626',
  },
  newChatBtn: {
    padding: 8,
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  chatTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#262626',
  },
  lastMessage: {
    color: '#888',
    marginTop: 2,
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
  unreadBadge: {
    backgroundColor: '#3897f0',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  memberCount: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
});

export default ChatListScreen; 