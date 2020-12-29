/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import AppData from './src/data/AppData'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './src/pages/LoginPage';
import HomePage from './src/pages/HomePage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NFCAddPage from './src/pages/mode/modeNFCAdd/NFCAddPage';
import NFCShowPage from './src/pages/mode/modeNFCShow/NFCShowPage';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import RFIDShowPage from './src/pages/mode/modeRFID/RFIDShowPage';
import RFIDStatisticsPage from './src/pages/mode/modeRFID/RFIDStatisticsPage';
import RFIDRegisterPage from './src/pages/mode/modeRFID/register/RFIDRegisterPage';
import RFIDBindPage from './src/pages/mode/modeRFID/bind/RFIDBindPage'
import RFIDUploadRecordPage from './src/pages/mode/modeRFID/uploadrecord/RFIDUploadRecordPage';
import StoreChangePage from './src/pages/mode/modeNFCShow/change/StoreChangePage';
//------------------------------------------------------------------------------------------------------------
// 全局状态管理
//------------------------------------------------------------------------------------------------------------
const appState = {}
function appReducer(state, action) { }
export const AppContext = React.createContext(null)
//------------------------------
//路由栈
//------------------------------
const Stack = createStackNavigator();
const orginStackNavigatorConfig = {
    mode: 'card',
    headerMode: 'none'
}
var lastBackPressed;
export default () => {
    const reducer = useReducer(appReducer, appState)
    const { getItem } = useAsyncStorage('user');///该api支持hook写法，获取本地存储的user值。【但是这样一次只能获取一个key的值。如果要用多个key。分开调用AppStorage.js中的方法】
    const [StackNavigatorConfig, setStackNavigatorConfig] = useState({
        initialRouteName: 'login',
        ...orginStackNavigatorConfig
    })
    const init = useCallback(async () => {
        let user = await getItem(); ///如果缓存中有用户数据，将homepage设置为起始页，省去登录步骤。【用户退出登录后，清除缓存user。再次打开app则会显示loginpage】
        if (user) {
            setStackNavigatorConfig({
                initialRouteName: 'home',
                ...orginStackNavigatorConfig
            })
        }
    }, [])
    const onBackHandler = useCallback(() => {
        if (lastBackPressed && lastBackPressed + 2000 >= Date.now()) {
            //最近2秒内按过back键，可以退出应用。
            BackHandler.exitApp()
            return false;
        }
        lastBackPressed = Date.now();
        ToastAndroid.showWithGravity("再按一次退出应用", ToastAndroid.SHORT, ToastAndroid.CENTER);
        return true;//默认行为
    }, [])
    useEffect(() => {
        init();
    }, [init])
    useEffect(() => {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', onBackHandler);
        }
        return () => {
            if (Platform.OS === 'android') {
                BackHandler.removeEventListener('hardwareBackPress', onBackHandler);
            }
        }
    }, [])
    return (
        <AppData>
            <AppContext.Provider value={reducer}>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <Stack.Navigator {...StackNavigatorConfig}>
                            <Stack.Screen name='login' component={LoginPage} />
                            <Stack.Screen name='home' component={HomePage} />
                            <Stack.Screen name='nfcadd' component={NFCAddPage} />
                            <Stack.Screen name='nfcshow' component={NFCShowPage} />
                            <Stack.Screen name='rfidshow' component={RFIDShowPage} />
                            <Stack.Screen name='rfidstatistics' component={RFIDStatisticsPage} />
                            <Stack.Screen name='rfidregister' component={RFIDRegisterPage} />
                            <Stack.Screen name='rfidbind' component={RFIDBindPage} />
                            <Stack.Screen name='rfiduploadrecord' component={RFIDUploadRecordPage} />
                            <Stack.Screen name='storechangepage' component={StoreChangePage} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </SafeAreaProvider>
            </AppContext.Provider>
        </AppData>
    );
};