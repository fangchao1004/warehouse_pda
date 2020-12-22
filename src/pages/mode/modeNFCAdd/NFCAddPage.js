import React, { useEffect, useState, useCallback, useContext } from 'react'
import { View, ToastAndroid, Alert, Text, KeyboardAvoidingView, Dimensions, ScrollView } from 'react-native'
import { Button, Card, Input } from 'react-native-elements';
import NfcManager from 'react-native-nfc-manager';
import Icon from 'react-native-vector-icons/FontAwesome';
import Api from '../../../api/Api';
import CommonBar from '../../../common/CommonBar';
import { filterTag, getJsonTree } from '../../../common/Tool';
import { AppDataContext } from '../../../data/AppData';
import TreeSelect from 'react-native-tree-select';
const { height, width } = Dimensions.get('window');

export default ({ navigation, route }) => {
    const { appState } = useContext(AppDataContext)
    const [code, setCode] = useState(null)
    const [name, setName] = useState(null)
    const [num, setNum] = useState(null)
    const [model, setModel] = useState(null)
    const [treeData, setTreeData] = useState([])
    const [tagName, setTagName] = useState(null)
    const [tagId, setTagId] = useState(null)
    const onTagDiscovered = useCallback(async (tag) => {
        if (tag && tag.id) {
            setCode(tag.id)
        }
    }, [])
    const getTagList = useCallback(async () => {
        let res = await Api.listAllTag();
        let res_all_tag = res.data;
        if (res_all_tag.code === 0) {
            res_all_tag.data = filterTag(res_all_tag.data, 0)
            let treeResult = res_all_tag.data.map((item) => { return { id: item.id, pId: item.tids ? item.tids[0] : 0, value: item.id, title: item.name } })
            let temp_list = getJsonTree(treeResult, 0);
            let onlyarealist = temp_list.filter((item) => { return item.id === 1 })///这里将tag中id为1的确定为区域tag
            setTreeData(onlyarealist)
        }
    }, [])
    const init = useCallback(async () => {
        await NfcManager.unregisterTagEvent()
        await NfcManager.registerTagEvent(onTagDiscovered) ///注册该事件，相当于开启此功能入口
        getTagList()
    }, [getTagList])
    const registerTag = useCallback(async () => {
        if (code && name && tagId && num !== null) {
            ///先判断数据库中，是否已经存在。存在的话。就提醒用户再次上传就会更新标签的数据【name】
            let res_get = await Api.getNfc({ code })
            console.log('res_get:', res_get)
            if (res_get.length > 0) {
                Alert.alert(
                    "该标签已经在数据库中注册",
                    "是否进行更新？",
                    [
                        { text: "取消" },
                        {
                            text: "确定", onPress: async () => {
                                let res_update = await Api.updateNfc({ code, name, tagId, model, num })
                                if (res_update) {
                                    ToastAndroid.showWithGravity("更新成功", ToastAndroid.SHORT, ToastAndroid.CENTER);
                                }
                                else {
                                    ToastAndroid.showWithGravity("更新失败", ToastAndroid.SHORT, ToastAndroid.CENTER);
                                }
                            }
                        }
                    ]
                );
            } else {
                let res_add = await Api.addNfc({ code, name, tagId, model, num })
                if (res_add) {
                    ToastAndroid.showWithGravity("上传成功", ToastAndroid.SHORT, ToastAndroid.CENTER);
                }
                else { ToastAndroid.showWithGravity("上传失败", ToastAndroid.SHORT, ToastAndroid.CENTER); }
            }
        } else { ToastAndroid.showWithGravity("请完善数据，再上传信息", ToastAndroid.SHORT, ToastAndroid.CENTER); }
    }, [code, name, tagId, model, num])
    useEffect(() => {
        if (route.params?.tag_id) {
            setCode(route.params.tag_id)
            getTagList()
        } else {
            init();
        }
        return () => {
            console.log('卸载')
            NfcManager.unregisterTagEvent()///反注册该事件，相当于关闭此功能入口
        }
    }, [route.params?.tag_id, init, getTagList]);
    return (
        <KeyboardAvoidingView behavior={'position'}>
            <CommonBar title='信息录入' navigation_params={navigation} hasBack hasMenu menuIcon={<Icon name='trash-o' color='#FFFFFF' size={20} />} menuCallback={() => {
                console.log('delete handler')
                setCode(null)
                setName(null)
                setNum(null)
                setModel(null)
                setTagName(null)
                setTagId(null)
            }} />
            <View>
                <View style={{ display: 'flex', alignItems: 'center' }}><Text style={{ color: '#888888' }}>【如需修改，直接再次录入即可】</Text></View>
                <Card>
                    <View style={{ height: 180 }}>
                        <TreeSelect
                            isOpen
                            itemStyle={{
                                backgroudColor: '#FFFFFF',
                                fontSize: 12,
                                color: '#888888'
                            }}
                            selectedItemStyle={{
                                backgroudColor: appState.themeColor,
                                fontSize: 12,
                                color: '#FFFFFF'
                            }}
                            data={treeData}
                            onClick={({ item }) => { setTagName(item.name); setTagId(item.id) }}
                        />
                    </View>
                </Card>
                <Card>
                    <ScrollView style={{ height: height - 380 }}>
                        <Input
                            disabled
                            placeholder='请上方滑动选择区域【必选】'
                            leftIcon={
                                <Icon
                                    name='map'
                                    size={20}
                                    color='#999999'
                                />
                            }
                            value={tagName}
                        />
                        <Input
                            disabled
                            placeholder='请贴上货架标签【必填】'
                            leftIcon={
                                <Icon
                                    name='credit-card'
                                    size={20}
                                    color='#999999'
                                />
                            }
                            value={code}
                        />
                        <Input
                            placeholder='请输入编号【必填】'
                            leftIcon={
                                <Icon
                                    name='list-ol'
                                    size={20}
                                    color='#999999'
                                />
                            }
                            value={num}
                            onChangeText={(txt) => { setNum(txt) }}
                        />
                        <Input
                            placeholder='请输入名称【必填】'
                            leftIcon={
                                <Icon
                                    name='inbox'
                                    size={20}
                                    color='#999999'
                                />
                            }
                            value={name}
                            onChangeText={(txt) => { setName(txt) }}
                        />
                        <Input
                            placeholder='请输入型号【选填】'
                            leftIcon={
                                <Icon
                                    name='cogs'
                                    size={20}
                                    color='#999999'
                                />
                            }
                            value={model}
                            onChangeText={(txt) => { setModel(txt) }}
                        />
                        <Button
                            buttonStyle={{ backgroundColor: appState.themeColor }}
                            raised
                            iconRight
                            icon={{
                                name: "login",
                                size: 20,
                                color: "white"
                            }}
                            title="注册"
                            onPress={registerTag}
                        />
                    </ScrollView>
                </Card>
            </View>
        </KeyboardAvoidingView>
    )
}