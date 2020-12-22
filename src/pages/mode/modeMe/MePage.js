import React, { useContext } from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native'
import { Button, Card } from 'react-native-elements';
import CommonBar from '../../../common/CommonBar'
import { AppDataContext } from '../../../data/AppData';
const { height, width } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';

export default function MePage({ navigation }) {
    const { appState } = useContext(AppDataContext)
    const { removeItem } = useAsyncStorage('user');///该api支持hook写法，获取本地存储的user值。【但是这样一次只能获取一个key的值。如果要用多个key。分开调用AppStorage.js中的方法】
    return (
        <View>
            <CommonBar title='个人中心' navigation_params={navigation} />
            <ScrollView style={styles.scrollview}>
                <View style={styles.containview}>
                    <Card containerStyle={styles.cardstyle}>
                        <Card.Title>账户信息</Card.Title>
                        <Card.Divider />
                        {appState.user ?
                            <View>
                                <View style={styles.itemview}>
                                    <Text>账户</Text>
                                    <Text>{appState.user.username}</Text>
                                </View>
                                <View style={styles.itemview}>
                                    <Text>名称</Text>
                                    <Text>{appState.user.name}</Text>
                                </View>
                            </View>
                            : null}
                        <View style={styles.itemview}>
                            <Text>版本</Text>
                            <Text>{appState.version}</Text>
                        </View>
                        <Button
                            containerStyle={styles.buttonStyle}
                            buttonStyle={{ backgroundColor: appState.themeColor }}
                            raised
                            iconRight
                            icon={
                                <Icon
                                    style={{ marginLeft: 10 }}
                                    name="sign-out"
                                    size={20}
                                    color="white"
                                />
                            }
                            title="退出登录"
                            onPress={() => {
                                Alert.alert(
                                    "确定退出登录吗？",
                                    null,
                                    [
                                        { text: "取消" },
                                        {
                                            text: "确定", onPress: async () => {
                                                navigation.replace('login');
                                                removeItem();
                                            }
                                        }
                                    ]
                                );
                            }}
                        />
                    </Card>
                </View>
            </ScrollView>
        </View >
    )
}
const styles = StyleSheet.create({
    scrollview: {
        height: height - 120,
    },
    containview: {
        justifyContent: 'center',
        alignItems: 'center',
        width: width
    },
    cardstyle: {
        width: width - 20
    },
    itemview: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    buttonStyle: {
        marginTop: 10,
    },
})