import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Image, Switch, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../Api/Api';
import { logout } from 'Src/Store/actions/authActions';
const MENU_SECTIONS = [
  {
    title: 'Account Center',
    data: [
      { icon: 'person-circle-outline', label: 'Profile', action: 'ProfileDetails' },
      // You can add more options here
    ],
  },
  {
    title: 'Your Activity',
    data: [
      { icon: 'bookmark-outline', label: 'Keepers', action: 'Keepers' },
      { icon: 'notifications-outline', label: 'Notifications', action: 'Notifications' },
      { icon: 'chatbubble-ellipses-outline', label: 'Comments', action: 'Comments' },
      // { icon: 'time-outline', label: 'Time Spent', action: 'TimeSpent' },
      // { icon: 'people-outline', label: 'Close Friends', action: 'CloseFriends' },
    ],
  },
  {
    title: 'From Yogi-verse',
    data: [
      { icon: 'leaf-outline', label: 'Gaushala', action: 'Gaushala' },
      { icon: 'school-outline', label: 'Gurukul', action: 'Gurukul' },
      { icon: 'restaurant-outline', label: 'SOSE', action: 'SOSE' },
      { icon: 'flask-outline', label: 'Gir Gauveda', action: 'GirGauveda' },
    ],
  },
  {
    title: 'More',
    data: [
      { icon: 'person-add-outline', label: 'Add Account', action: 'AddAccount' },
      { icon: 'help-circle-outline', label: 'Help & Support', action: 'Help' },
      { icon: 'log-out-outline', label: 'Log Out', action: 'Logout' },

    ],
  },
];

// Dummy account center data (replace with API later)
const ACCOUNT_CENTER_DATA = {
  user: {
    username: 'yogi_123',
    email: 'yogi@example.com',
    profilePicture: 'https://randomuser.me/api/portraits/men/11.jpg',
    bio: 'Yoga Enthusiast | Nature Lover',
    dateOfBirth: '1995-06-05',
    contactInfo: '+91 9000000000',
  },
  linkedAccounts: [
    {
      id: 2,
      username: 'yogi_business',
      profilePicture: 'https://randomuser.me/api/portraits/men/12.jpg',
    },
    {
      id: 3,
      username: 'yogi_personal',
      profilePicture: 'https://randomuser.me/api/portraits/men/13.jpg',
    }
  ],
  security: {
    twoFactorEnabled: true,
    backupEmail: 'backup@example.com',
    backupPhone: '+91 9000000001',
    lastPasswordChange: '2024-05-15',
  }
};

export default function MenuScreen({ navigation }) {
  const [accountCenterModal, setAccountCenterModal] = useState(false);
  const [twoFA, setTwoFA] = useState(ACCOUNT_CENTER_DATA.security.twoFactorEnabled);
 const dispatch = useDispatch();

  // If you want other items to navigate, you can handle here
  const handleMenuAction = (action) => {
    // Example: navigation logic for other menu options
    // switch(action) { ... }
  };
 const handleLogout = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                // Call logout API
                await logoutUser();
                
                // Dispatch logout action to clear Redux state
                dispatch(logout());
                
                // Navigate to Auth screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }]
                });
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };
  const MenuOption = ({ icon, label, action, onPress }) => (
    <TouchableOpacity 
      style={styles.optionRow} 
      onPress={onPress ? onPress : () => handleMenuAction(action)}
    >
      <Ionicons name={icon} size={22} color="#222" style={{ width: 28 }} />
      <Text style={styles.optionText}>{label}</Text>
      <Ionicons name="chevron-forward-outline" size={18} color="#bbb" style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconWrapper}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setting</Text>
        <View style={{ width: 32 }} /> {/* for symmetrical spacing */}
      </View>
      <ScrollView>
        {MENU_SECTIONS.map((section, idx) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map((item) =>
              section.title === "Account Center" && item.label === "Profile" ? (
                <MenuOption
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  action={item.action}
                  onPress={() => setAccountCenterModal(true)}
                    
                />
              ) : (
                <MenuOption
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    onPress={item.action === 'Logout' ? handleLogout : undefined} action={undefined}/>
              )
            )}
          </View>
        ))}
      </ScrollView>

      {/* Account Center Modal */}
      <Modal
        visible={accountCenterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAccountCenterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.modalTitle}>Account Center</Text>
              <TouchableOpacity onPress={() => setAccountCenterModal(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            {/* Profile */}
            <View style={styles.profileRow}>
              <Image source={{ uri: ACCOUNT_CENTER_DATA.user.profilePicture }} style={styles.avatar} />
              <View>
                <Text style={styles.username}>{ACCOUNT_CENTER_DATA.user.username}</Text>
                <Text style={styles.email}>{ACCOUNT_CENTER_DATA.user.email}</Text>
                <Text style={styles.bio}>{ACCOUNT_CENTER_DATA.user.bio}</Text>
              </View>
            </View>
            {/* Linked Accounts */}
            <Text style={[styles.modalSectionTitle, { marginTop: 8 }]}>Linked Accounts</Text>
            {ACCOUNT_CENTER_DATA.linkedAccounts.map(acc => (
              <View key={acc.id} style={styles.linkedRow}>
                <Image source={{ uri: acc.profilePicture }} style={styles.linkedAvatar} />
                <Text style={styles.linkedUsername}>{acc.username}</Text>
                <TouchableOpacity style={styles.switchBtn}>
                  <Ionicons name="swap-horizontal-outline" size={18} color="#555" />
                  <Text style={styles.switchBtnText}>Switch</Text>
                </TouchableOpacity>
              </View>
            ))}
            {/* Security */}
            <Text style={[styles.modalSectionTitle, { marginTop: 8 }]}>Security</Text>
            <View style={styles.row}>
              <Text>Two-Factor Authentication</Text>
              <Switch value={twoFA} onValueChange={setTwoFA} />
            </View>
            <Text style={styles.info}>Backup Email: {ACCOUNT_CENTER_DATA.security.backupEmail}</Text>
            <Text style={styles.info}>Backup Phone: {ACCOUNT_CENTER_DATA.security.backupPhone}</Text>
            <Text style={styles.info}>Last Password Change: {ACCOUNT_CENTER_DATA.security.lastPasswordChange}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 12,
  paddingTop: 16,
  paddingBottom: 12,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},
backIconWrapper: {
  width: 32,
  height: 32,
  alignItems: 'center',
  justifyContent: 'center',
},
headerTitle: {
  flex: 1,
  textAlign: 'center',
  fontSize: 18,
  fontWeight: 'bold',
  color: '#222',
},
  sectionTitle: {
    fontSize: 13,
    color: '#888',
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 6,
    marginLeft: 18,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 400,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  modalSectionTitle: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 54, height: 54, borderRadius: 27, marginRight: 12 },
  username: { fontSize: 16, fontWeight: 'bold' },
  email: { color: '#888', fontSize: 14 },
  bio: { fontSize: 13, color: '#555' },
  linkedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  linkedAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  linkedUsername: { flex: 1, fontSize: 15 },
  switchBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f4f4', borderRadius: 8, padding: 6 },
  switchBtnText: { marginLeft: 4, color: '#555' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  info: { fontSize: 13, color: '#666', marginTop: 2 },
});
