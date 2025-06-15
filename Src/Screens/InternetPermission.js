import NetInfo from '@react-native-community/netinfo';
import SnackBarCommon from './../Components/SnackBarCommon';
import { API_INTERNET_CONNECTION_CAPTION_EN } from '../Api/Api';

export async function checkInternetPermissions() {
  const isInternetGranted = await NetInfo.fetch().then((state) => {
    return state.isConnected;
  });
  if (isInternetGranted === true) {
    return isInternetGranted;
  } else {
    SnackBarCommon({ text: API_INTERNET_CONNECTION_CAPTION_EN });
  }
}
export default { checkInternetPermissions };
