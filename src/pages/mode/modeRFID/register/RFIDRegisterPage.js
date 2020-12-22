import React, { useCallback, useEffect, useState } from 'react'
import { Modal } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { ToastAndroid } from 'react-native';
import { Alert } from 'react-native';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native'
import { Button, CheckBox, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Api from '../../../../api/Api';
import CommonBar from '../../../../common/CommonBar'

const { height, width } = Dimensions.get('window');
var testList = [{ "code": "300833B2DDD9014000000000", "count": 1 },
{ "code": "300833B2DDD9014000000000", "count": 2 },
    // { "code": "300833B2DDD9014000000000", "count": 3 },
    // { "code": "300833B2DDD9014000000000", "count": 3 },
    // { "code": "300833B2DDD9014000000000", "count": 1 },
    // { "code": "300833B2DDD9014000000000", "count": 2 },
    // { "code": "300833B2DDD9014000000000", "count": 3 },
    // { "code": "300833B2DDD9014000000000", "count": 3 },
    // { "code": "300833B2DDD9014000000000", "count": 1 },
    // { "code": "300833B2DDD9014000000000", "count": 2 },
    // { "code": "300833B2DDD9014000000000", "count": 3 },
    // { "code": "300833B2DDD9014000000000", "count": 3 },
    // { "code": "300833B2DDD9014000000000", "count": 1 },
    // { "code": "300833B2DDD9014000000000", "count": 2 },
    // { "code": "300833B2DDD9014000000000", "count": 3 },
    // { "code": "300833B2DDD9014000000000", "count": 3 },
    // { "code": "300833B2DDD9014000000000", "count": 1 },
    // { "code": "300833B2DDD9014000000000", "count": 2 },
    // { "code": "300833B2DDD9014000000000", "count": 3 },
    // { "code": "300833B2DDD901400000000z", "count": 3 },
]
/**
 * RFID注册界面
 * @param {*} param0 
 */
export default function RFIDRegisterPage({ navigation, route }) {
    const [list, setList] = useState([])
    const [isSelectAll, setIsSelectAll] = useState(true)
    const [selectList, setSelectList] = useState(testList)
    const [modalVisible, setModalVisible] = useState(false)
    const [rfidName, setRfidName] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const selectChange = useCallback((index) => {
        let afterselect_list = [];
        if (index === -1) {
            afterselect_list = list.map((item) => {
                item['select'] = !isSelectAll;
                return item;
            })
        } else {
            list[index]['select'] = !list[index]['select']
            afterselect_list = list
        }
        let isall = true;
        afterselect_list.forEach((item) => {
            if (item['select'] === false) { isall = false }
        })
        setSelectList(afterselect_list.filter((item) => item['select'] === true))
        setIsSelectAll(isall)
        setList(afterselect_list)
    }, [isSelectAll, list])
    /**
     * 数据添加到数据库 rfids 表
     */
    const insertRfidToDB = useCallback(async () => {
        setIsLoading(true)
        let res = await Api.addRfidList({ rfidName, selectList })
        if (res) {
            Alert.alert(
                "注册成功",
                "是否进一步执行绑定操作？",
                [
                    {
                        text: "取消", onPress: () => {
                            navigation.popToTop()
                        }
                    },
                    {
                        text: "确定", onPress: async () => {
                            navigation.replace('rfidbind', { unbind_rfid_list: selectList })
                        }
                    }
                ]
            );
        }
        else { ToastAndroid.showWithGravity("注册失败", ToastAndroid.SHORT, ToastAndroid.CENTER); }
        setIsLoading(false)
        setModalVisible(false)
    }, [rfidName, selectList])
    useEffect(() => {
        if (route.params?.unregister_rfid_list) {
            let init_list = testList.map((item, index) => { item['select'] = true; item['key'] = index.toString(); return item })
            setList(init_list)
        }
    }, [])
    return (
        <View style={styles.root}>
            <CommonBar style={styles.commonbar} title='注册标签' navigation_params={navigation} hasBack />
            <View style={styles.flatListview}>
                <FlatList
                    data={list}
                    renderItem={({ item, index }) => {
                        return <CheckBox
                            title={item['code']}
                            checked={item['select']}
                            onPress={() => {
                                selectChange(index)
                            }}
                        />
                    }}
                />
            </View>
            <View style={styles.panelview}>
                <CheckBox
                    title={<View style={styles.titlebar}><Text>全选</Text>
                        <Text>{selectList.length > 0 ? `已选择 ${selectList.length} 项` : '请选择标签'}</Text>
                    </View>}
                    checked={isSelectAll}
                    onPress={() => {
                        selectChange(-1)
                    }}
                />
                <View style={styles.btnview}>
                    <Button raised title={selectList.length > 1 ? '批量注册' : '注册'} disabled={selectList.length === 0 ? true : false} onPress={() => {
                        setModalVisible(true)
                    }} />
                </View>
            </View>
            <View style={styles.centeredView}>
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
                                {selectList.length > 1 ? <Text style={styles.subtitleText}>批量注册时名称末尾会自动添加数字编号：(1)、(2)...</Text> : null}
                                <Input
                                    placeholder='请输入标签名称'
                                    leftIcon={
                                        <Icon
                                            name={selectList.length > 1 ? "tags" : "tag"}
                                            size={20}
                                            color='#999999'
                                        />
                                    }
                                    value={rfidName}
                                    onChangeText={(v) => { setRfidName(v) }}
                                />
                                <Button raised buttonStyle={styles.button} title="确定" loading={isLoading} onPress={() => {
                                    if (!rfidName) {
                                        ToastAndroid.showWithGravity("请输入标签名称", ToastAndroid.SHORT, ToastAndroid.CENTER);
                                        return
                                    }
                                    insertRfidToDB();
                                }} />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    commonbar: {
        width: width,
    },
    flatListview: {
        height: height - 64 - 120,
        width: width,
    },
    panelview: {
        height: 120,
        width: width,
    },
    btnview: {
        paddingLeft: 10,
        paddingRight: 10,
    },
    itemseparator: {
        height: 1,
        backgroundColor: 'skyblue'
    },
    titlebar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingLeft: 10,
        paddingRight: 20,
    },
    subtitleText: {
        fontSize: 12,
        color: 'tomato'
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
