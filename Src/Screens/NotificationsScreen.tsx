import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';

const NotificationsScreen = () => {
  const notifications = [
    { id: '1', type: 'like', message: 'John liked your post' },
    { id: '2', type: 'comment', message: 'Sarah commented on your post' },
    { id: '3', type: 'follow', message: 'Mike started following you' },
  ];

  const renderNotification = ({ item }: { item: typeof notifications[0] }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>{item.message}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
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
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  notificationText: {
    fontSize: 16,
  },
});

export default NotificationsScreen; 