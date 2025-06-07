import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../Navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store/store';
import SearchGrid from '../../Components/SearchGrid';

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Profile'>;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const menuOptions = [
    {
      icon: 'settings-outline',
      label: 'Settings',
      onPress: () => {
        setShowMenu(false);
        setShowSettings(true);
      },
    },
    {
      icon: 'bookmark-outline',
      label: 'Saved',
      onPress: () => {
        setShowMenu(false);
        // Navigate to saved posts
      },
    },
    {
      icon: 'person-add-outline',
      label: 'Invite Friends',
      onPress: () => {
        setShowMenu(false);
        // Handle invite friends
      },
    },
    {
      icon: 'help-circle-outline',
      label: 'Help',
      onPress: () => {
        setShowMenu(false);
        // Navigate to help screen
      },
    },
    {
      icon: 'log-out-outline',
      label: 'Log Out',
      onPress: () => {
        setShowMenu(false);
        // Handle logout
      },
    },
  ];

  const settingsOptions = [
    {
      icon: 'person-outline',
      label: 'Account',
      onPress: () => {
        setShowSettings(false);
        // Navigate to account settings
      },
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {
        setShowSettings(false);
        // Navigate to notification settings
      },
    },
    {
      icon: 'lock-closed-outline',
      label: 'Privacy',
      onPress: () => {
        setShowSettings(false);
        // Navigate to privacy settings
      },
    },
    {
      icon: 'shield-outline',
      label: 'Security',
      onPress: () => {
        setShowSettings(false);
        // Navigate to security settings
      },
    },
  ];

  const renderMenuModal = () => (
    <Modal
      visible={showMenu}
      transparent
      animationType="slide"
      onRequestClose={() => setShowMenu(false)}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowMenu(false)}>
        <View style={styles.menuContainer}>
          {menuOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuOption}
              onPress={option.onPress}>
              <Ionicons name={option.icon} size={24} color="#000" />
              <Text style={styles.menuOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSettings(false)}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowSettings(false)}>
        <View style={styles.settingsContainer}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingsOption}
              onPress={option.onPress}>
              <Ionicons name={option.icon} size={24} color="#000" />
              <Text style={styles.settingsOptionText}>{option.label}</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>{user?.username}</Text>
          <Ionicons name="chevron-down" size={20} color="#000" />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="add-circle-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="menu-outline" size={24} color="#000" onPress={() => setShowMenu(true)} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: user?.profilePicture || 'https://i.pravatar.cc/150' }}
            style={styles.profilePicture}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.name}>{user?.username}</Text>
          <Text style={styles.bio}>{user?.bio || 'No bio yet'}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          <SearchGrid onItemPress={(item) => navigation.navigate('PostDetails', { postId: item.id })} />
        </View>
      </ScrollView>

      {renderMenuModal()}
      {renderSettingsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    padding: 15,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginLeft: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  bioContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#262626',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    marginLeft: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    fontWeight: '600',
  },
  gridContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuOptionText: {
    fontSize: 16,
    marginLeft: 15,
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsOptionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
});

export default ProfileScreen;
