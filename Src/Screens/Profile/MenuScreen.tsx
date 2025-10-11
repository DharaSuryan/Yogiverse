import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Image, Alert, ActivityIndicator } from 'react-native';
const Ionicons = require('react-native-vector-icons/Ionicons').default;
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../Api/Api';
import { onTemporaryDeactivateAccountAPICall } from '../../Api/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
const MENU_SECTIONS = [
  {
    title: 'Account Center',
    data: [
      { icon: 'person-circle-outline', label: 'Profile', action: 'ProfileDetails' },
      // You can add more options here
    ],
  },
  // {
  //   title: 'Your Activity',
  //   data: [
  //     { icon: 'bookmark-outline', label: 'Keepers', action: 'Keepers' },
  //     // { icon: 'notifications-outline', label: 'Notifications', action: 'Notifications' },
  //     // { icon: 'chatbubble-ellipses-outline', label: 'Comments', action: 'Comments' },
  //     // { icon: 'time-outline', label: 'Time Spent', action: 'TimeSpent' },
  //     // { icon: 'people-outline', label: 'Close Friends', action: 'CloseFriends' },
  //   ],
  // },
  {
    title: 'From Yogi-verse',
    data: [
      { icon: 'leaf-outline', label: 'Ei', action: 'Ei' },
      // { icon: 'school-outline', label: 'Gurukul', action: 'Gurukul' },
      // { icon: 'restaurant-outline', label: 'SOSE', action: 'SOSE' },
      // { icon: 'flask-outline', label: 'Gir Gauveda', action: 'GirGauveda' },
    ],
  },
  {
    title: 'More',
    data: [
      { icon: 'lock-open-outline', label: 'Change Password', action: 'ChangePassword' },
      { icon: 'trash-outline', label: 'Delete Account', action: 'DeleteAccount' },
      // { icon: 'person-add-outline', label: 'Delete Account', action: 'DeleteAccount' },
      // { icon: 'help-circle-outline', label: 'Help & Support', action: 'Help' },
      { icon: 'log-out-outline', label: 'Log Out', action: 'Logout' },

    ],
  },
];

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
// type MenuScreenProps = {
//   navigation: NativeStackNavigationProp<RootStackParamList>;
// };
export default function MenuScreen({ navigation, route }: { navigation: any; route: any }) {
  const [accountCenterModal, setAccountCenterModal] = useState(false);
  const [twoFA, setTwoFA] = useState(ACCOUNT_CENTER_DATA.security.twoFactorEnabled);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const userData = route?.params?.data;
  const profile = userData?.profile || {};

  // If you want other items to navigate, you can handle here

  // Unified confirmation modal handler for logout and deactivate
  const handleConfirmAction = async ({
    title,
    message,
    confirmText,
    onConfirm,
  }: {
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => Promise<void>;
  }) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: confirmText,
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await onConfirm();
              setLoading(false);
            } catch (error) {
              setLoading(false);
              Alert.alert('Error', `Failed to ${confirmText.toLowerCase()}. Please try again.`);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    handleConfirmAction({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      onConfirm: async () => {
        // 1. Call logout API
        const res = await logoutUser();
        console.log('logout ', res);
        if (res.status === 200) {
          // 2. Clear AsyncStorage
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          // 3. Reset Redux store (dispatch logout action)
          dispatch({ type: 'AUTH_LOGOUT' });
          // 4. Reset to Auth stack (Login screen)
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        } else {
          throw new Error('Logout failed');
        }
      },
    });
  };

  //   const handleDeactivateAccount = async () => {
  //   handleConfirmAction({
  //     title: 'Deactivate Account',
  //     message: 'Are you sure you want to deactivate your account? This action cannot be undone.',
  //     confirmText: 'Deactivate',
  //     onConfirm: async () => {
  //       try {
  //         setLoading(true);
  //         const accessToken = await AsyncStorage.getItem('accessToken');
  //         const res = await onTemporaryDeactivateAccountAPICall(accessToken);
  //         console.log("deactivarte", res);

  //         if (res.status === 200) {

  //           Alert.alert('Success', 'Your account has been deactivated.', [
  //             {
  //               text: 'OK',
  //               onPress: async () => {
  //                 await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
  //                 dispatch({ type: 'AUTH_LOGOUT' });
  //                 navigation.reset({
  //                   index: 0,
  //                   routes: [{ name: 'Auth' }],
  //                 });
  //               },
  //             },
  //           ]);
  //         } else {
  //           Alert.alert('Error', res.error || 'Failed to deactivate your account. Please try again.');
  //         }
  //       } catch (error) {
  //         Alert.alert(
  //           'Error',
  //           error?.message || 'Unexpected error occurred while deactivating your account.'
  //         );
  //       } finally {
  //         setLoading(false);
  //       }
  //     },
  //   });
  // };

  const handleDeleteAccount = async () => {
    handleConfirmAction({
      title: 'Delete Account',
      message: 'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          setLoading(true);
          const accessToken = await AsyncStorage.getItem('accessToken');
          const res = await onTemporaryDeactivateAccountAPICall(accessToken);
          console.log("delete account", res);

          if (res.status === 200) {
            Alert.alert('Success', 'Your account has been permanently deleted.', [
              {
                text: 'OK',
                onPress: async () => {
                  await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                  dispatch({ type: 'AUTH_LOGOUT' });
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                  });
                },
              },
            ]);
          } else {
            Alert.alert('Error', res.error || 'Failed to delete your account. Please try again.');
          }
        } catch (error) {
          Alert.alert(
            'Error',
            error?.message || 'Unexpected error occurred while deleting your account.'
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };
  const handleMenuAction = (action: string) => {
    if (action === 'Logout') {
      handleLogout();
      return;
    }
    if (action === 'ChangePassword') {
      navigation.navigate('ChangePassword');
      return;
    }
    if (action === 'Ei') {
      Linking.openURL('https://ethicalintelligence.in/');
      return;
    }
    if (action === 'DeleteAccount') {
      handleDeleteAccount();
      return;
    }
    if (action) {
      navigation.navigate(action);
    }
  };

  // ... rest of your component code ...

  const MenuOption = ({ icon, label, action, onPress }: { icon: string; label: string; action: string; onPress?: () => void }) => (
    <TouchableOpacity
      style={styles.optionRow}
      onPress={onPress ? onPress : () => handleMenuAction(action)}
    >
      <View style={{ width: 28, alignItems: 'center' }}>
        {React.createElement(Ionicons, { name: icon, size: 22, color: '#222' })}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionText}>{label}</Text>
      </View>
      {React.createElement(Ionicons, { name: 'chevron-forward-outline', size: 18, color: '#bbb', style: { marginLeft: 'auto' } })}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconWrapper}>
          {React.createElement(Ionicons, { name: 'arrow-back', size: 26, color: '#bea063' })}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
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
                  onPress={item.action === 'Logout' ? handleLogout : () => handleMenuAction(item.action)}
                  action={item.action === 'Logout' ? '' : item.action || ''} />
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
                {React.createElement(Ionicons, { name: 'close', size: 24, color: '#555' })}
              </TouchableOpacity>
            </View>
            {/* Profile */}
            <View style={styles.profileRow}>
              {profile.profile_picture ? <Image source={{ uri: (typeof profile.profile_picture === 'string' && profile.profile_picture ? profile.profile_picture : '') as string }} style={styles.avatar} /> :

              <View style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#eee",
                marginRight: 12,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ color: '#bea063', fontSize: 18, fontWeight: 'bold' }}>
                  {(profile.username.charAt(0) || ' ').toUpperCase()}
                </Text>
              </View>}
              <View>
                <Text style={styles.username}>{profile.username}</Text>
                <Text style={styles.info}> {profile.first_name || 'N/A'}</Text>
                <Text style={styles.info}> {profile.phone_no || 'N/A'}</Text>
                <Text style={styles.info}> {profile.email || 'N/A'}</Text>
              </View>
            </View>
            {/* Linked Accounts */}

          </View>
        </View>
      </Modal>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#dab76e" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
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
    color: '#bea063',
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
    // minHeight: 400,
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
