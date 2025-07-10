import React from 'react';
import { View, Text, Image } from 'react-native';

const ProfileHeader = ({ profile }) => {
  return (
    <View style={{ alignItems: 'center', padding: 16 }}>
      <Image
        source={{ uri: profile.profile_picture }}
        style={{ width: 100, height: 100, borderRadius: 50 }}
      />
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>
        {profile.username}
      </Text>
      {profile.bio ? <Text style={{ marginTop: 4 }}>{profile.bio}</Text> : null}
    </View>
  );
};

export default ProfileHeader;
