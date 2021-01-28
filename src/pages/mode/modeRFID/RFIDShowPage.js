import React, { useCallback, useContext, useEffect, useState } from 'react';
import UhfExample from '../../../bridge/UhfExample'
import { DeviceEventEmitter, FlatList, StyleSheet, Text, View, Dimensions, BackHandler, Platform, ToastAndroid, Image } from 'react-native';
import CommonBar from '../../../common/CommonBar';
import Api from '../../../api/Api';
import { Button, Card } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import tag_png from '../../../assets/tag.png'
import { AppDataContext } from '../../../data/AppData';

const { height } = Dimensions.get('window');
var test_list = [{ name: '1测试', id: "123", count: "99" }, { name: '2测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }
    , { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }
    , { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }
    , { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }
    , { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '测试', id: "123", count: "99" }, { name: '9测试', id: "123", count: "99" }]
var uhf_Subscription;
var tempObj = {};
var tempList = [];
var rfidList = [];
var isLoop_var = false;
export default ({ navigation, route }) => {
    const { appState } = useContext(AppDataContext)
    const [isLoop, setIsLoop] = useState(false)
    const [uhfList, setUhfList] = useState('[]')
    const getRfidListFromDB = useCallback(async () => {
        rfidList = await Api.getRfidList()
    }, [])
    const init = useCallback(() => {
        console.log('init:')
        tempObj = {};
        tempList = [];
        uhf_Subscription = DeviceEventEmitter.addListener('uhf_data', e => {//for Android
            doUhfDataHandler(e.data)
        });
        getRfidListFromDB();
    }, [getRfidListFromDB])
    const doUhfDataHandler = useCallback((uhf_id) => {
        let tempRfidObj = { code: uhf_id };
        rfidList.forEach((rfidItem) => {
            if (tempRfidObj['code'] === rfidItem['rfid_code']) {
                tempRfidObj['name'] = rfidItem['name']
                tempRfidObj['store_id'] = rfidItem['store_id']
                tempRfidObj['store_name'] = rfidItem['store_name']
            }
        })
        // console.log('tempRfidObj:', tempRfidObj)
        let is_exist = false;
        tempList.forEach((item) => {
            if (item['code'] === tempRfidObj['code']) {
                is_exist = true;
                item.count += 1;
            }
        })
        if (!is_exist) {
            tempList.push({ key: (tempList.length).toString(), code: tempRfidObj['code'], name: tempRfidObj['name'], store_id: tempRfidObj['store_id'], store_name: tempRfidObj['store_name'], count: 1 })
        }
        // console.log('tempList:', tempList)
        setUhfList(JSON.stringify(tempList))
    }, [])
    const onBackHandler = useCallback(() => {
        // console.log('ng:', route)
        ///isLoop_var 这里用state中的isLoop无法获取最新的状态。只能用全局变量isLoop_var来代替
        if (isLoop_var) { ToastAndroid.showWithGravity("请先停止扫描，再操作", ToastAndroid.SHORT, ToastAndroid.CENTER); return true }
    }, [uhfList])
    useEffect(() => {
        init();
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', onBackHandler);
        }
        return () => {
            if (Platform.OS === 'android') {
                BackHandler.removeEventListener('hardwareBackPress', onBackHandler);
            }
            if (uhf_Subscription) { DeviceEventEmitter.removeSubscription(uhf_Subscription) }
            if (isLoop_var) { ///如果遇到强制销毁该页面时，要关闭扫描
                UhfExample.startInventory((v) => {
                    isLoop_var = v
                });
            }
        }
    }, [])
    return <View style={styles.root}>
        <CommonBar title='物品盘存' navigation_params={navigation} hasBack hasMenu menuIcon={<Icon name='trash-o' color='#FFFFFF' size={20} />} menuCallback={() => {
            tempObj = {};
            tempList = [];
            setUhfList('[]')
        }}
            backCallback={() => {
                if (isLoop) {
                    ToastAndroid.showWithGravity("请先停止扫描，再操作", ToastAndroid.SHORT, ToastAndroid.CENTER);
                } else if (!isLoop && JSON.parse(uhfList).length > 0) {
                    ToastAndroid.showWithGravity("请删除扫描数据，再操作", ToastAndroid.SHORT, ToastAndroid.CENTER);
                } else {
                    navigation.goBack()
                }
            }}
        />
        <View style={styles.flatListview}>
            {JSON.parse(uhfList).length === 0 ? null :
                <View style={styles.headerview}>
                    <Text>标签信息</Text>
                    <Text>扫描次数</Text>
                </View>
            }
            <FlatList
                ListEmptyComponent={() => {
                    return <Card>
                        <Card.Title>请先扫描RFID标签</Card.Title>
                        <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
                            <Image
                                style={styles.image}
                                resizeMode="cover"
                                source={tag_png}
                            />
                        </View>
                    </Card>
                }}
                data={JSON.parse(uhfList)}
                // data={test_list.map((item, index) => { item.key = index + ''; return item })}
                renderItem={({ item }) => {
                    return <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, padding: 10, backgroundColor: 'white' }}>
                        <View>
                            <Text>标签码：{item.code}</Text>
                            <Text>标签名：{item.name || '-'}</Text>
                            <Text>物品名：{item.store_name || '-'}</Text>
                        </View>
                        <View>
                            <Text>{item.count}</Text>
                        </View>
                    </View>
                }}
            />
        </View>
        <View style={styles.btnview}>
            <Button buttonStyle={styles.button} type="outline" title="物品统计" onPress={() => {
                if (isLoop) {
                    ToastAndroid.showWithGravity("请先停止扫描，再操作", ToastAndroid.SHORT, ToastAndroid.CENTER);
                } else {
                    if (JSON.parse(uhfList).length === 0) { ToastAndroid.showWithGravity("请先扫描获取标签信息后，再操作", ToastAndroid.SHORT, ToastAndroid.CENTER); return }
                    navigation.navigate('rfidstatistics', { rfid_list: JSON.parse(uhfList) })
                }
            }} />
            <Button buttonStyle={{ ...styles.button, backgroundColor: !isLoop ? "#1890ff" : "tomato" }} title={!isLoop ? "开始扫描" : "停止扫描"} color={!isLoop ? "#1890ff" : "tomato"} onPress={() => {
                if (!appState.support_rfid) { ToastAndroid.showWithGravity("rfid扫描功能已经屏蔽；请使用特定设备结合相应应用使用该功能", ToastAndroid.LONG, ToastAndroid.CENTER); return }
                UhfExample.startInventory((v) => {
                    setIsLoop(v)
                    isLoop_var = v
                });
            }} />
        </View>
    </View>
}
const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    flatListview: {
        height: height - 64 - 80 - 30,
    },
    headerview: {
        width: '100%',
        height: 40,
        display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    btnview: {
        height: 120,
        backgroundColor: 'white',
        paddingTop: 10,
    },
    button: {
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10
    },
})