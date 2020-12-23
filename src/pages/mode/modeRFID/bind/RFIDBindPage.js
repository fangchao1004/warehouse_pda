import React, { useCallback, useEffect, useState } from 'react'
import { TouchableOpacity, Dimensions, Image, ActivityIndicator, Alert, View, Text, StyleSheet, FlatList, ToastAndroid } from 'react-native';
import { Button, Card, SearchBar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Api from '../../../../api/Api';
import CommonBar from '../../../../common/CommonBar'
import computer_png from '../../../../assets/computer.png'
import toolbox_png from '../../../../assets/toolbox.png'

const { width, height } = Dimensions.get('window')
function copyList(list, times = 1) {
    let temp_list = []
    for (let index = 0; index < times; index++) {
        temp_list = [...JSON.parse(JSON.stringify(temp_list)), ...list]
    }
    return temp_list
}
var unbind_rfid_list = []///待绑定的rfid_list
var list_orginal = []///原始storelist存根，用于搜索筛选后恢复
/**
 * RFID绑定界面
 * @param {*} param0 
 */
export default function RFIDBindPage({ navigation, route }) {
    const [searchKey, setSeachKey] = useState('')///搜索关键字
    const [storeList, setStoreList] = useState([])///大件物品列表
    const [selectStore, setSelectStore] = useState(null)///选择的物品
    const [isFirst, setIsFirst] = useState(true)///首次进入该页面显示loading图标
    const [isUploading, setIsUploading] = useState(false)///正在上传数据到数据库
    const init = useCallback(async () => {
        let res_list = await Api.getAllRfidStores();///获取所有大件【has_rfid = 1】物品 有数据或为空数组[]
        let list = res_list
        // list = []///测试物品列表数据为空时-【正式时注释掉】
        // list = copyList(list, 10)///将数据复制几次-测试数据量多的情况-【正式时注释掉】
        list_orginal = list.map((item, index) => {
            item['key'] = index.toString();
            return item
        })
        setStoreList(list_orginal)
        setIsFirst(false)
    }, [])
    const onSearchHandler = useCallback(() => {
        if (!searchKey) {
            ToastAndroid.showWithGravity("请输入物品名称", ToastAndroid.SHORT, ToastAndroid.CENTER);
            return;
        }
        let list_afterFiler = list_orginal.filter((item) => {
            if (item['name'].indexOf(searchKey) !== -1) { return true; }
        })
        setStoreList(list_afterFiler)
    }, [searchKey])
    const bindHandler = useCallback(async () => {
        let rfids = unbind_rfid_list.map((item) => item['code'])
        let store_id = selectStore['id']
        Alert.alert(
            "确定将标签绑定至该物品吗？",
            null,
            [
                { text: "取消" },
                {
                    text: "确定", onPress: async () => {
                        ///5秒以后强制移除uploading状态
                        let time = setTimeout(() => {
                            setIsUploading(false)
                        }, 5000);
                        /**
                         * 3次http
                         * 1，更新rfids表中 对应rfid_code的store_id值。
                         * 2，查询rfids表中 对应store_id的条数。count(id) 
                         * 3，更新stores表中，对应store的count
                         * 完成绑定 toast提示，移除uploading状态
                         */
                        setIsUploading(true)
                        let res1 = await Api.bindRfidToStore({ rfids, store_id })
                        if (!res1) { ToastAndroid.showWithGravity("绑定失败1", ToastAndroid.SHORT, ToastAndroid.CENTER); return }
                        let res2 = await Api.getStoreCountByStoreId({ store_id })
                        if (res2.length === 0) { ToastAndroid.showWithGravity("绑定失败2", ToastAndroid.SHORT, ToastAndroid.CENTER); return }
                        let count = res2[0]['count']
                        let res3 = await Api.updateStoreCount({ count, store_id })
                        if (!res3) { ToastAndroid.showWithGravity("绑定失败3", ToastAndroid.SHORT, ToastAndroid.CENTER); return }
                        ///如果绑定成功
                        ToastAndroid.showWithGravity("绑定成功", ToastAndroid.SHORT, ToastAndroid.CENTER);
                        navigation.popToTop()
                        clearTimeout(time)
                    }
                }
            ]
        );

    }, [selectStore])
    useEffect(() => {
        if (route.params?.unbind_rfid_list) {
            unbind_rfid_list = route.params.unbind_rfid_list
            // console.log('unbind_rfid_list:', unbind_rfid_list)
        }
        init()
    }, [init])
    return (
        <View style={styles.root}>
            <CommonBar title='绑定标签至物品' navigation_params={navigation} hasBack />
            {storeList.length === 0 ?
                (isFirst ? <View style={styles.loadingview}><ActivityIndicator size="large" color="#1890ff" /></View> :
                    <View style={styles.cardview}>
                        <Card>
                            <Card.Title>暂无相关物品；请在平台添加【标签物品】</Card.Title>
                            <Card.Divider />
                            <View style={styles.contentview}>
                                <Image
                                    style={styles.image2}
                                    resizeMode="cover"
                                    source={computer_png}
                                />
                            </View>
                        </Card>
                    </View>
                )
                :
                <>
                    <SearchBar
                        containerStyle={{ height: 50, width: width }}
                        inputContainerStyle={{ height: 30 }}
                        inputStyle={{ fontSize: 15 }}
                        round={true}
                        lightTheme={true}
                        placeholder="物品名称模糊搜索..."
                        searchIcon={
                            <TouchableOpacity onPress={() => { onSearchHandler() }}>
                                <Icon name='search' color='#1890ff' raised size={20} />
                            </TouchableOpacity>
                        }
                        clearIcon={
                            <TouchableOpacity onPress={() => { setSeachKey(''); setStoreList(list_orginal) }}>
                                <Icon name='close' color='#a0a0a0' raised size={20} />
                            </TouchableOpacity>}
                        onChangeText={(v) => {
                            if (v.length === 0) { setStoreList(list_orginal) }
                            setSeachKey(v)
                        }}
                        value={searchKey}
                    />
                    <View style={styles.headerview}>
                        <Text>物品名</Text>
                        <Text>选择</Text>
                    </View>
                    <View style={styles.flatlistview}>
                        <FlatList
                            data={storeList}
                            renderItem={({ item, index }) => {
                                return <TouchableOpacity style={styles.flatlistitemview} onPress={() => {
                                    setSelectStore(item)
                                }}>
                                    <View style={styles.imgview}>
                                        <Image
                                            style={styles.image}
                                            resizeMode="cover"
                                            source={toolbox_png}
                                        />
                                        <Text>{item.name || '-'}</Text>
                                    </View>
                                    <View>
                                        {selectStore && selectStore['key'] === item['key'] ?
                                            <Icon name='check' color='#1890ff' raised size={20} />
                                            : null}
                                    </View>
                                </TouchableOpacity>
                            }}
                        />
                    </View>
                    <View style={styles.bottomview}>
                        <View style={styles.infoview}>
                            {selectStore ? <Text style={styles.infotext}>已选：{selectStore['name']}</Text> : <Text style={styles.infotext}>请点击选择要绑定的物品</Text>}
                            {selectStore ? <TouchableOpacity onPress={() => { setSelectStore(null) }}><Text style={{ color: '#1890ff' }}>清除</Text></TouchableOpacity> : null}
                        </View>
                        <Button loading={isUploading} disabled={selectStore ? false : true} buttonStyle={styles.buttonstyle} title="绑定" raised onPress={bindHandler} />
                    </View>
                </>
            }
        </View>
    )
}
const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center'
    },
    loadingview: {
        flex: 1,
        alignItems: 'center', justifyContent: 'center'
    },
    cardview: { width: '100%' },
    contentview: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imgview: { display: 'flex', flexDirection: 'row', alignItems: 'center', },
    image: {
        width: 30,
        height: 30,
        marginRight: 10
    },
    image2: {
        width: 100,
        height: 100
    },
    headerview: {
        width: width - 20,
        height: 40,
        marginBottom: 5,
        display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', backgroundColor: 'white', paddingLeft: 10, paddingRight: 10
    },
    flatlistview: {
        width: width,
        height: height - 64 - 40 - 45 - 120,
        paddingLeft: 10, paddingRight: 10,
    },
    flatlistitemview: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, padding: 10, backgroundColor: 'white' },
    bottomview: {
        width: width,
        paddingLeft: 10, paddingRight: 10, paddingTop: 5,
        height: 120,
    },
    infoview: {
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
        height: 40, width: '100%', backgroundColor: 'white', padding: 10, marginBottom: 10
    },
    infotext: {
        color: 'tomato'
    },
    buttonstyle: {
        width: '100%'
    }
})