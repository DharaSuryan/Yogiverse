import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'Src/Navigation/types';

// Type for group member
interface GroupMember {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  type?: string;
  username?: string;
}

type GroupDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetailsScreen'>;

const GroupDetailsScreen = () => {
  const route = useRoute<GroupDetailsScreenRouteProp>();
  const navigation = useNavigation();
  const { group } = route.params;
  const members: GroupMember[] = group?.group_members?.members || [];
  const currentUserId = group?.current_user_id; // You may need to pass this in params or get from context
  const currentUser = members.find(m => m.id === currentUserId);
  const isAdmin = currentUser?.type === 'admin';

  const handleEditGroup = () => {
    Alert.alert('Edit Group', 'Edit group functionality goes here.');
  };
  const handleAddMember = () => {
    Alert.alert('Add Member', 'Add member functionality goes here.');
  };
  const handleRemoveMember = (member: GroupMember) => {
    Alert.alert('Remove Member', `Remove ${member.first_name} from group?`);
  };
  const handleDeleteGroup = () => {
    Alert.alert('Delete Group', 'Delete group functionality goes here.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{group.group_name || 'Group'}</Text>
      <Text style={styles.memberCount}>{members.length} member{members.length === 1 ? '' : 's'}</Text>
      <FlatList
        data={members}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Image
              source={item.profile_picture ? { uri: item.profile_picture } : require('Src/Assets/userProfile.png')}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{item.first_name} {item.last_name}</Text>
              <Text style={styles.memberType}>{item.type === 'admin' ? 'Admin' : 'Member'}</Text>
            </View>
            {isAdmin && item.id !== currentUserId && (
              <TouchableOpacity onPress={() => handleRemoveMember(item)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No members found.</Text>}
      />
      {isAdmin && (
        <View style={styles.adminActions}>
          <TouchableOpacity onPress={handleEditGroup} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Edit Group</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddMember} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Add Member</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteGroup} style={[styles.actionBtn, { backgroundColor: '#f55' }] }>
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>Delete Group</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#262626' },
  memberCount: { color: '#888', fontSize: 14, marginBottom: 16 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#eee' },
  memberName: { fontSize: 16, color: '#262626' },
  memberType: { fontSize: 12, color: '#888' },
  removeBtn: { backgroundColor: '#eee', borderRadius: 8, padding: 8, marginLeft: 8 },
  removeBtnText: { color: '#f55', fontWeight: 'bold' },
  adminActions: { marginTop: 24 },
  actionBtn: { backgroundColor: '#3897f0', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 10 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backBtn: { alignItems: 'center', padding: 10, marginTop: 16 },
  backBtnText: { color: '#3897f0', fontSize: 16 },
});

export default GroupDetailsScreen; 