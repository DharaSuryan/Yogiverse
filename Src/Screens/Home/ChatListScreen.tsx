import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, TextInput, Image, SectionList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'Src/Navigation/types';
import Icon from 'react-native-vector-icons/Feather';

type Follower = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  profile_picture?: string; // allow profile_picture for avatar
};

type Group = {
  id: number;
  chat_id: string;
  group_name: string;
  chat_name?: string; // Add chat_name field for single chats
  group_icon?: string; // Add group_icon field
  group_members: {
    members: Follower[];
    total_members: number;
  };
  is_single_chat: boolean;
  last_message?: { message?: string };
  unread_messages: number;
  updated_at?: string; // Add updated_at field
};

type ChatListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatListScreen'>;

// Utility function to format time ago
function formatTimeAgo(dateString: string) {
  const now = new Date();
  const updated = new Date(dateString);
  const diffMs = now.getTime() - updated.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  return 'Just now';
}

const ChatListScreen = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const route = useRoute();
  const { userid } = (route.params || {}) as { userid?: number };
  console.log("gerer ....", userid);
  

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

  // Refresh data when screen comes back into focus (e.g., after adding/removing members)
  useFocusEffect(
    React.useCallback(() => {
      fetchChats();
    }, [])
  );

  const fetchChats = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const res = await axios.get('https://pashuahar.com/chat_app/chats/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("res......",res.data.groups);
      console.log("Current user ID:", currentUserId);
      console.log("Sample group data:", res.data.groups[0]);
      
      setGroups(res.data.groups || []);
    } catch (err) {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (group: Group) => {
    console.log("group chatid",
      group.chat_id,
      "group name",
       group.group_name, 
       group.group_icon, 
       "group members",
       group.group_members, 
       "is single chat",
       group.is_single_chat, 
       "chat name",
       group.chat_name
      ,"group"
      ,group
    );
    console.log("useriduseriduserid",userid);
    
    
    navigation.navigate('ChatScreen', {
      chatId: group.chat_id,
      chat: group,
      is_single_chat: group.is_single_chat,
      chat_name: group.group_name, // or group.chat_name if you want
      group_icon: group.group_icon, // pass group_icon
      group_members: group.group_members,
    
      // group_members: group.group_members,
      userid, // pass it along!
    } as any); // typecast to any to avoid TS error if needed
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

  // Organize groups into sections
  const organizeGroupsIntoSections = () => {
    // Filter groups based on search
    const filteredGroups = groups.filter(group => {
      if (!chatSearch.trim()) return true;
      
      const searchTerm = chatSearch.toLowerCase();
      
      // Search in group name
      if (group.group_name?.toLowerCase().includes(searchTerm)) return true;
      
      // Search in chat name
      if (group.chat_name?.toLowerCase().includes(searchTerm)) return true;
      
      // Search in member names (for single chats)
      if (group.group_members?.members) {
        const memberNames = group.group_members.members
          .map((member: any) => `${member.first_name} ${member.last_name}`.toLowerCase())
          .join(' ');
        if (memberNames.includes(searchTerm)) return true;
      }
      
      // Search in last message
      if (group.last_message?.message?.toLowerCase().includes(searchTerm)) return true;
      
      return false;
    });

    const sections = [
      {
        title: chatSearch.trim() ? `Search Results (${filteredGroups.length})` : '',
        data: filteredGroups
      }
    ];
    return sections;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header with Back button and New Chat button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#bea063" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity onPress={openNewChatModal} style={styles.newChatBtn}>
          <Icon name="plus" size={22} color="#bea063" />
        </TouchableOpacity>
      </View>
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.chatSearchInput}
          placeholder="Search chats, names, or messages..."
          value={chatSearch}
          onChangeText={setChatSearch}
          placeholderTextColor="#999"
        />
        {chatSearch.length > 0 && (
          <TouchableOpacity onPress={() => setChatSearch('')} style={styles.clearSearchBtn}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <SectionList
        sections={organizeGroupsIntoSections()}
        keyExtractor={item => item.chat_id?.toString()}
        renderItem={({ item }: { item: Group }) => {
          let avatar = null;
          let displayName = item.group_name || 'Chat';
          
          // For group chats, check if group_icon is available
          if (!item.is_single_chat && item.group_icon) {
            avatar = item.group_icon;
          }
          
          // For single chats, filter out current user and show only the other member
          if (item.is_single_chat && currentUserId && item.group_members?.members) {
            console.log(`Processing single chat: ${item.group_name}`);
            console.log(`Current user ID: ${currentUserId}`);
            console.log(`Group members:`, item.group_members.members);
            
            // Filter out current user from members array
            const otherMembers = item.group_members.members.filter((m: any) => m.id !== currentUserId);
            console.log(`Other members (filtered):`, otherMembers);
            
            if (otherMembers.length > 0) {
              // Use the first other member (should be only one in single chat)
              const otherMember = otherMembers[0];
              avatar = otherMember.profile_picture;
              displayName = `${otherMember.first_name} ${otherMember.last_name}`;
              console.log(`Display name set to: ${displayName}`);
            } else {
              // If no other members found, try to use chat_name or fallback to group_name
              displayName = item.chat_name || item.group_name || 'Chat';
              console.log(`No other members found, using chat_name/group_name: ${displayName}`);
            }
          } else if (item.is_single_chat && item.chat_name) {
            // If we have chat_name but no currentUserId or members, use chat_name
            displayName = item.chat_name;
            console.log(`Using chat_name for single chat: ${displayName}`);
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
                    {!item.is_single_chat && (
                      <Text style={styles.memberCount}>{item.group_members?.total_members || 0} member{item.group_members?.total_members === 1 ? '' : 's'}</Text>
                    )}
                    <Text style={styles.lastMessage}>{item.last_message?.message || 'No messages yet'}</Text>
                    {/* Last updated time */}
                    {item.updated_at && (
                      <Text style={styles.updatedAt}>{formatTimeAgo(item.updated_at)}</Text>
                    )}
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
        renderSectionHeader={({ section: { title } }) => {
          if (!title) return null;
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No chats found.</Text>}
      />
      {/* New Chat Modal */}
      <Modal 
        visible={modalVisible} 
        animationType="slide" 
        onRequestClose={() => setModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
              <Icon name="x" size={24} color="#bea063" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Message</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>
          
          {/* Search Input */}
          <View style={styles.modalSearchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search followers"
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#999"
            />
          </View>
          
          {/* Followers List */}
          <View style={styles.followersListContainer}>
            <SectionList
              sections={[
                {
                  title: 'Select Followers',
                  data: Array.isArray(followers) ? followers.filter(f =>
                    f.first_name.toLowerCase().includes(search.toLowerCase()) ||
                    f.last_name.toLowerCase().includes(search.toLowerCase()) ||
                    f.email.toLowerCase().includes(search.toLowerCase())
                  ) : []
                }
              ]}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelect(item.id)} style={[styles.followerItem, selected.includes(item.id) && styles.selectedFollower]}>
                  <Text style={styles.followerName}>{item.first_name} {item.last_name}</Text>
                  {selected.includes(item.id) && <Icon name="check" size={18} color="#bea063" />}
                </TouchableOpacity>
              )}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No followers found.</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
          
          {/* Group Name Input */}
          {selected.length > 0 && (
            <View style={styles.groupNameContainer}>
              <Text style={styles.groupNameLabel}>Enter Group Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
                placeholderTextColor="#999"
              />
            </View>
          )}
          
          {/* Action Buttons */}
          <View style={styles.modalActions}>
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
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#bea063', // updated
    flex: 1,
    textAlign: 'center',
  },
  newChatBtn: {
    padding: 8,
    // backgroundColor: '#bea063', // optional: uncomment for filled button
    // borderRadius: 8,
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  chatTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#bea063', // updated
  },
  lastMessage: {
    color: '#bea063', // updated
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#bea063',
    flex: 1,
    textAlign: 'center',
  },
  modalHeaderSpacer: {
    width: 40, // Same width as close button for centering
  },
  modalSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  followersListContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  groupNameContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  groupNameLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  modalActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
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
    color: '#bea063', // updated
  },
  input: {
    borderWidth: 1,
    borderColor: '#bea063', // updated
    borderRadius: 8,
    padding: 10,
    marginVertical: 16,
    fontSize: 16,
    color: '#bea063', // updated
  },
  createBtn: {
    backgroundColor: '#bea063', // updated
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
    color: '#bea063', // updated
    fontSize: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#bea063', // updated
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#bea063', // updated
  },
  unreadBadge: {
    backgroundColor: '#bea063', // updated
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
    color: '#bea063', // updated
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatSearchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#262626',
  },
  clearSearchBtn: {
    marginLeft: 8,
    padding: 8,
  },
  clearSearchText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  updatedAt: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
});

export default ChatListScreen; 