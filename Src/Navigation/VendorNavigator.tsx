import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Vendor Screens
import VenderList from '../Screens/Vender/VenderList';
import VendorDetailScreen from '../Screens/Vender/VenderDetail';
import SubCateGoryDisplay from '../Screens/Search/SubCateGoryDisplay';

const VendorStack = createNativeStackNavigator();

const VendorNavigator = () => {
  return (
    <VendorStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="VendorList"
    >
      <VendorStack.Screen name="VendorList" component={VenderList} />
      <VendorStack.Screen name="VenderDetail" component={VendorDetailScreen} />
      <VendorStack.Screen name="VendorSubCategory" component={SubCateGoryDisplay} />
    </VendorStack.Navigator>
  );
};

export default VendorNavigator; 