import React, { useCallback, useContext, useEffect } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainPage from './mode/modeMain/MainPage';
// import SettingPage from './mode/modeSetting/SettingPage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AppDataContext } from '../data/AppData';
import MePage from './mode/modeMe/MePage';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';

const TabNavigatorConfigs = {
    backBehavior: 'none', // 按 back 键是否跳转到第一个Tab(首页)， none 为不跳转
}
const Tab = createBottomTabNavigator();
export default () => {
    const { appState, appDispatch } = useContext(AppDataContext)
    const { getItem } = useAsyncStorage('user');///该api支持hook写法，获取本地存储的user值。【但是这样一次只能获取一个key的值。如果要用多个key。分开调用AppStorage.js中的方法】
    const init = useCallback(async () => {
        let res = await getItem();
        if (res) appDispatch({ type: 'user', data: JSON.parse(res) })
    }, [])
    useEffect(() => {
        init();
    }, [init])
    return (
        <Tab.Navigator
            {...TabNavigatorConfigs}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'home') {
                        iconName = 'home';
                    } else if (route.name === 'setting') {
                        iconName = 'sliders';
                    } else if (route.name === 'me') {
                        iconName = 'user';
                    }
                    return <Icon
                        name={iconName}
                        size={size}
                        color={color}
                    />;
                },
            })}
            tabBarOptions={{
                activeTintColor: appState.themeColor,
                inactiveTintColor: 'gray',
            }}>
            <Tab.Screen name="home" options={{ title: '操作' }} component={MainPage} />
            <Tab.Screen name="me" options={{ title: '我的' }} component={MePage} />
            {/* <Tab.Screen name="setting" options={{ title: '设置' }} component={SettingPage} /> */}
        </Tab.Navigator>
    )
}