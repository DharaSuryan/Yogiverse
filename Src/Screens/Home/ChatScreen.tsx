import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from 'Src/Navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';

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

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { chatId } = route.params;
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

  // Get token on mount
  useEffect(() => {
    AsyncStorage.getItem('accessToken').then(t => setToken(t || ''));
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
      if (Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      }
    } catch {}
    setLoading(false);
  };

  // Pick image/file
  const handlePickFile = async () => {
    ImagePicker.launchImageLibrary({ mediaType: 'mixed', includeBase64: true }, response => {
      if (response.didCancel || !response.assets || response.assets.length === 0) return;
      const asset = response.assets[0];
      if (asset.base64 && asset.fileName && asset.type) {
        setSelectedFiles(prev => [
          ...prev,
          { name: asset.fileName as string, type: asset.type as string, data: `data:${asset.type};base64,${asset.base64}` },
        ]);
      }
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

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageRow, { alignSelf: item.sent_by === token ? 'flex-end' : 'flex-start' }]}> 
      <Text style={styles.messageText}>{item.message}</Text>
      {item.files_attachment && item.files_attachment.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
          {item.files_attachment.map((file, idx) =>
            file.type.startsWith('image/') ? (
              <Image
                key={idx}
                source={{ uri: file.data }}
                style={{ width: 120, height: 120, marginRight: 8, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <TouchableOpacity key={idx} style={styles.fileAttachment}>
                <Icon name="document" size={20} color="#555" />
                <Text numberOfLines={1} style={{ marginLeft: 4, maxWidth: 100 }}>{file.name}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}
      <Text style={styles.timeText}>{new Date(item.sent_at).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
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
        <FlatList
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        />
      )}
      {/* File preview */}
      {selectedFiles.length > 0 && (
        <View style={styles.selectedFilesRow}>
          {selectedFiles.map((file, idx) =>
            file.type.startsWith('image/') ? (
              <Image
                key={idx}
                source={{ uri: file.data }}
                style={{ width: 60, height: 60, marginRight: 8, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <View key={idx} style={styles.fileAttachment}>
                <Icon name="document" size={20} color="#555" />
                <Text numberOfLines={1} style={{ marginLeft: 4, maxWidth: 60 }}>{file.name}</Text>
              </View>
            )
          )}
        </View>
      )}
      {/* Input row */}
      <View style={styles.inputRow}>
        <TouchableOpacity onPress={handlePickFile} style={styles.iconButton}>
          <Icon name="attach" size={24} color="#bea063" />
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
          multiline
        />
        <TouchableOpacity onPress={handleSend} style={styles.iconButton} disabled={sending}>
          <Icon name="send" size={24} color={sending ? '#ccc' : '#bea063'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  messageRow: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginBottom: 12,
    padding: 10,
    maxWidth: '80%',
  },
  messageText: { fontSize: 16, color: '#222' },
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
});

export default ChatScreen; 