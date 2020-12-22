import React, { useCallback, useEffect, useState } from 'react';
import UhfExample from './src/UhfExample'
import { Button, DeviceEventEmitter, FlatList, StyleSheet, Text, View, } from 'react-native';
import Sound from 'react-native-sound';
import { Modal } from 'react-native';

var uhf_Subscription;
var tempObj = {};
var tempList = [];
export default () => {
    const [isLoop, setIsLoop] = useState(false)
    const [uhfList, setUhfList] = useState('[]')
    const [modalVisible, setModalVisible] = useState(false);

    const init = useCallback(() => {
        var whoosh = new Sound('beep_ok.wav', Sound.MAIN_BUNDLE);
        tempObj = {};
        tempList = [];
        uhf_Subscription = DeviceEventEmitter.addListener('uhf_data', e => {//for Android
            doUhfDataHandler(e.data)
            // whoosh.play();
        });
    }, [])
    const doUhfDataHandler = useCallback((uhf_id) => {
        let is_exist = false;
        tempList.forEach((item) => {
            if (item.id === uhf_id) {
                is_exist = true;
                item.count += 1;
            }
        })
        if (!is_exist) {
            tempList.push({ id: uhf_id, count: 1 })
        }
        setUhfList(JSON.stringify(tempList))
    }, [])
    useEffect(() => {
        init();
        return () => {
            if (uhf_Subscription)
                DeviceEventEmitter.removeSubscription(uhf_Subscription)
        }
    }, [])
    return <View>
        <Button title="清除列表" onPress={() => {
            tempObj = {};
            tempList = [];
            setUhfList('[]')
        }} />
        <Text>测试页面</Text>
        <Button title={!isLoop ? "开始扫描" : "停止扫描"} color={!isLoop ? "blue" : "red"} onPress={() => {
            UhfExample.startInventory((v) => {
                setIsLoop(v)
            });
        }} />
        <FlatList
            data={JSON.parse(uhfList)}
            renderItem={({ item }) => {
                return <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>{item.id}</Text>
                    <Text>{item.count}</Text>
                </View>
            }}
        />
        <Modal
            animationType="fade"
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
                            <Icon name='close' color='#D0D0D0' />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalbodyView}>
                        <Button buttonStyle={styles.button} title="整理列表" onPress={() => {
                            setModalVisible(!modalVisible);
                        }} />
                        <Button buttonStyle={styles.button} title="清除列表" onPress={() => {
                            tempObj = {};
                            tempList = [];
                            setUhfList('[]')
                        }} />
                    </View>
                </View>
            </View>
        </Modal>
    </View>
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        margin: 10,
        width: width - 50,
        backgroundColor: "white",
        borderRadius: 5,
        padding: 10,
        // alignItems: "center",
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
        height: 50,
        display: 'flex',
        flexDirection: 'row-reverse'
    },
    modalbodyView: {
        width: '100%',
        display: 'flex',
        height: 200,
    },
})
