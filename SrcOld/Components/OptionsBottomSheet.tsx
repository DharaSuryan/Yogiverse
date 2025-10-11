import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal'; // Use react-native-modal for swipe support
const Ionicons = require('react-native-vector-icons/Ionicons').default;

interface OptionsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  onReport?: () => void;
  onSave?: () => void;
  onRemix?: () => void;
  onCutout?: () => void;
  onFavourite?: () => void;
  onUnfollow?: () => void;
  onFollow?: () => void;
  onAbout?: () => void;
  onQRCode?: () => void;
  onWhy?: () => void;
  onHide?: () => void;
  aboutStatusText:any
}

const OptionsBottomSheet: React.FC<OptionsBottomSheetProps> = ({
  visible,
  onClose,
  navigation,
  onReport,
  onSave,
  onRemix,
  onCutout,
  onFavourite,
  onUnfollow,
  onFollow,
  onAbout,
  onQRCode,
  onWhy,
  onHide,
  aboutStatusText
}) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropTransitionOutTiming={600}
      animationOutTiming={600}
      animationInTiming={600}
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
    >
      <View style={styles.sheet}>
        {/* Drag indicator */}
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <View style={styles.dragIndicator} />
        </View>
        {/* Grid row */}
        {/* <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridItem} onPress={onSave}>
            {React.createElement(Ionicons, { name: 'bookmark-outline', size: 28, color: '#222' })}
            <Text style={styles.gridLabel}>Save</Text>
          </TouchableOpacity>
         
        </View>        */}
       
        {onUnfollow ? (
          <TouchableOpacity style={styles.optionRow} onPress={onUnfollow}>
            {React.createElement(Ionicons, { name: 'person-remove-outline', size: 22, color: '#bea063', style: { marginRight: 12 } })}
            <Text style={styles.optionText}>{aboutStatusText}</Text>
          </TouchableOpacity>
        ) : onFollow ? (
          <TouchableOpacity style={styles.optionRow} onPress={onFollow}>
            {React.createElement(Ionicons, { name: 'person-add-outline', size: 22, color: '#bea063', style: { marginRight: 12 } })}
            <Text style={styles.optionText}>Follow</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.optionRow} onPress={onAbout}>
          {React.createElement(Ionicons, { name: 'person-circle-outline', size: 23, color: '#bea063', style: { marginRight: 12 } })}
          <Text style={styles.optionText}>About this account</Text>
        </TouchableOpacity>
        {/* Report button */}
        {/* <TouchableOpacity style={[styles.optionRow, { marginTop: 8 }]} onPress={onReport}>
          {React.createElement(Ionicons, { name: 'alert-circle-outline', size: 22, color: '#bea063', style: { marginRight: 12 } })}
          <Text style={[styles.optionText, { color: '#ed4956', fontWeight: 'bold', fontSize: 16 }]}>Report</Text>
        </TouchableOpacity> */}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    paddingHorizontal: 0,
    paddingTop: 8,
    minHeight: 200,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#bea063', // Updated color
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  gridItem: {
    alignItems: 'center',
    flex: 1,
  },
  gridLabel: {
    marginTop: 4,
    fontWeight: '600',
    color: '#bea063', // Updated color
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 16,
    color: '#bea063', // Updated color
    fontWeight: '400',
  },
});

export default OptionsBottomSheet;