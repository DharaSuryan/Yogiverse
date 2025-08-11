import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Linking, Modal, Alert, SectionList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'Src/Navigation/types';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';
import { getProfile } from '../../Api/Api';
import EmojiPicker from 'rn-emoji-keyboard';

// Types
interface Message {
  id: string | number;
  sent_by: string;
  message: string;
  files_attachment?: { name: string; type: string; data: string }[];
  sent_at: string;
  [key: string]: any;
}

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;

  // Helper function to format time as relative time (e.g., "15 minutes ago")
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diff = now.getTime() - messageTime.getTime();
    
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    
    // For older messages, show date
    return messageTime.toLocaleDateString();
  };

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { chatId, is_single_chat, chat_name, group_icon, group_members, userid } = route.params;
  console.log("uesr .....", userid);
  
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [token, setToken] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; type: string; data: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [restTried, setRestTried] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [socketError, setSocketError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [addMembersModalVisible, setAddMembersModalVisible] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [selectedFollowers, setSelectedFollowers] = useState<number[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);
  const [searchFollowers, setSearchFollowers] = useState('');
  const [editGroupModalVisible, setEditGroupModalVisible] = useState(false);
  const [selectedGroupIcon, setSelectedGroupIcon] = useState<string | null>(null);
  const [groupNameInput, setGroupNameInput] = useState(chat_name || '');
  const [updatingGroup, setUpdatingGroup] = useState(false);
  const [otherMember, setOtherMember] = useState<any | null>(null);
  
  // Fetch other member data for single chat
  // useEffect(() => {
  //   console.log("here comes ....",chat_name, is_single_chat , chatId , token);
    
  //   if (is_single_chat && chatId && token) {
  //     axios.get(`https://pashuahar.com/chat_app/chats/${chatId}/members/`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .then(res => {
  //       if (Array.isArray(res.data)) {
  //         const members = res.data;
  //         const otherMember = members.find((m: any) => m.id !== userid);
  //         setOtherMember(otherMember);
  //       }
  //     })
  //     .catch(err => {
  //       console.error('Error fetching chat members:', err);
  //     });
  //   }
  // }, [is_single_chat, chatId, token, userid]);

  // Helper: is current user admin?
  const isCurrentUserAdmin = React.useMemo(() => {
    const me = group_members.members.find((m: any) => m.id === userid);
    return me && me.type === 'admin';
  }, [group_members, userid]);

  // Helper: should show admin controls (group chat + admin user)
  const shouldShowAdminControls = React.useMemo(() => {
    return !is_single_chat && isCurrentUserAdmin;
  }, [is_single_chat, isCurrentUserAdmin]);

  console.log("is_single_chat:", is_single_chat);
  console.log("isCurrentUserAdmin:", isCurrentUserAdmin);
  console.log("shouldShowAdminControls:", shouldShowAdminControls);

  // Organize messages into sections
  const organizeMessagesIntoSections = () => {
    const sections = [
      {
        title: 'Messages',
        data: messages
      }
    ];
    return sections;
  };

  // Get followers list
  const fetchFollowers = async () => {
    setLoadingFollowers(true);
    try {
      const res = await axios.get('https://pashuahar.com/follower/following/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Followers data:", res.data.data.results);
      
      setFollowers(
        Array.isArray(res.data.data.results)
          ? res.data.data.results.map((item: any) => item.following)
          : []
      );
    } catch (err) {
      console.error('Error fetching followers:', err);
      setFollowers([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Handle follower selection
  const handleFollowerSelect = (followerId: number) => {
    setSelectedFollowers(prev => 
      prev.includes(followerId) 
        ? prev.filter(id => id !== followerId) 
        : [...prev, followerId]
    );
  };

  // Add selected members to chat
  const handleAddSelectedMembers = async () => {
    if (selectedFollowers.length === 0) return;
    
    setAddingMembers(true);
    try {
      // Get existing member IDs
      const existingMemberIds = group_members.members.map((m: any) => m.id);
      
      // Combine existing and new member IDs
      const allMemberIds = [...existingMemberIds, ...selectedFollowers];
      console.log("here comes ....." , allMemberIds);
      // return
      
      
      const res = await axios.patch(`https://pashuahar.com/chat_app/chats/${chatId}/`, {
        members: allMemberIds,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Members added successfully:', res.data);
      
      // Close modal and refresh members
      setAddMembersModalVisible(false);
      setSelectedFollowers([]);
      setSearchFollowers('');
      
      // Show success message and navigate back to refresh chat list
      Alert.alert(
        'Success', 
        'Members added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to ChatListScreen to refresh data
              navigation.goBack();
            }
          }
        ]
      );
      
    } catch (err) {
      console.error('Error adding members:', err);
      Alert.alert('Error', 'Failed to add members. Please try again.');
    } finally {
      setAddingMembers(false);
    }
  };

  // Open add members modal
  const handleAddMembers = () => {
    setAddMembersModalVisible(true);
    setSelectedFollowers([]);
    setSearchFollowers('');
    fetchFollowers();
  };

  // Open edit group modal
  const handleEditGroup = () => {
    setEditGroupModalVisible(true);
    setGroupNameInput(chat_name || '');
    setSelectedGroupIcon(null);
  };

  // Pick group icon
  const handlePickGroupIcon = () => {
    ImagePicker.launchImageLibrary({ 
      mediaType: 'photo', 
      includeBase64: true,
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.8
    }, response => {
      if (response.didCancel || !response.assets || response.assets.length === 0) return;
      const asset = response.assets[0];
      if (asset.base64 && asset.type) {
        setSelectedGroupIcon(`data:${asset.type};base64,${asset.base64}`);
      }
    });
  };

  // Update group details
  const handleUpdateGroup = async () => {
    if (!groupNameInput.trim()) {
      Alert.alert('Error', 'Group name cannot be empty');
      return;
    }

    setUpdatingGroup(true);
    try {
      let updateData: any = {
        group_name: groupNameInput.trim()
      };

      if (selectedGroupIcon) {
        // Convert base64 to FormData for image upload
        const formData = new FormData();
        formData.append('group_name', groupNameInput.trim());
        
        // Extract base64 data and filename from data URL
        const base64Data = selectedGroupIcon.split(',')[1];
        const imageType = selectedGroupIcon.split(';')[0].split(':')[1];
        const fileExtension = imageType.split('/')[1] || 'jpg';
        const fileName = `group_icon_${Date.now()}.${fileExtension}`;
        
        // Append image file to FormData for React Native
        formData.append('group_icon', {
          uri: selectedGroupIcon,
          type: imageType,
          name: fileName,
        } as any);
        
        updateData = formData;
      }
      
      console.log("here comes ......" ,chatId, updateData);
      // return

      const res = await axios.patch(`https://pashuahar.com/chat_app/chats/${chatId}/`, updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          ...(selectedGroupIcon && { 'Content-Type': 'multipart/form-data' })
        },
      });

      console.log('Group updated successfully:', res.data);
      
      // Close modal and show success message
      setEditGroupModalVisible(false);
      Alert.alert(
        'Success', 
        'Group details updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to ChatListScreen to refresh data
              navigation.goBack();
            }
          }
        ]
      );
      
    } catch (err) {
      console.error('Error updating group:', err);
      Alert.alert('Error', 'Failed to update group details. Please try again.');
    } finally {
      setUpdatingGroup(false);
    }
  };
  const handleRemoveMember = async (member: any) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.first_name} ${member.last_name} from this chat?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get existing member IDs excluding the one to remove
              const remainingMemberIds = group_members.members
                .filter((m: any) => m.id !== member.id)
                .map((m: any) => m.id);
              
              console.log("Remaining member IDs after removal:", remainingMemberIds);
              
              const res = await axios.patch(`https://pashuahar.com/chat_app/chats/${chatId}/`, {
                members: remainingMemberIds,
              }, {
                headers: { Authorization: `Bearer ${token}` },
              });
              
              console.log('Member removed successfully:', res.data);
              
              // Show success message and navigate back to refresh chat list
              Alert.alert(
                'Success', 
                `${member.first_name} has been removed from the chat.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to ChatListScreen to refresh data
                      navigation.goBack();
                    }
                  }
                ]
              );
              
            } catch (err) {
              console.error('Error removing member:', err);
              Alert.alert('Error', 'Failed to remove member. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Build a lookup map for group members by id
  const memberMap = React.useMemo(() => {
    if (!group_members?.members) return {};
    const map: { [id: number]: any } = {};
    group_members.members.forEach((m: any) => {
      map[m.id] = m;
    });
    return map;
  }, [group_members]);

  // Get token and user id on mount
  useEffect(() => {
    AsyncStorage.getItem('accessToken').then(t => setToken(t || ''));
    (async () => {
      try {
        const profileRes = await getProfile();
        const id = profileRes?.data?.data?.profile?.id;
        console.log("ied ..........", id);
        
        setCurrentUserId(id);
      } catch (e) {
        setCurrentUserId(null);
      }
    })();
  }, []);

  // WebSocket connection
  useEffect(() => {
    if (!chatId || !token) return;
    setLoading(true);
    setSocketError(false);
    console.log('Connecting to WebSocket:', `wss://pashuahar.com/ws/discuss/${chatId}`);
    console.log('Token:', token);
    const ws = new WebSocket(`wss://pashuahar.com/ws/discuss/${chatId}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(
        JSON.stringify({
          token,
          queryType: 'get_messages',
        })
      );
    };

    ws.onmessage = event => {
      console.log('WebSocket message:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log("here oms ....12344" , data[5]?.attachment_data);
        
        if (Array.isArray(data)) {
          const filtered = data.filter(
            m =>
              typeof m.message === 'string' ||
              (m.files_attachment && m.files_attachment.length > 0)
          );
          setMessages(filtered);
          // If no messages, try REST fallback
          if (filtered.length === 0 && !restTried) {
            fetchMessagesREST();
          } else {
            setLoading(false);
          }
        } else if (data && typeof data === 'object') {
          setMessages(prev => (prev.some(m => m.id === data.id) ? prev : [...prev, data]));
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };

    ws.onerror = (e) => {
      console.log('WebSocket error:', e.message);
      setSocketError(true);
      setLoading(false);
    };
    ws.onclose = (e) => {
      console.log('WebSocket closed:', e.code, e.reason);
      wsRef.current = null;
    };
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [chatId, token]);

  // REST fallback for messages
  const fetchMessagesREST = async () => {
    setRestTried(true);
    try {
      const res = await axios.get(`https://pashuahar.com/chat_app/chats/${chatId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("resresres",res);

      if (Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      }
    } catch {}
    setLoading(false);
  };

  // Pick image/file
  const handlePickFile = async () => {
    ImagePicker.launchImageLibrary({ 
      mediaType: 'mixed',
      includeBase64: true,
      selectionLimit: 10, // Allow up to 10 files to be selected at once
      multiple: true, // Enable multiple selection
    }, response => {
      if (response.didCancel || !response.assets || response.assets.length === 0) return;
      
      // Process all selected assets
      const newFiles = response.assets
        .filter(asset => asset.base64 && asset.fileName && asset.type)
        .map(asset => ({
          name: asset.fileName as string,
          type: asset.type as string,
          data: `data:${asset.type};base64,${asset.base64}`,
        }));

      // Update selected files
      setSelectedFiles(prev => [...prev, ...newFiles]);
    });
  };

  // Send message
  const handleSend = () => {
    if (!input.trim() && selectedFiles.length === 0) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    setSending(true);
    const payload = {
      queryType: 'send_message',
      token,
      content: input,
      files: selectedFiles,
    };
    wsRef.current.send(JSON.stringify(payload));
    setInput('');
    setSelectedFiles([]);
    setSending(false);
  };

  // Updated renderMessage to use memberMap for sender info
  const renderMessage = ({ item }: { item: Message }) => {
    const senderId = item.sender;
    const member = memberMap[senderId];
    const isMe = senderId == userid;

    return (
      <View style={[
        styles.messageRow,
        {
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          backgroundColor: isMe ? '#dcf8c6' : '#fff',
          borderTopLeftRadius: isMe ? 16 : 0,
          borderTopRightRadius: isMe ? 0 : 16,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          marginLeft: isMe ? 40 : 0,
          marginRight: isMe ? 0 : 40,
          borderWidth: 1,
          borderColor: '#e0e0e0',
        },
      ]}>
        {/* Sender info */}
        {!isMe && member && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            {member.profile_picture ? (
              <Image source={{ uri: member.profile_picture }} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 6 }} />
            ) : (
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                <Text style={{ color: '#fff', fontSize: 12 }}>{member.first_name?.[0]}</Text>
              </View>
            )}
            <Text style={styles.senderName}>{member.first_name} {(member.type && !is_single_chat) ? `(${member.type})` : ''}</Text>
          </View>
        )}
        {isMe && (
          <Text style={styles.senderName}>You</Text>
        )}
        <Text style={{
          color: '#222',
          fontSize: 16,
          marginTop: 2,
        }}>{item.message}</Text>
        {/* Render attachment_data if present */}
        {item.attachment_data && Array.isArray(item.attachment_data) && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            {item.attachment_data.map((file, idx) =>
              file.file_url && file.file_name && file.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setPreviewImageUri(file.file_url);
                    setImagePreviewVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Image
                  source={{ uri: file.file_url }}
                  style={{ width: 120, height: 120, marginRight: 8, borderRadius: 8 }}
                  resizeMode="cover"
                />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity key={idx} style={styles.fileAttachment} onPress={() => Linking.openURL(file.file_url)}>
                  <Text numberOfLines={1} style={{ marginLeft: 4, maxWidth: 100 }}>{file.file_name}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
        {/* Existing files_attachment rendering */}
        {item.files_attachment && item.files_attachment.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            {item.files_attachment.map((file, idx) =>
              file && file.type && file.type.startsWith('image/') ? (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setPreviewImageUri(file.data);
                    setImagePreviewVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Image
                  source={{ uri: file.data }}
                  style={{ width: 120, height: 120, marginRight: 8, borderRadius: 8 }}
                  resizeMode="cover"
                />
                </TouchableOpacity>
              ) : (
                <>
                  <Text numberOfLines={1} style={{ marginLeft: 4, maxWidth: 100 }}>{file?.name}</Text>
                </>
              )
            )}
          </View>
        )}
        <Text style={styles.timeText}>{formatRelativeTime(item.sent_at)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 64, paddingLeft: 8, paddingRight: 16, backgroundColor: '#fff', marginTop: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
          {React.createElement(Ionicons, { name: "chevron-back", size: 28, color: "#bea063" })}
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          activeOpacity={0.7}
          onPress={() => {
            if (is_single_chat) {
              const otherMember = group_members.members.find((m: any) => m.id !== userid);
              if (otherMember) {
                navigation.navigate('UserProfile', { 
                  userId: otherMember.id.toString(), 
                  isFromSearch: true 
                });
              }
            } else {
              setMembersModalVisible(true);
            }
          }}
        >
          {is_single_chat ? (
            (() => {
              const otherMember = group_members.members.find((m: any) => m.id !== userid);
              return otherMember ? (
                <>
                  {otherMember.profile_picture ? (
                    <Image source={{ uri: otherMember.profile_picture }} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 8 }} />
                  ) : (
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                      <Text style={{ color: '#fff', fontSize: 20 }}>{otherMember.first_name?.[0]}</Text>
                    </View>
                  )}
                  <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#bea063' }}>{otherMember.first_name} {otherMember.last_name}</Text>
                    {otherMember.username && (
                      <Text style={{ fontSize: 13, color: '#888' }}>@{otherMember.username}</Text>
                    )}
                  </View>
                </>
              ) : null;
            })()
          ) : (
            <>
            
              {group_icon ? (
                <Image source={{ uri: group_icon }} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 8 }} />
              ) : (
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                  <Text style={{ color: '#fff', fontSize: 20 }}>{chat_name?.[0]}</Text>
                </View>
              )}
              <View>
                
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#bea063' }}>{chat_name}</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
      {socketError && (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: 'red', fontSize: 16 }}>Could not connect to chat. Please try again.</Text>
        </View>
      )}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : messages.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ color: '#888', fontSize: 16, marginBottom: 16 }}>No messages yet. Start the conversation!</Text>
          <TouchableOpacity
            style={{ backgroundColor: '#3897f0', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 }}
            onPress={() => inputRef.current?.focus()}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Send a Message</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={organizeMessagesIntoSections()}
          keyExtractor={item => item.id.toString()}
          renderItem={renderMessage}
          renderSectionHeader={() => null}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        />
      )}
      {/* File preview - always show above input row */}
      {selectedFiles.length > 0 && (
        <View style={styles.selectedFilesRow}>
          {selectedFiles.map((file, idx) =>
            file && file.type && file.type.startsWith('image/') ? (
              <Image
                key={idx}
                source={{ uri: file.data }}
                style={{ width: 60, height: 60, marginRight: 8, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <View key={idx} style={styles.fileAttachment}>
                <Text numberOfLines={1} style={{ marginLeft: 4, maxWidth: 60 }}>{file?.name}</Text>
              </View>
            )
          )}
        </View>
      )}
      {/* Input row */}
      <View style={styles.inputRowModern}>
        <TouchableOpacity onPress={() => setShowEmojiPicker(true)} style={styles.iconButtonModern}>
          {React.createElement(Ionicons, { name: "happy-outline", size: 24, color: "#bea063" })}
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePickFile} style={styles.iconButtonModern}>
          {React.createElement(Ionicons, { name: "attach-outline", size: 24, color: "#bea063" })}
        </TouchableOpacity>
        <View style={styles.inputContainerModern}>
          {selectedFiles.length > 0 && (
            <View style={styles.selectedFilesInInputRow}>
              {selectedFiles.map((file, idx) =>
                file.type && file.type.startsWith('image/') ? (
                  <View key={idx} style={styles.selectedFileThumbWrapper}>
                    <Image
                      source={{ uri: file.data }}
                      style={{ width: 40, height: 40, borderRadius: 8, marginRight: 4, marginBottom: 4 }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeThumbButton}
                      onPress={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                    >
                      <Text style={styles.removeThumbText}>✖</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View key={idx} style={[styles.fileAttachment, styles.selectedFileThumbWrapper]}>
                    <Text numberOfLines={1} style={{ marginLeft: 4, maxWidth: 40 }}>{file?.name}</Text>
                    <TouchableOpacity
                      style={styles.removeThumbButton}
                      onPress={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                    >
                      <Text style={styles.removeThumbText}>✖</Text>
                    </TouchableOpacity>
                  </View>
                )
              )}
            </View>
          )}
          <TextInput
            ref={inputRef}
            value={input}
            placeholderTextColor="#bea063"
            onChangeText={setInput}
            placeholder="Type a message..."
            style={styles.inputModern}
            multiline
          />
        </View>
        <TouchableOpacity
          onPress={handleSend}
          style={styles.sendButtonModern}
          disabled={sending}
        >
          {React.createElement(Ionicons, { name: "send", size: 22, color: "#fff" })}
        </TouchableOpacity>
      </View>
      <EmojiPicker
        onEmojiSelected={(emoji: { emoji: string }) => setInput(input + emoji.emoji)}
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
      />
      {/* Full Image Preview Modal */}
      <Modal
        visible={imagePreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImagePreviewVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 2 }}
            onPress={() => setImagePreviewVisible(false)}
          >
            <Text style={{ color: '#000', fontSize: 28 }}>×</Text>
          </TouchableOpacity>
          {previewImageUri && (
            <Image
              source={{ uri: previewImageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
      {/* Group Members Modal */}
      <Modal
        visible={membersModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMembersModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff', width: '100%', height: '100%' }}>
          <View style={{ flex: 1, backgroundColor: '#fff', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Modern Header */}
            <View style={styles.modalHeaderModern}>
              <TouchableOpacity onPress={() => setMembersModalVisible(false)} style={styles.backButtonModern}>
                {React.createElement(Ionicons, { name: "chevron-back", size: 28, color: "#bea063" })}
              </TouchableOpacity>
              {!is_single_chat && (
                <View>
                  <Text style={styles.groupNameModern}>{chat_name}</Text>
                  <Text style={styles.memberCountModern}>{group_members.members.length} members</Text>
                </View>
              )}
            </View>
            {/* Section Title */}
            {!is_single_chat && (
              <View style={styles.sectionTitleRowModern}>
                <Text style={styles.sectionTitleModern}>GROUP MEMBERS</Text>
              </View>
            )}
            {/* Add Members Row - Only show for group chats with admin user */}
            {!is_single_chat && shouldShowAdminControls && (
              <TouchableOpacity
                style={styles.addMembersRowModern}
                onPress={handleAddMembers}
              >
                <View style={styles.addMembersIconModern}>
                  <Text style={styles.addMembersPlusModern}>+</Text>
                </View>
                <Text style={styles.addMembersTextModern}>Add members</Text>
              </TouchableOpacity>
            )}
            {/* Member List */}
            <SectionList
              sections={[
                {
                  title: 'Group Members',
                  data: is_single_chat
                    ? group_members.members.filter((m: any) => m.id !== userid)
                    : group_members.members
                }
              ]}
              keyExtractor={item => item.id.toString()}
              style={{ backgroundColor: '#fff' }}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.memberRowModern}
                  onPress={() => {
                    if (!is_single_chat) {
                      navigation.navigate('UserProfile', { 
                        userId: item.id.toString(), 
                        isFromSearch: true 
                      });
                    }
                  }}
                  disabled={is_single_chat}
                >
                  {item.profile_picture ? (
                    <Image source={{ uri: item.profile_picture }} style={styles.avatarModern} />
                  ) : (
                    <View style={styles.avatarPlaceholderModern}>
                      <Text style={styles.avatarInitialModern}>{item.first_name?.[0]}</Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.memberNameModern}>
                      {`${item.first_name} ${item.last_name}`}
                    </Text>
                    {item.type === 'admin' && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>Admin</Text>
                      </View>
                    )}
                  </View>
                  {/* Remove button for admin, not for self, only in group chat */}
                  {!is_single_chat && item.id !== userid && shouldShowAdminControls && (
                    <TouchableOpacity onPress={() => handleRemoveMember(item)} style={styles.removeMemberButtonModern}>
                      <Text style={styles.removeMemberTextModern}>✖</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
              renderSectionHeader={() => null}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24 }}>No members found.</Text>}
            />
          </View>
        </View>
      </Modal>
      
      {/* Add Members Modal */}
      <Modal
        visible={addMembersModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddMembersModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: '#fff',
          width: '100%',
          height: '100%',
        }}>
          <View style={{
            flex: 1,
            backgroundColor: '#fff',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }}>
              <TouchableOpacity onPress={() => setAddMembersModalVisible(false)} style={{ marginRight: 16 }}>
                <Text style={{ fontSize: 24, color: '#262626' }}>{'←'}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Add Members</Text>
                <Text style={{ color: '#888', fontSize: 13 }}>Select followers to add</Text>
              </View>
            </View>
            
            {/* Search Input */}
            <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#f9f9f9',
                }}
                placeholder="Search followers..."
                value={searchFollowers}
                onChangeText={setSearchFollowers}
              />
            </View>
            
            {/* Followers List */}
            {loadingFollowers ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#bea063" />
                <Text style={{ marginTop: 16, color: '#888' }}>Loading followers...</Text>
              </View>
            ) : (
              <SectionList
                sections={[
                  {
                    title: 'Followers',
                    data: followers.filter(follower => 
                      follower.first_name.toLowerCase().includes(searchFollowers.toLowerCase()) ||
                      follower.last_name.toLowerCase().includes(searchFollowers.toLowerCase()) ||
                      follower.email.toLowerCase().includes(searchFollowers.toLowerCase())
                    )
                  }
                ]}
                keyExtractor={item => item.id.toString()}
                style={{ backgroundColor: '#fff' }}
                contentContainerStyle={{ paddingBottom: 80 }}
                renderItem={({ item }) => {
                  const isSelected = selectedFollowers.includes(item.id);
                  const isAlreadyMember = group_members.members.some((m: any) => m.id === item.id);
                  
                  return (
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderBottomWidth: 1,
                        borderColor: '#f0f0f0',
                        backgroundColor: isSelected ? '#f0f8ff' : '#fff',
                        opacity: isAlreadyMember ? 0.5 : 1,
                      }}
                      onPress={() => !isAlreadyMember && handleFollowerSelect(item.id)}
                      disabled={isAlreadyMember}
                    >
                      {item.profile_picture ? (
                        <Image source={{ uri: item.profile_picture }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                      ) : (
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <Text style={{ color: '#fff', fontSize: 18 }}>{item.first_name?.[0]}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '500' }}>
                          {item.first_name} {item.last_name}
                        </Text>
                        {isAlreadyMember && (
                          <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Already a member</Text>
                        )}
                      </View>
                      {isSelected && !isAlreadyMember && (
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#bea063', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 16 }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
                renderSectionHeader={({ section: { title } }) => (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{title}</Text>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
                    <Text style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>
                      {loadingFollowers ? 'Loading followers...' : 'No followers found.'}
                    </Text>
                  </View>
                }
              />
            )}
            
            {/* Add Button */}
            {selectedFollowers.length > 0 && (
              <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderColor: '#eee',
                padding: 16,
              }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#bea063',
                    borderRadius: 8,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                  onPress={handleAddSelectedMembers}
                  disabled={addingMembers}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                    {addingMembers ? 'Adding...' : `Add ${selectedFollowers.length} member${selectedFollowers.length > 1 ? 's' : ''}`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        visible={editGroupModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditGroupModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: '#fff',
          width: '100%',
          height: '100%',
        }}>
          <View style={{
            flex: 1,
            backgroundColor: '#fff',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }}>
              <TouchableOpacity onPress={() => setEditGroupModalVisible(false)} style={{ marginRight: 16 }}>
                <Text style={{ fontSize: 24, color: '#262626' }}>{'←'}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Edit Group</Text>
                <Text style={{ color: '#888', fontSize: 13 }}>Update group details</Text>
              </View>
            </View>
            
            {/* Content */}
            <View style={{ flex: 1, padding: 16 }}>
              {/* Group Icon Section */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 12, color: '#262626' }}>Group Icon</Text>
                <TouchableOpacity onPress={handlePickGroupIcon} style={{ alignItems: 'center' }}>
                  {selectedGroupIcon ? (
                    <Image 
                      source={{ uri: selectedGroupIcon }} 
                      style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 40, 
                      backgroundColor: '#f0f0f0', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginBottom: 8,
                      borderWidth: 2,
                      borderColor: '#ddd',
                      borderStyle: 'dashed'
                    }}>
                      <Text style={{ fontSize: 24, color: '#888' }}>📷</Text>
                    </View>
                  )}
                  <Text style={{ color: '#bea063', fontSize: 14, fontWeight: '500' }}>
                    {selectedGroupIcon ? 'Change Icon' : 'Select Icon'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Group Name Section */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#262626' }}>Group Name</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: '#f9f9f9',
                    color: '#262626',
                  }}
                  placeholder="Enter group name"
                  value={groupNameInput}
                  onChangeText={setGroupNameInput}
                  maxLength={50}
                />
              </View>

              {/* Update Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#bea063',
                  borderRadius: 8,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginTop: 16,
                }}
                onPress={handleUpdateGroup}
                disabled={updatingGroup || !groupNameInput.trim()}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                  {updatingGroup ? 'Updating...' : 'Update Group'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  adminBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#bea063',
    borderRadius: 4,
  },
  adminBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  messageRow: {
    borderRadius: 10,
    marginBottom: 12,
    padding: 10,
    maxWidth: '80%',
  },
  messageText: { fontSize: 16, color: '#222', marginTop: 2 },
  senderName: { fontWeight: 'bold', fontSize: 13, color: '#388e3c', marginBottom: 2 },
  timeText: { fontSize: 10, color: '#888', marginTop: 4, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
    fontSize: 16,
    marginHorizontal: 8,
  },
  iconButton: {
    padding: 8,
  },
  selectedFilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 6,
    padding: 4,
    marginRight: 8,
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
  // Modern chat input row styles
  inputRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#bea063',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  iconButtonModern: {
    padding: 8,
    marginRight: 4,
  },
  inputContainerModern: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bea063',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputModern: {
    color: '#bea063',
    fontSize: 16,
    minHeight: 40,
    maxHeight: 120,
  },
  sendButtonModern: {
    backgroundColor: '#bea063',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modern Group Members Modal styles
  modalHeaderModern: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  backButtonModern: {
    marginRight: 16,
  },
  groupNameModern: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  memberCountModern: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  sectionTitleRowModern: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitleModern: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 1,
  },
  memberRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  avatarModern: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholderModern: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitialModern: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberNameModern: {
    fontSize: 16,
    color: '#222',
  },
  memberNameMeModern: {
    fontWeight: 'bold',
  },
  addMembersRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  addMembersIconModern: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f4ec',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#bea063',
  },
  addMembersPlusModern: {
    fontSize: 24,
    color: '#bea063',
    fontWeight: 'bold',
  },
  addMembersTextModern: {
    fontSize: 16,
    color: '#bea063',
    fontWeight: 'bold',
  },
  removeMemberButtonModern: {
    marginLeft: 'auto',
    padding: 8,
  },
  removeMemberTextModern: {
    fontSize: 22,
    color: '#bea063',
    fontWeight: 'bold',
  },
  selectedFilesInInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedFileThumbWrapper: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 4,
  },
  removeThumbButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bea063',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 2,
  },
  removeThumbText: {
    color: '#bea063',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});

export default ChatScreen; 