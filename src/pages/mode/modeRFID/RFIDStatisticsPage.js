import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native'
import CommonBar from '../../../common/CommonBar';
import { Card, ListItem, Button, Icon } from 'react-native-elements'
import { ScrollView } from 'react-native';
import tag_png from '../../../assets/tag.png'

const { height } = Dimensions.get('window');
export default ({ navigation, route }) => {
    const [rfidList, setRfidList] = useState([])///所有之前页面扫描到后，传递来的的rfid标签数据
    const [bindedList, setBindedList] = useState([])///已经在rfids表中注册的，也绑定了store的rfid标签
    const [unBindList, setUnBindList] = useState([])///已经在rfids表中注册的，但是没绑定store的rfid标签
    const [unRegisterList, setUnRegisterList] = useState([])///没在rfids表中注册的rfid标签
    const [isSort, setIsSort] = useState(true)///是否排序分类【如：A物品多少个，B物品多少个】
    const init = useCallback(async () => {

    }, [])
    /**
     * 渲染已经绑定过的rfid数据
     */
    const renderHandler = useCallback(() => {
        if (isSort) {
            let tempStoreidList = [];
            let tempStoreObjList = [];
            bindedList.forEach((item) => {
                if (tempStoreidList.indexOf(item["store_id"]) === -1) { ///没处理过
                    tempStoreObjList.push({
                        "store_id": item["store_id"],
                        "store_name": item["store_name"],
                        "rfid_list": [{ "code": item["code"], "name": item["name"] }]
                    })
                    tempStoreidList.push(item['store_id'])
                } else {///已经处理过
                    tempStoreObjList.forEach((storeObj) => {
                        if (storeObj["store_id"] === item["store_id"]) {
                            storeObj["rfid_list"].push({ "code": item["code"], "name": item["name"] })
                        }
                    })
                }
            })
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
            console.log('bindedList:', bindedList)
            setBindedList(bindedList)
            let unRegisterList = route.params.rfid_list.filter((item) => !item.name)
            setUnRegisterList(unRegisterList)
            let unBindList = route.params.rfid_list.filter((item) => item.name && !item.store_id)
            setUnBindList(unBindList)
        }
        init()
    }, [init])
    return (
        <View style={styles.root}>
            <CommonBar title='物品统计' navigation_params={navigation} hasBack />
            <ScrollView style={styles.bodyview}>
                <View>
                    {bindedList.length > 0 ?
                        <Card>
                            <Card.Title>已绑定</Card.Title>
                            <Card.Divider />
                            {renderHandler()}
                            <Button title={isSort ? '默认显示' : '归类显示'} type='outline' onPress={() => { setIsSort(!isSort) }} />
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
    image: {
        width: 100,
        height: 100
    },
})
