import React, { useEffect, useState, useContext, useCallback } from 'react'
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Modal, ToastAndroid, KeyboardAvoidingView } from 'react-native'
import CommonBar from '../../../../common/CommonBar'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button, Input } from 'react-native-elements';
import Api from '../../../../api/Api';
import { AppDataContext } from '../../../../data/AppData';
import moment from 'moment'
import { filterCellAttribute } from '../../../../common/Tool';
const FORMAT = 'YYYY-MM-DD HH:mm:ss'
const { height, width } = Dimensions.get('window');
var origin_storelist = [];
export default function StoreChangePage({ navigation, route }) {
    const { appState } = useContext(AppDataContext)
    const [storelist, setStorelist] = useState([])
    const [selectStore, setSelectStore] = useState({})
    const [selectStoreValue, setSelectStoreValue] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [shelfInfo, setShelfInfo] = useState({})
    const [remark, setRemark] = useState('')
    const uploadHandler = useCallback(async () => {
        // console.log('原始表单数据:', origin_storelist)
        // console.log('表单数据:', storelist)
        let act_change_list = [];///实际变动过的物品记录
        let act_change_list_origin = [];///对应变动过的物品原始记录
        origin_storelist.forEach((originItem) => {
            storelist.forEach((item) => {
                if (originItem['id'] === item['id'] && originItem['count'] !== item['count']) {
                    act_change_list.push(item)
                    act_change_list_origin.push(originItem)
                }
            })
        })
        // console.log('变动过的物品;对应的原始数据:', act_change_list_origin)
        // console.log('变动过的物品;变动后的数据:', act_change_list)
        if (act_change_list.length === 0) { ToastAndroid.showWithGravity("数据没有发生修改", ToastAndroid.SHORT, ToastAndroid.CENTER); return }
        if (remark.length === 0) { ToastAndroid.showWithGravity("变动说明不可为空", ToastAndroid.SHORT, ToastAndroid.CENTER); return }
        setIsLoading(true)
        let data = {};
        data['change_content'] = JSON.stringify(filterCellAttribute(act_change_list, ['name', 'id', 'count']))///只保留部分属性
        data['origin_content'] = JSON.stringify(filterCellAttribute(act_change_list_origin, ['name', 'id', 'count']))///只保留部分属性
        data['user_id'] = appState.user.id
        data['user_name'] = appState.user.name
        data['time'] = moment().format(FORMAT)
        data['shelf_id'] = shelfInfo['id']
        data['shelf_name'] = shelfInfo['name']
        data['remark'] = remark
        let insert_res = await Api.insertStoreChangeRecords(data)
        if (insert_res) {
            ///修改数据库中物品的count
            for (let index = 0; index < act_change_list.length; index++) {
                const element = act_change_list[index];
                let res = await Api.updateStoreCount({ count: element['count'], store_id: element['id'] })
                if (!res) { ToastAndroid.showWithGravity("修改失败", ToastAndroid.SHORT, ToastAndroid.CENTER); }
            }
            ToastAndroid.showWithGravity("修改成功", ToastAndroid.SHORT, ToastAndroid.CENTER);
            // navigation.popToTop() ///不再返回首页
            if (route.params?.clearSelectNfcInfo) {
                route.params.clearSelectNfcInfo()///清除前一个页面中显示的货架信息
                navigation.pop(1)
            }
        } else {
            ToastAndroid.showWithGravity("修改失败", ToastAndroid.SHORT, ToastAndroid.CENTER);
        }
        setRemark('')
        setIsLoading(false)
    }, [storelist, shelfInfo, remark])
    useEffect(() => {
        if (route.params?.storelist) {
            let storelist_temp = route.params.storelist
            let add_key_list = storelist_temp.map((item, index) => { item['key'] = index.toString(); return item })
            origin_storelist = JSON.parse(JSON.stringify(add_key_list));///复制保存一份原始数据
            let after_filter_list = add_key_list.filter((item) => item['has_rfid'] !== 1)///过滤掉可能包含的标签物品;只保留普通物品用于直接修改数量
            setStorelist(after_filter_list)
        }
        if (route.params?.nfcInfo) {
            let nfcInfo = route.params.nfcInfo
            console.log('标签货架:', nfcInfo)
            setShelfInfo(nfcInfo)
        }
    }, [])
    return (
        <View style={styles.root}>
            <KeyboardAvoidingView behavior={'position'}>
                <CommonBar title='普通物品数据修订' navigation_params={navigation} hasBack />
                <View style={styles.header}>
                    <Text style={styles.titletxt}>点击物品开始修改数据；完成后添加【确定上传】
                        <Text style={styles.subtitletxt}>(标签物品请在平台端进行谨慎修订)</Text>
                    </Text>
                </View>
                <View style={styles.flatListview}>
                    <FlatList
                        data={storelist}
                        renderItem={({ item }) => {
                            return <TouchableOpacity style={styles.flatItem} onPress={() => {
                                setSelectStore(item)
                                setSelectStoreValue(item['count'].toString())
                                setModalVisible(true)
                            }}>
                                <View><Text>{item.name}</Text></View>
                                <View><Text>{item.count}</Text></View>
                            </TouchableOpacity>
                        }}
                    />
                </View>
                <View style={styles.panelview}>
                    <Input
                        placeholder='请输入变动的说明'
                        leftIcon={
                            <Icon
                                name={"inbox"}
                                size={20}
                                color='#999999'
                            />
                        }
                        value={remark}
                        onChangeText={(v) => { setRemark(v) }}
                    />
                    <Button title="确定上传" loading={isLoading} buttonStyle={{ backgroundColor: 'tomato' }} onPress={() => {
                        uploadHandler()
                    }} />
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    hardwareAccelerated={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.modalheaderView}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                    }}
                                >
                                    <Icon name='close' color='#D0D0D0' raised size={26} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.modalbodyView}>
                                <Text style={styles.subtitleText}>请输入【{selectStore['name']}】的数量</Text>
                                <Input
                                    placeholder='请输入物品的数量'
                                    leftIcon={
                                        <Icon
                                            name={"inbox"}
                                            size={20}
                                            color='#999999'
                                        />
                                    }
                                    value={selectStoreValue}
                                    onChangeText={(v) => { setSelectStoreValue(v) }}
                                />
                                <Button raised buttonStyle={styles.button} title="确定" onPress={() => {
                                    if (selectStoreValue.length === 0) { ToastAndroid.showWithGravity("不可为空", ToastAndroid.SHORT, ToastAndroid.CENTER); return }
                                    if (selectStoreValue !== '0' && !parseInt(selectStoreValue)) { ToastAndroid.showWithGravity("只能为数字", ToastAndroid.SHORT, ToastAndroid.CENTER); return }
                                    let copylist = JSON.parse(JSON.stringify(storelist))
                                    copylist.forEach((storeItem) => {
                                        if (storeItem['id'] === selectStore['id']) {
                                            storeItem['count'] = parseInt(selectStoreValue)
                                        }
                                    })
                                    setStorelist(copylist)
                                    setModalVisible(false);
                                    // if (!rfidName) {
                                    //     ToastAndroid.showWithGravity("请输入标签名称", ToastAndroid.SHORT, ToastAndroid.CENTER);
                                    //     return
                                    // }
                                    // insertRfidToDB();
                                }} />
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </View>
    )
}
const styles = StyleSheet.create({
    root: { flex: 1 },
    header: {
        height: 40, backgroundColor: '#fa541c',
        paddingLeft: 10, paddingRight: 10,
        alignItems: 'center', flexDirection: 'row'
    },
    titletxt: {
        fontSize: 14, color: 'white'
    },
    subtitletxt: {
        fontSize: 12, color: 'white'
    },
    flatListview: {
        height: height - 64 - 40 - 140,
        paddingLeft: 10, paddingRight: 10,
    },
    flatItem: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, padding: 10, backgroundColor: 'white' },
    panelview: {
        height: 140,
        width: width,
        paddingLeft: 10, paddingRight: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)"
    },
    modalView: {
        margin: 10,
        width: width - 50,
        backgroundColor: "white",
        borderRadius: 5,
        padding: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modalheaderView: {
        width: '100%',
        height: 40,
        display: 'flex',
        flexDirection: 'row-reverse'
    },
    modalbodyView: {
        width: '100%',
        display: 'flex',
        height: 150,
    },
})
