import React, { useCallback, useContext, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Modal, Alert } from 'react-native'
import Api from '../../../api/Api'
import CommonBar from '../../../common/CommonBar'
import { AppDataContext } from '../../../data/AppData';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button, Input } from 'react-native-elements';
import NfcManager from 'react-native-nfc-manager';
import { ToastAndroid } from 'react-native';

const { height, width } = Dimensions.get('window');

export default function NFCBindPage({ navigation }) {
    const { appState } = useContext(AppDataContext)
    const [code, setCode] = useState(null)
    const [unBindNfcList, setUnBindnfcList] = useState([])
    const [selectItem, setSelectItem] = useState({})
    const [modalVisible, setModalVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const onTagDiscovered = useCallback(async (tag) => {
        if (tag && tag.id) {
            setCode(tag.id)
        }
    }, [])
    const init = useCallback(async () => {
        let list = await Api.getUnbindNfcList()
        setUnBindnfcList(list.map((item, index) => { item.key = String(index); return item }))
    }, [])
    const closeHandler = useCallback(() => {
        setCode(null)
        setSelectItem({})
        setModalVisible(false);
        NfcManager.unregisterTagEvent()///反注册该事件，相当于关闭此功能入口
    })
    const bindHandler = useCallback(async () => {
        if (!code) { ToastAndroid.showWithGravity("请先贴上货架标签", ToastAndroid.SHORT, ToastAndroid.CENTER); return }
        setLoading(true)
        ///检查当前标签是否已经绑定过
        let res = await Api.getNfc({ code })
        if (res.length > 0) {
            Alert.alert(
                `当前NFC已经绑定过【${res[0].num}  ${res[0].name}】标签！是否要更新绑定？`,
                "原先绑定的标签将会变成未绑定状态",
                [
                    { text: "取消", onPress: () => { setLoading(false) } },
                    {
                        text: "确定", onPress: async () => {
                            let unbindres = await Api.unbindNfc({ id: res[0].id })
                            if (unbindres) {
                                let bindres = await Api.bindNfc({ code, id: selectItem.id })
                                if (bindres) { ToastAndroid.showWithGravity("绑定成功", ToastAndroid.SHORT, ToastAndroid.CENTER); setLoading(false); closeHandler(); init(); return }
                            }
                        }
                    }
                ]
            );
        } else {
            let bindres = await Api.bindNfc({ code, id: selectItem.id })
            if (bindres) { ToastAndroid.showWithGravity("绑定成功", ToastAndroid.SHORT, ToastAndroid.CENTER); setLoading(false); closeHandler(); init() }
        }
        setTimeout(() => {
            setLoading(false)
        }, 5000)
    }, [code, selectItem])
    useEffect(() => {
        init()
        return () => {
            console.log('NFCBindPage 卸载 反注册该事件')
            NfcManager.unregisterTagEvent()///反注册该事件，相当于关闭此功能入口
        }
    }, [init])
    return (
        <View style={styles.root}>
            <CommonBar title='货架标签绑定' navigation_params={navigation} hasBack />
            <View style={styles.flatListview}>
                <FlatList
                    data={unBindNfcList}
                    renderItem={({ item }) => {
                        return <TouchableOpacity style={styles.flatItem} onPress={async () => {
                            setSelectItem(item)
                            setModalVisible(true)
                            await NfcManager.unregisterTagEvent()
                            await NfcManager.registerTagEvent(onTagDiscovered) ///注册该事件，相当于开启此功能入口
                        }}>
                            <View><Text>{item.num}{'   '}{item.name}</Text></View>
                            <View><Text>{item.model}</Text></View>
                            <View><Text>{item.tag_name}</Text></View>
                        </TouchableOpacity>
                    }}
                />
            </View>
            <View style={styles.bottomView}>
                <Text style={styles.lab}>点击选择未绑定的货架</Text>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                hardwareAccelerated={true}
                visible={modalVisible}
                onRequestClose={() => { closeHandler() }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.modalheaderView}>
                            <TouchableOpacity
                                onPress={closeHandler}
                            >
                                <Icon name='close' color='#D0D0D0' raised size={26} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalbodyView}>
                            <Text style={styles.subtitleText}>请绑定【{selectItem['num']}  {selectItem['name']}】标签</Text>
                            <Input
                                disabled
                                placeholder='请贴上需要绑定的标签'
                                leftIcon={
                                    <Icon
                                        name={"inbox"}
                                        size={20}
                                        color='#999999'
                                    />
                                }
                                value={code}
                            />
                            <Button
                                loading={loading}
                                buttonStyle={{ backgroundColor: appState.themeColor }}
                                raised
                                iconRight
                                icon={{
                                    name: "link",
                                    size: 20,
                                    color: "white"
                                }}
                                title="绑定"
                                onPress={bindHandler}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    flatListview: {
        height: height - 64 - 40,
        paddingLeft: 10, paddingRight: 10,
        // backgroundColor: 'red'
    },
    flatItem: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, padding: 10, backgroundColor: 'white' },
    bottomView: {
        backgroundColor: '#1890ff', height: 40, alignItems: 'center', justifyContent: 'center'
    },
    lab: {
        color: '#FFFFFF'
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