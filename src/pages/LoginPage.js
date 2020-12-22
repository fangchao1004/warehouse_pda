import React, { useCallback, useContext, useState } from 'react'
import { View, StyleSheet, ToastAndroid, StatusBar, Image } from 'react-native'
import { Button, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AppDataContext } from '../data/AppData';
import Api from '../api/Api';
import { checkPasswordChart } from '../common/Tool';
import logIcon_png from '../assets/lognIcon.png'
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
export default ({ navigation }) => {
    const { appState, appDispatch } = useContext(AppDataContext)
    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)
    const { setItem } = useAsyncStorage('user');///该api支持hook写法，获取本地存储的user值。【但是这样一次只能获取一个key的值。如果要用多个key。分开调用AppStorage.js中的方法】
    const onChangeText1 = useCallback((text) => {
        setUsername(text)
    }, [])
    const onChangeText2 = useCallback((text) => {
        setPassword(text)
    }, [])
    const loginHandler = useCallback(async () => {
        try {
            if (username && password) {
                let is_legal = checkPasswordChart(password)
                if (!is_legal) {
                    ToastAndroid.showWithGravity("非法密码，请重新输入密码", ToastAndroid.SHORT, ToastAndroid.CENTER);
                    return
                }
                let response = await Api.getUserList(username, password);
                if (response.length > 0) {
                    const user = response[0]
                    let role_list = await Api.getUserRole(user.id)
                    let tempObj = {};
                    tempObj['role_id_all'] = role_list.map((item) => item.id).join(',')
                    tempObj['role_name_all'] = role_list.map((item) => item.des).join(',')
                    tempObj['role_value_all'] = role_list.map((item) => item.value).join(',')///用role 替代 permission 
                    tempObj['permission'] = role_list.map((item) => item.value).join(',')
                    const new_user = { ...user, ...tempObj }
                    appDispatch({ type: 'user', data: new_user })
                    setItem(JSON.stringify(new_user))
                    navigation.replace('home');
                    // navigation.navigate('home');
                } else {
                    ToastAndroid.showWithGravity("账号或密码可能错误", ToastAndroid.SHORT, ToastAndroid.CENTER);
                }
            } else {
                ToastAndroid.showWithGravity("请输入账户和密码", ToastAndroid.SHORT, ToastAndroid.CENTER);
            }
        } catch (error) {
            console.log('error:', error)
        }
    }, [username, password])
    return (
        <View style={styles.root}>
            <StatusBar
                animated={true}
                translucent={true}
                hidden={false}
                backgroundColor={'transparent'}
            />
            <Image
                source={logIcon_png}
                style={styles.image}
            />
            <View style={styles.inputBox}>
                <Input
                    placeholder='输入账号'
                    leftIcon={
                        <Icon
                            name='user'
                            size={20}
                            color='#999999'
                        />
                    }
                    value={username}
                    onChangeText={onChangeText1}
                />
                <Input
                    secureTextEntry={true}
                    placeholder='输入密码'
                    leftIcon={
                        <Icon
                            name='lock'
                            size={20}
                            color='#999999'
                        />
                    }
                    value={password}
                    onChangeText={onChangeText2}
                />
            </View>
            <Button
                buttonStyle={{ ...styles.buttonStyle, backgroundColor: appState.themeColor }}
                raised
                iconRight
                icon={{
                    name: "login",
                    size: 20,
                    color: "white"
                }}
                title="登录"
                onPress={loginHandler}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        height: "100%"
    },
    inputBox: {
        width: 256,
    },
    buttonStyle: {
        width: 240,
    },
    image: {
        width: 140, height: 140, marginBottom: 20
    }
})
