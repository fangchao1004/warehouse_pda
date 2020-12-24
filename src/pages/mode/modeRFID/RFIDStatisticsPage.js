import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import CommonBar from '../../../common/CommonBar';
import { Card, Button } from 'react-native-elements'
import { ScrollView } from 'react-native';
import { sortBindList } from '../../../common/Tool';

const { height } = Dimensions.get('window');
export default ({ navigation, route }) => {
    const [rfidList, setRfidList] = useState([])///所有之前页面扫描到后，传递来的的rfid标签数据
    const [bindedList, setBindedList] = useState([])///已经在rfids表中注册的，也绑定了store的rfid标签
    const [unBindList, setUnBindList] = useState([])///已经在rfids表中注册的，但是没绑定store的rfid标签
    const [unRegisterList, setUnRegisterList] = useState([])///没在rfids表中注册的rfid标签
    const [isSort, setIsSort] = useState(true)///是否排序分类【如：A物品多少个，B物品多少个】
    /**
     * 渲染已经绑定过的rfid数据
     */
    const renderHandler = useCallback(() => {
        if (isSort) {
            let tempStoreObjList = sortBindList(bindedList)
            return <View>
                <View key={'x'} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text>物品名称</Text>
                    <Text>数量</Text>
                </View>
                {tempStoreObjList.map((storeObj, index) => {
                    return <View key={index} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                        <Text>{storeObj.store_name}</Text>
                        <Text>{storeObj.rfid_list.length}</Text>
                    </View>
                })}
                <View key={'z'} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text>共计</Text>
                    <Text>{bindedList.length}个</Text>
                </View>
            </View>
        } else {
            return bindedList.map((item, index) => {
                return <View key={index} style={{ marginBottom: 10 }}>
                    <Text>标签码：{item.code}</Text>
                    <Text>标签名：{item.name}</Text>
                    <Text>物品名：{item.store_name}</Text>
                </View>
            })
        }
    }, [isSort, bindedList])
    const renderHandler2 = useCallback((unList) => {
        return unList.map((item, index) => {
            return <View key={index} style={{ marginBottom: 10 }}>
                <Text>标签码：{item.code}</Text>
                <Text>标签名：{item.name || '-'}</Text>
                <Text>物品名：{item.store_name || '-'}</Text>
            </View>
        })
    }, [])
    useEffect(() => {
        if (route.params?.rfid_list) {
            // console.log('route.params.rfid_list:', route.params.rfid_list)
            setRfidList(route.params.rfid_list)
            let bindedList = route.params.rfid_list.filter((item) => item.store_name)
            // console.log('bindedList:', bindedList)
            setBindedList(bindedList)
            let unRegisterList = route.params.rfid_list.filter((item) => !item.name)
            setUnRegisterList(unRegisterList)
            let unBindList = route.params.rfid_list.filter((item) => item.name && !item.store_id)
            setUnBindList(unBindList)
        }
    }, [])
    return (
        <View style={styles.root}>
            <CommonBar title='物品统计' navigation_params={navigation} hasBack />
            <ScrollView style={styles.bodyview}>
                <View>
                    {bindedList.length > 0 ?
                        <Card>
                            <View style={styles.bindcardtitle}><Text style={{ width: 40 }}></Text>
                                <Text style={styles.titlestr}>已绑定</Text>
                                <TouchableOpacity onPress={() => {
                                    // navigation.navigate('rfiduploadrecord', { bind_list: bindedList })
                                    setIsSort(!isSort)
                                }}><Text style={{ width: 40, color: '#1890ff' }}>{isSort ? '逐条' : '归类'}</Text></TouchableOpacity>
                            </View>
                            <Card.Divider />
                            {renderHandler()}
                            {/* <Button title={isSort ? '逐条显示' : '归类显示'} type='outline' onPress={() => { setIsSort(!isSort) }} /> */}
                            <Button title='上传记录' type='outline' onPress={() => { navigation.navigate('rfiduploadrecord', { bind_list: bindedList }) }} />
                        </Card> : null}
                    {unBindList.length > 0 ?
                        <Card>
                            <Card.Title>未绑定</Card.Title>
                            <Card.Divider />
                            {renderHandler2(unBindList)}
                            <Button title='绑定' type='outline' onPress={() => {
                                navigation.navigate('rfidbind', { unbind_rfid_list: unBindList })
                            }} />
                        </Card> : null}
                    {unRegisterList.length > 0 ?
                        <Card>
                            <Card.Title>未注册</Card.Title>
                            <Card.Divider />
                            {renderHandler2(unRegisterList)}
                            <Button title='注册' type='outline' onPress={() => {
                                navigation.navigate('rfidregister', { unregister_rfid_list: unRegisterList })
                            }} />
                        </Card> : null}
                </View>
            </ScrollView>
        </View>
    )
}
const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    bodyview: {
        height: height - 64,
        width: '100%',
    },
    bindcardtitle: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
    },
    titlestr: {
        fontSize: 15,
        fontWeight: "bold",
    },
})
