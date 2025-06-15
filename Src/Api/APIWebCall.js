import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from './Api';
var _ = require('lodash');

const _REQUEST2SERVER_Authorization = async (url, params = null, pass) => {
  const isGet = params == null;
  const token = await AsyncStorage.getItem('user_token');
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  var config;
  if (token != undefined) {
    config = {
      method: isGet === true ? (pass === '0' ? 'post' : 'get') : 'post',
      url: BASE_URL + url,
      headers: {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
      data: params,
    };
  } else {
    config = {
      method: isGet === true ? (pass === '0' ? 'post' : 'get') : 'post',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
      data: params,
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_NEW_time = async (
  url,
  params = null,
  pass,
) => {
  const isGet = params == null;
  const token = await AsyncStorage.getItem('user_token');
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  var config;
  if (token != undefined) {
    config = {
      method: isGet === true ? (pass === '0' ? 'post' : 'get') : 'post',
      url: BASE_URL + url,
      headers: {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
      data: params,
    };
  } else {
    config = {
      method: isGet === true ? (pass === '0' ? 'post' : 'get') : 'post',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
      data: params,
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_new = async (url, params = null, pass) => {
  const token = await AsyncStorage.getItem('user_token');
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  var config;
  if (token != undefined) {
    config = {
      method: 'post',
      url: BASE_URL + url,
      headers: {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
      data: params,
    };
  } else {
    config = {
      method: 'post',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
      data: params,
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_new_Seconds = async (
  url,
  params = null,
  pass,
) => {
  const token = await AsyncStorage.getItem('user_token');
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  var config;
  if (token != undefined) {
    config = {
      method: 'post',
      url: BASE_URL + url,
      headers: {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
      data: params,
    };
  } else {
    config = {
      method: 'post',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
      data: params,
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Get = async (url, params = null) => {
  const token = await AsyncStorage.getItem('user_token');
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  var config;

  if (params === null) {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        // 'Content-Type': 'application/json',
        // visitor: visitor_id,
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url + params,
      headers: {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
const _REQUEST2SERVER_Authorization_Get_Rating = async (url, params = null) => {
  const token = await AsyncStorage.getItem('user_token');
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  var config;

  if (params != null) {
    config = {
      method: 'get',
      url: BASE_URL + url + params,
      headers: {
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url + params,
      headers: {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Get_Category_DAS = async (
  url,
  params = null,
) => {
  const token = await AsyncStorage.getItem('user_token');
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  var config;
  if (token != undefined) {
    if (params === null) {
      config = {
        method: 'get',
        url: BASE_URL + url + '?device_type=Mobile',
        headers: {
          Authorization: 'token ' + token,
          'Content-Type': 'application/json',
          Companyid: company_id,
        },
      };
    } else {
      config = {
        method: 'get',
        url: BASE_URL + url + params + '?device_type=Mobile',
        headers: {
          Authorization: 'token ' + token,
          'Content-Type': 'application/json',
          Companyid: company_id,
        },
      };
    }
  } else {
    if (params === null) {
      config = {
        method: 'get',
        url: BASE_URL + url + '?device_type=Mobile',
        headers: {
          'Content-Type': 'application/json',
          visitor: visitor_id,
          Companyid: company_id,
        },
      };
    } else {
      config = {
        method: 'get',
        url: BASE_URL + url + params + '?device_type=Mobile',
        headers: {
          'Content-Type': 'application/json',
          visitor: visitor_id,
          Companyid: company_id,
        },
      };
    }
  }
  return await new Promise(function (resolve, reject) {
    console.log('config get--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Get_Two = async (
  url,
  params = null,
  secondParms,
) => {
  var config;

  if (params === null) {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url + params + secondParms,
      headers: {
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config get--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Get_Two_New = async (
  url,
  params = null,
) => {
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  const token = await AsyncStorage.getItem('user_token');
  var config;
  if (token != undefined) {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Get_token = async (url, params = null) => {
  const token = await AsyncStorage.getItem('user_token');
  var config;

  config = {
    method: 'get',
    url: BASE_URL + url,
    headers: {
      Authorization: 'token ' + token,
      'Content-Type': 'application/json',
      Companyid: company_id,
    },
  };

  return await new Promise(function (resolve, reject) {
    console.log('config --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Get_token_New = async (
  url,
  params = null,
) => {
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  const token = await AsyncStorage.getItem('user_token');
  var config;
  if (token != undefined) {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'token ' + token,
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config get03------->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Get_token_New_NEW_TIME = async (
  url,
  params = null,
) => {
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  const token = await AsyncStorage.getItem('user_token');
  var config;
  if (token != undefined) {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'token ' + token,
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config get03------->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
const _REQUEST2SERVER_Authorization_DELETE = async (url, params = null) => {
  const token = await AsyncStorage.getItem('user_token');
  var config;

  config = {
    method: 'delete',
    url: BASE_URL + url + params + '/',
    headers: {
      Authorization: 'token ' + token,
      'Content-Type': 'application/json',
      Companyid: company_id,
    },
  };

  return await new Promise(function (resolve, reject) {
    console.log('config DELETE --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_DELETE_New = async (
  url,
  params = null,
  bodyParms,
) => {
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  const user_token = await AsyncStorage.getItem('user_token');
  var config;

  if (user_token != undefined) {
    config = {
      method: 'delete',
      url: BASE_URL + url + params + '/',
      headers: {
        Authorization: 'token ' + user_token,
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
      data: bodyParms,
    };
  } else {
    config = {
      method: 'delete',
      url: BASE_URL + url + params + '/',
      headers: {
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
      data: bodyParms,
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config DELETE NEW--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_PATCH = async (
  url,
  params = null,
  bodyParms,
) => {
  const token = await AsyncStorage.getItem('user_token');
  var config;

  if (bodyParms != null) {
    config = {
      method: 'patch',
      url: BASE_URL + url + params + '/',
      headers: {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
      data: bodyParms,
    };
  } else {
    config = {
      method: 'patch',
      url: BASE_URL + url + params + '/',
      headers: {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config PATCH --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_PATCH_new = async (
  url,
  params = null,
  bodyParms,
) => {
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  const user_token = await AsyncStorage.getItem('user_token');
  var config;

  if (user_token != undefined) {
    if (bodyParms != null) {
      config = {
        method: 'patch',
        url: BASE_URL + url + params + '/',
        headers: {
          Authorization: 'token ' + user_token,
          'Content-Type': 'application/json',
          Companyid: company_id,
        },
        data: bodyParms,
      };
    } else {
      config = {
        method: 'patch',
        url: BASE_URL + url + params + '/',
        headers: {
          'Content-Type': 'application/json',
          visitor: visitor_id,
          Companyid: company_id,
        },
      };
    }
  } else {
    if (bodyParms != null) {
      config = {
        method: 'patch',
        url: BASE_URL + url + params + '/',
        headers: {
          'Content-Type': 'application/json',
          visitor: visitor_id,
          Companyid: company_id,
        },
        data: bodyParms,
      };
    } else {
      config = {
        method: 'patch',
        url: BASE_URL + url + params + '/',
        headers: {
          'Content-Type': 'application/json',
          visitor: visitor_id,
          Companyid: company_id,
        },
      };
    }
  }

  return await new Promise(function (resolve, reject) {
    console.log('config PATCH NEW--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_PATCH_Body = async (url, bodyParms) => {
  const token = await AsyncStorage.getItem('user_token');

  var config = {
    method: 'patch',
    url: BASE_URL + url,
    headers: {
      Authorization: 'token ' + token,
      'Content-Type': 'application/json',
      Companyid: company_id,
    },
    data: bodyParms,
  };

  return await new Promise(function (resolve, reject) {
    console.log('config PATCH BODY --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_SIMPLE_GET_1 = async (
  url,
  params = null,
) => {
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  const token = await AsyncStorage.getItem('user_token');
  var config;
  if (token === null) {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        // 'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        Authorization: 'token ' + token,
        // 'Content-Type': 'application/json',
        Companyid: company_id,
      },
    };
  }
  return await new Promise(function (resolve, reject) {
    console.log('config ---->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_SIMPLE_GET_1_NEW = async (
  url,
  params = null,
) => {
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  const token = await AsyncStorage.getItem('user_token');
  var config;
  if (token === null) {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        // 'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        Authorization: 'token ' + token,
        Companyid: company_id,

        // 'Content-Type': 'application/json',
      },
    };
  }
  return await new Promise(function (resolve, reject) {
    console.log('config ---->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_SIMPLE_GET = async (url, params = null) => {
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  const token = await AsyncStorage.getItem('user_token');
  var config;
  if (token === null) {
    config = {
      method: 'get',
      url: BASE_URL + url + params,
      headers: {
        // 'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url + params,
      headers: {
        Authorization: 'token ' + token,
        // 'Content-Type': 'application/json',
        Companyid: company_id,
      },
    };
  }
  return await new Promise(function (resolve, reject) {
    console.log('config ---->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Get_Three = async (
  url,
  params = null,
  secondParms,
) => {
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  const token = await AsyncStorage.getItem('user_token');
  var config1;
  if (token === null) {
    config1 = {
      method: 'get',
      url: BASE_URL + url + params + secondParms,
      headers: {
        'Content-Type': 'Application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  } else {
    config1 = {
      method: 'get',
      url: BASE_URL + url + params + secondParms,
      headers: {
        'Content-Type': 'Application/json',
        Authorization: 'token ' + token,
        Companyid: company_id,
      },
    };
  }
  console.log('config ---> ', config1);
  return await new Promise(function (resolve, reject) {
    axios(config1)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        console.log('config ERROR--->', error.toString());
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Get_Four = async (url, params = null) => {
  const token = await AsyncStorage.getItem('user_token');
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  var config;

  if (token != undefined) {
    config = {
      method: 'get',
      url: BASE_URL + url + params,
      headers: {
        Authorization: 'token ' + token,
        // 'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url + params,
      headers: {
        // 'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Get_Four_NEW = async (
  url,
  params = null,
) => {
  const token = await AsyncStorage.getItem('user_token');
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  var config;

  if (token != undefined) {
    config = {
      method: 'get',
      url: BASE_URL + url + params,
      headers: {
        Authorization: 'token ' + token,
        // 'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url + params,
      headers: {
        // 'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Cart Method common
const _REQUEST2SERVER_Authorization_Get_visitor_id = async (
  url,
  params = null,
) => {
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  const token = await AsyncStorage.getItem('user_token');
  var config;

  if (token != undefined) {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Employee_POST = async (
  url,
  params = null,
) => {
  const token = await AsyncStorage.getItem('emp_token');
  var config;

  if (token != undefined) {
    config = {
      method: 'post',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'token ' + token,
        Companyid: company_id,
      },
      data: params,
    };
  } else {
    config = {
      method: 'post',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'multipart/form-data',
        Companyid: company_id,
      },
      data: params,
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Employee_POST_NEW = async (
  url,
  params = null,
) => {
  const token = await AsyncStorage.getItem('emp_token');
  var config;

  if (token != undefined) {
    config = {
      method: 'post',
      url: BASE_URL + url,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'token ' + token,
        Companyid: company_id,
      },
      data: params,
    };
  } else {
    config = {
      method: 'post',
      url: BASE_URL + url,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
      data: params,
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Employee_GET = async (
  url,
  params = null,
) => {
  const token = await AsyncStorage.getItem('emp_token');
  var config = {
    method: 'get',
    url: BASE_URL + url,
    headers: {
      Accept: 'application/json',
      Authorization: 'token ' + token,
      Companyid: company_id,
    },
  };
  return await new Promise(function (resolve, reject) {
    console.log('config--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_POST_FCM = async (url, params = null) => {
  const token = await AsyncStorage.getItem('emp_token');
  var config = {
    method: 'post',
    url: BASE_URL + url,
    headers: {
      Accept: 'application/json',
      Authorization: 'token ' + token,
      Companyid: company_id,
    },
    data: params,
  };
  return await new Promise(function (resolve, reject) {
    console.log('config--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Post_FCM = async (url, params = null) => {
  const token = await AsyncStorage.getItem('emp_token');
  var config = {
    method: 'post',
    url: BASE_URL + url,
    headers: {
      Accept: 'application/json',
      Authorization: 'token ' + token,
      Companyid: company_id,
    },
    data: params,
  };
  return await new Promise(function (resolve, reject) {
    console.log('config--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Employee_Delete = async (
  url,
  params = null,
) => {
  const token = await AsyncStorage.getItem('emp_token');
  var config = {
    method: 'delete',
    url: BASE_URL + url,
    headers: {
      Accept: 'application/json',
      Authorization: 'token ' + token,
      Companyid: company_id,
    },
  };
  return await new Promise(function (resolve, reject) {
    console.log('config--->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _REQUEST2SERVER_Authorization_Get_visitor_id_New_time = async (
  url,
  params = null,
) => {
  const visitor_id = await AsyncStorage.getItem('visitor_id');
  const token = await AsyncStorage.getItem('user_token');
  var config;

  if (token != undefined) {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json',
        Companyid: company_id,
      },
    };
  } else {
    config = {
      method: 'get',
      url: BASE_URL + url,
      headers: {
        'Content-Type': 'application/json',
        visitor: visitor_id,
        Companyid: company_id,
      },
    };
  }

  return await new Promise(function (resolve, reject) {
    console.log('config --->', config);
    axios(config)
      .then((data) => {
        if (data.data.status) resolve(data.data);
        else reject(data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// ------------------- auth api call------------------------
export const onLoginAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_new(`user/signin/`, params, '0');
};

export const onSignUPAPICall = (params) => {
  return _REQUEST2SERVER_Authorization(`user/signup/`, params, '0');
};
export const onChange_Password_PICall = (params) => {
  return _REQUEST2SERVER_Authorization(`user/change-password/`, params, '0');
};
export const onForgot_Password_APICall = (params) => {
  return _REQUEST2SERVER_Authorization(`user/reset-password/`, params, '0');
};

// export const onSlider_APICall = (params) => {
//   return _REQUEST2SERVER_Authorization_Get(`homePageImages/`, params);
// };

export const onCategory_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get_Category_DAS(`categories/`, params);
};

export const onSubCategory_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get_Category_DAS(`categories/`, params);
};

export const onProductList_APICall = (
  params,
  secondParms,
  min_price,
  max_price,
  page,
) => {
  return _REQUEST2SERVER_Authorization_Get_Two_New(
    `web/products/list/?category_id=${params}&ordering=${
      secondParms != null ? secondParms : ''
    }&min_price=${min_price != null ? min_price : ''}&max_price=${
      max_price != null ? max_price : ''
    }&page=${page}&row_per_page=10`,
  );
};

// //Country List
// export const onGetCountryPICall = (params) => {
//   return _REQUEST2SERVER_Authorization_Get_token(`countries/`, params);
// };

// export const onProductDetails_APICall = (params, secondParms) => {
//   return _REQUEST2SERVER_Authorization_Get_Two(
//     `products/`,
//     params,
//     `?filter_by=${secondParms}`,
//   );
// };
export const onProductDetails_APICall = (params, secondParms) => {
  return _REQUEST2SERVER_Authorization_Get_Two(
    `products/`,
    params,
    `?filter_by=${secondParms}`,
  );
};

// Add wishlist
export const onAdd_wishList_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_NEW_time(`wishlist/`, params, '0');
};

//  wishlist
export const onGet_wishList_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get_token_New_NEW_TIME(
    `wishlist/`,
    params,
  );
};

//  Add cart
export const onADD_TO_CART_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_NEW_time(`cart/`, params);
};

//  delete cart
export const onDelete_Cart_APICall = (params, bodyParms) => {
  return _REQUEST2SERVER_Authorization_DELETE_New(`cart/`, params, bodyParms);
};

// cart List
export const onCart_List_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get_visitor_id_New_time(`cart/`, params);
};

// export const onCart_List_APICall = (params) => {
//   return _REQUEST2SERVER_Authorization_Get_token(`cart/`, params);
// };

// update cart quantity
export const onCart_update_quantity_APICall = (params, bodyParms) => {
  return _REQUEST2SERVER_Authorization_PATCH_new(`cart/`, params, bodyParms);
};

// get profile
export const onGetProfile_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get_token(`user/profile/`, params);
};

// update profile api
export const onUpdateProfile_APICall = (bodyParms) => {
  return _REQUEST2SERVER_Authorization_PATCH_Body(`user/profile/`, bodyParms);
};

// get address
export const onGetAddress_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get_token(`user/address/`, params);
};

// add address
export const onAdd_Address_APICall = (params) => {
  return _REQUEST2SERVER_Authorization(`user/address/`, params, '0');
};
// delete address
export const onDeleteAddress_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_DELETE(`user/address/`, params);
};

// update address
export const onUpdate_Address_APICall = (params, bodyParms) => {
  return _REQUEST2SERVER_Authorization_PATCH(
    `user/address/`,
    params,
    bodyParms,
  );
};

// My Order details Api
export const onMyOrder_APICall = (params) => {
  // return _REQUEST2SERVER_Authorization_Get_token(`orders/`, params);
  return _REQUEST2SERVER_Authorization_Get_token(`web/orders/list/`, params);
};

// My Order details Api
export const onMyOrder_Details_APICall = (params) => {
  // return _REQUEST2SERVER_Authorization_Get_token(`orders/`, params);
  return _REQUEST2SERVER_Authorization_Get_token(`orders/${params}/`);
};

// checkout Api
export const onCheckOutAPICall = (params) => {
  return _REQUEST2SERVER_Authorization(`checkout/`, params, '0');
};

//Place order API call
export const onPlaceOrderAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_NEW_time(`orders/`, params, '0');
};

//state List
export const onGetStatePICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get(`states/`, params);
};

//city List
export const onGetCityPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get(`cities/`, params);
};

//Default address set
export const onDefaultAddressAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_PATCH(
    `user/defaultaddress/`,
    params,
    null,
  );
};

//products Search ------------------------------------------------------------------------------
export const onProductSearchAPICall = (
  params, //search
  secondsParms, // filter_by
  min_price,
  max_price,
  page,
) => {
  // return _REQUEST2SERVER_Authorization_SIMPLE_GET_1(`productsSearch/?prod_search=${params != null ? params : ''
  //   }&filter_by=${secondsParms != null ? secondsParms : ''}&min_price=${min_price != null ? min_price : ''
  //   }&max_price=${max_price != null ? max_price : ''}&page=${page != null ? page : '1'
  //   }&row_per_page=20`);
  // return _REQUEST2SERVER_Authorization_SIMPLE_GET_1_NEW(
  //   `productsSearch/?prod_search=${params != null ? params : ''}&filter_by=${
  //     secondsParms != null ? secondsParms : ''
  //   }&min_price=${min_price != null ? min_price : ''}&max_price=${
  //     max_price != null ? max_price : ''
  //   }`,
  // );

  return _REQUEST2SERVER_Authorization_SIMPLE_GET_1_NEW(
    `web/products/list/?ordering=${
      secondsParms != null ? secondsParms : ''
    }&base_price_from=${min_price != null ? min_price : ''}&base_price_to=${
      max_price != null ? max_price : ''
    }&page=${page}&row_per_page=35&prod_search=${params != null ? params : ''}`,
  );
};

//Country List
export const onGetCountryPICall = (params, secondsParms) => {
  return _REQUEST2SERVER_Authorization_SIMPLE_GET_1(
    `countries/`,
    params,
    `?filter_search=${secondsParms}`,
  );
};
// country filter
export const onGetCountryPICall1 = (secondsParms) => {
  return _REQUEST2SERVER_Authorization_SIMPLE_GET_1(
    `countries/?filter_search=${secondsParms}`,
  );
};

//delete Account
export const onDeleteAccountAPICall = (params) => {
  return _REQUEST2SERVER_Authorization(`user/deactivate/`, params, '0');
};

// new product details
export const onProductDetails_with_related_products_APICall = (params) => {
  //return _REQUEST2SERVER_Authorization_Get_Four_NEW(`products/`, params);
  return _REQUEST2SERVER_Authorization_Get_Four_NEW(`web/products/`, params);
};

// Home api
export const onHome_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get_Two_New(`home/`, params);
};

// CMS Api
export const onCMS_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get(`cms/`, params);
};

// UDID Get
export const onUDID_GET_APICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get(`user/visitor/`, params);
};

//city List
export const onSubmitRatingAPICall = (params, urlParams) => {
  return _REQUEST2SERVER_Authorization_new_Seconds(
    `rating_review/${urlParams}/`,
    params,
    '0',
  );
};

// All Review Rating List
export const onGetProductReviewAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get_Rating(`rating_review/`, params);
};
// Product list api call
export const onGetProductListAPICall = (page) => {
  return _REQUEST2SERVER_Authorization_SIMPLE_GET(
    `products/`,
    `?page=${page != null ? page : ''}&shop_products=''`,
  );
};

// version update
export const onVersionCheckAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Get(`app-version/`, params);
};

// Employee Login
export const onEmployeeLoginAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Employee_POST(
    `user/erp/signin/`,
    params,
  );
};

// Employee chat List
export const onEmployeeChatListAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Employee_GET(`chats/`);
};

// Employee search_chat filter
export const onFilterChatListAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Employee_GET(
    `chats/?search_chat=${params}`,
  );
};

// chat delete API
export const onChatListDeleteAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Employee_Delete(`chats/${params}/`);
};

// send message
export const onSendMessageAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Employee_POST(`message/`, params);
};
//All Employee List API Call
export const onAllEmployeeListAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Employee_GET(
    `user/employee/?responsible=${params}`,
  );
};

//Create Chat group API Call
export const onSingleChatCreateAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Employee_POST_NEW(`chats/`, params);
};

// Employee chat message list
export const onEmployeeMesListAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Employee_GET(`chats/${params}/`);
};

// chat message read
export const onChatMsgReadAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Employee_GET(`read_msg/${params}/`);
};

// message delete
export const onDeleteMsgAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Employee_Delete(`message/${params}/`);
};

// FCM token Pass Api
export const onAddDevicesAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_Post_FCM(`fcmtoken/`, params);
};

// blog list API
export const onBlogAPICall = () => {
  return _REQUEST2SERVER_Authorization_SIMPLE_GET_1_NEW(`home/blogs/`);
};

// blog details API
export const onBlogDetailsAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_SIMPLE_GET_1_NEW(`blogs/${params}`);
};

//Add Elite Subscrption
export const onEliteSubscriptionAddAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_NEW_time(
    `user/subscriptions_mobile/`,
    params,
    '0',
  );
};
// Subscription API
export const onSubscriptionAPICall = () => {
  return _REQUEST2SERVER_Authorization_SIMPLE_GET_1_NEW(
    `user/profile_elite_users/`,
  );
};

// Lower Section
export const onLowerSectionAPICall = (params) => {
  return _REQUEST2SERVER_Authorization_SIMPLE_GET_1_NEW(`lower-section`);
};

// banner Section
export const getBannerSectionAPI = (params) => {
  return _REQUEST2SERVER_Authorization_SIMPLE_GET_1_NEW(
    `ecommerce/banners/?sequence=${params}`,
  );
};
// sent OTP
export const getSendOTPAPI = (params) => {
  return _REQUEST2SERVER_Authorization_new(`user/send-otp/`, params);
};

// verify OTP
export const getVerifyOTPAPI = (params) => {
  return _REQUEST2SERVER_Authorization_new(`user/verify-otp/`, params);
};

// upper-section
export const getUpperSectionAPI = (params) => {
  return _REQUEST2SERVER_Authorization_SIMPLE_GET_1_NEW(`upper-section/`);
};

// product-section/
export const getProductSectionAPI = (params) => {
  return _REQUEST2SERVER_Authorization_SIMPLE_GET_1_NEW(`product-section/`);
};

// product details
export const onProduct_Details_APICall = (params) => {
  //return _REQUEST2SERVER_Authorization_Get_Four_NEW(`products/`, params);
  return _REQUEST2SERVER_Authorization_Get_Four_NEW(
    `web/single/product/`,
    params,
  );
};

// related product details
export const onRelated_Product_Details_APICall = (params) => {
  //return _REQUEST2SERVER_Authorization_Get_Four_NEW(`products/`, params);
  return _REQUEST2SERVER_Authorization_Get_Four_NEW(
    `web/single/product/related/`,
    params,
  );
};

// recently product
export const onRecently_Product_Details_APICall = (params) => {
  //return _REQUEST2SERVER_Authorization_Get_Four_NEW(`products/`, params);
  return _REQUEST2SERVER_Authorization_Get_Four_NEW(
    `web/single/product/recently-viewed/`,
    params,
  );
};

// product other
export const onProduct_Other_Details_APICall = (params) => {
  //return _REQUEST2SERVER_Authorization_Get_Four_NEW(`products/`, params);
  return _REQUEST2SERVER_Authorization_Get_Four_NEW(
    `web/single/product/other/`,
    params,
  );
};

const APIWebCall = {
  onLoginAPICall,
  onSignUPAPICall,
  onChange_Password_PICall,
  onForgot_Password_APICall,
  // onSlider_APICall,
  onCategory_APICall,
  onSubCategory_APICall,
  onProductList_APICall,
  onProductDetails_APICall,
  onAdd_wishList_APICall,
  onGet_wishList_APICall,
  onADD_TO_CART_APICall,
  onDelete_Cart_APICall,
  onCart_List_APICall,
  onCart_update_quantity_APICall,
  onGetProfile_APICall,
  onGetAddress_APICall,
  onAdd_Address_APICall,
  onDeleteAddress_APICall,
  onUpdate_Address_APICall,
  onMyOrder_APICall,
  onCheckOutAPICall,
  onPlaceOrderAPICall,
  onGetCountryPICall,
  onGetStatePICall,
  onGetCityPICall,
  onDefaultAddressAPICall,
  onUpdateProfile_APICall,
  onProductSearchAPICall,
  onDeleteAccountAPICall,
  onProductDetails_with_related_products_APICall,
  onHome_APICall,
  onCMS_APICall,
  onUDID_GET_APICall,
  onSubmitRatingAPICall,
  onGetProductReviewAPICall,
  onGetProductListAPICall,
  onGetCountryPICall1,
  onVersionCheckAPICall,
  onEmployeeLoginAPICall,
  onEmployeeChatListAPICall,
  onFilterChatListAPICall,
  onChatListDeleteAPICall,
  onSendMessageAPICall,
  onAllEmployeeListAPICall,
  onSingleChatCreateAPICall,
  onEmployeeMesListAPICall,
  onChatMsgReadAPICall,
  onDeleteMsgAPICall,
  onAddDevicesAPICall,
  onMyOrder_Details_APICall,
  onBlogAPICall,
  onBlogDetailsAPICall,
  onEliteSubscriptionAddAPICall,
  onSubscriptionAPICall,
  onLowerSectionAPICall,
  getBannerSectionAPI,
  getSendOTPAPI,
  getVerifyOTPAPI,
  getUpperSectionAPI,
  getProductSectionAPI,
  onProduct_Details_APICall,
  onRelated_Product_Details_APICall,
  onRecently_Product_Details_APICall,
  onProduct_Other_Details_APICall,
};

export default APIWebCall;
