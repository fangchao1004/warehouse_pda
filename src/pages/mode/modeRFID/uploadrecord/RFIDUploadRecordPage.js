import React, { useEffect, useCallback, useState, useContext } from 'react'
import { View, Text, StyleSheet, Dimensions, ToastAndroid, TouchableOpacity, Alert } from 'react-native'
import { Button, Card, Input } from 'react-native-elements';
import CommonBar from '../../../../common/CommonBar'
import Icon from 'react-native-vector-icons/FontAwesome';
import Api from '../../../../api/Api';
import { checkIsLost, sortBindList } from '../../../../common/Tool';
import moment from 'moment'
import { AppDataContext } from '../../../../data/AppData';

const FORMAT = 'YYYY-MM-DD HH:mm:ss'
const { height } = Dimensions.get('window');
/**
 *上传RFID,扫描记录界面
 * @export
 * @returns
 */
export default function RFIDUploadRecordPage({ navigation, route }) {
    const { appState, appDispatch } = useContext(AppDataContext)
    const [bindedList, setBindedList] = useState([])///已经在rfids表中注册的，也绑定了store的rfid标签
    const [isSort, setIsSort] = useState(true)///是否排序分类【如：A物品多少个，B物品多少个】
    const [isUploading, setIsUploading] = useState(false)
    const [isLost, setIsLost] = useState(false)
    const [lostList, setLostList] = useState([])
    const [stepNum, setStepNum] = useState(0)
    const [remarkText, setRemarkText] = useState(null)
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
    const uploadHandler = useCallback(() => {
        Alert.alert(
            "确定上传信息作为盘存记录吗？",
            null,
            [
                { text: "取消" },
                {
                    text: "确定", onPress: async () => {
                        if (isLost && !remarkText) {
                            ToastAndroid.showWithGravity("数据不一致时，必须添加备注", ToastAndroid.SHORT, ToastAndroid.CENTER);
                            return
                        }
                        let time = setTimeout(() => {
                            setIsUploading(false)
                        }, 5000);
                        setIsUploading(true)
                        let afterSort = sortBindList(bindedList).map((item) => { item['rfid_count'] = item['rfid_list'].length; return item })
                        let newRemarkText = null
                        if (remarkText) { newRemarkText = remarkText }///如果remarkText为空字符；转换成null
                        // console.log('===========');
                        // console.log('2--缺失数据:', lostList);
                        // console.log('2--扫描数据:', afterSort);
                        // console.log('2--备注:', newRemarkText);
                        let is_lost = isLost ? 1 : 0;
                        let content_scan = JSON.stringify(afterSort);
                        let content_lost = lostList.length === 0 ? null : JSON.stringify(lostList);
                        let user_name = appState.user.name;
                        let requsetData = { is_lost, user_name, content_scan, content_lost, remark: newRemarkText, time: moment().format(FORMAT) };
                        console.log('requsetData:', requsetData)
                        let upload_res = await Api.uploadStoreScanRecords(requsetData)
                        if (upload_res) {
                            ToastAndroid.showWithGravity("上传记录成功", ToastAndroid.SHORT, ToastAndroid.CENTER);
                        } else {
                            ToastAndroid.showWithGravity("上传记录失败", ToastAndroid.SHORT, ToastAndroid.CENTER);
                        }
                        setIsUploading(false)
                        clearTimeout(time)
                    }
                }
            ]
        );
    }, [isLost, remarkText, lostList, bindedList])
    const renderLostList = useCallback(() => {
        let tempComponent = [
            <View key={'x'} style={{ ...styles.bindcardtitle, paddingBottom: 10 }}>
                <Text style={styles.warntxt} >物品名称</Text>
                <Text style={styles.warntxt} >数量</Text>
            </View>
        ]
        let tempList = lostList.map((item, index) => {
            return <View key={index} style={{ ...styles.bindcardtitle, paddingBottom: 10 }}>
                <Text style={styles.warntxt} >{item['store_name']}</Text>
                <Text style={styles.warntxt} >{item['count_lost']}</Text>
            </View>
        })
        tempComponent.push(tempList)
        return tempComponent
    }, [lostList])
    const init = useCallback(async (get_bind_list) => {
        ///获取store中所有has_rfid=1的物品的数量。与扫描的数据已经比对。如果不一致要提醒用户。继续上传还是返回扫描
        let store_list = await Api.getStorelistByhasrfid()
        if (store_list) {
            let temp_store_list = store_list.filter((item) => item.count > 0).map((item) => {
                let tempObj = {};
                tempObj['store_id'] = item['id'];
                tempObj['count'] = item['count'];
                tempObj['store_name'] = item['name'];
                return tempObj
            })
            let tempStoreObjList = sortBindList(get_bind_list).map((item) => { item['count'] = item['rfid_list'].length; return item })
            // console.log('temp_store_list:', temp_store_list)///数据库中的数据
            // console.log('tempStoreObjList:', tempStoreObjList)///实际扫描的数据
            let { is_lost, lost_list } = checkIsLost(temp_store_list, tempStoreObjList)///是否数据缺少
            setIsLost(is_lost)
            setLostList(lost_list)
        }
    }, [])
    useEffect(() => {
        if (route.params?.bind_list) {
            setBindedList(route.params.bind_list)
            init(route.params.bind_list);
        }
    }, [init])
    return (
        <View style={styles.root}>
            <CommonBar title='上传记录' navigation_params={navigation} hasBack />
            <Card>
                <View style={styles.bindcardtitle}><Text style={{ width: 40 }}></Text>
                    <Text style={styles.titlestr}>记录信息</Text>
                    <TouchableOpacity onPress={() => {
                        // navigation.navigate('rfiduploadrecord', { bind_list: bindedList })
                        setIsSort(!isSort)
                    }}><Text style={{ width: 40, color: '#1890ff' }}>{isSort ? '逐条' : '归类'}</Text></TouchableOpacity>
                </View>
                <Card.Divider />
                {renderHandler()}
                <View>
                    {stepNum === 0 ?
                        (isLost ?
                            <View>
                                <View style={styles.infoview}>
                                    <Text style={styles.warntxt} >【扫描数据与库存数据不一致是否上传】 </Text><Icon
                                        name='warning'
                                        size={20}
                                        color={styles.warntxt.color}
                                    /></View>
                                <Card>
                                    <Card.Title> <Text style={styles.warntxt} >遗漏诊断 </Text></Card.Title>
                                    <Card.Divider />
                                    {renderLostList()}

                                </Card>
                            </View>
                            :
                            <View style={styles.infoview}>
                                <Text style={styles.oktxt} >【扫描数据与库存数据符合是否上传】 </Text><Icon
                                    name='check-circle-o'
                                    size={20}
                                    color={styles.oktxt.color}
                                /></View>
                        ) : <View>
                            <Input
                                placeholderTextColor={isLost ? 'tomato' : '#999999'}
                                placeholder={isLost ? '备注【必填】' : '备注【选填】'}
                                leftIcon={
                                    <Icon
                                        name='edit'
                                        size={20}
                                        color={isLost ? 'tomato' : '#999999'}
                                    />
                                }
                                value={remarkText}
                                onChangeText={(v) => { setRemarkText(v) }}
                            />
                            <Button loading={isUploading} buttonStyle={styles.btnstyle} title='开始上传' raised onPress={uploadHandler} />
                        </View>}
                    <View style={styles.footview}>
                        {stepNum === 0 ?
                            <TouchableOpacity onPress={() => { navigation.pop(2) }}><Text style={styles.normaltxt} >返回扫描</Text></TouchableOpacity>
                            : <TouchableOpacity onPress={() => { setStepNum(stepNum - 1) }}><Text style={styles.normaltxt} >上一步</Text></TouchableOpacity>}
                        {stepNum === 0 ? <TouchableOpacity onPress={() => { setStepNum(stepNum + 1) }}><Text style={styles.normaltxt} >确定上传</Text></TouchableOpacity> : null}
                    </View>
                </View>
            </Card>
        </View>
    )
}
const styles = StyleSheet.create({
    root: { flex: 1 },
    bodyview: {
        height: height - 64,
        width: '100%',
    },
    warntxt: {
        color: 'tomato'
    },
    oktxt: {
        color: '#52c41a'
    },
    normaltxt: {
        color: '#1890ff'
    },
    btnstyle: {
        backgroundColor: 'tomato'
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
    infoview: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    footview: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
})
