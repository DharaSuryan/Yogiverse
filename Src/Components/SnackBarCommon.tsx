import React, {Component} from 'react';
import Snackbar from 'react-native-snackbar';


function SnackBarCommon({text, isSuccess}) {
  return setTimeout(() => {
    Snackbar.show({
      text: text,
      duration: Snackbar.LENGTH_LONG,
      backgroundColor: isSuccess ? '#15933B' : '#D8151D',
    });
  }, 150);
}

export default SnackBarCommon;
