import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, ToastAndroid, StyleSheet, Image, Alert } from 'react-native'
import CommonBar from '../../../common/CommonBar'
import NfcManager from 'react-native-nfc-manager';
import Api from '../../../api/Api';
import { Button, Card, ListItem } from 'react-native-elements';
import card_png from '../../../assets/card.png'
import nfc_png from '../../../assets/nfc.png'
import Icon from 'react-native-vector-icons/FontAwesome';

export default ({ navigation }) => {
    const [nfcInfo, setNfcInfo] = useState(null)
    const [storelist, setStorelist] = useState([])
    const [allCount, setAllCount] = useState(0)
    const onTagDiscovered = useCallback(async (tag) => {
        if (tag && tag.id) {
            try {
                let list = await Api.getNfcList(tag.id)
                if (list.length === 0) {
                    Alert.alert(
                        "该标签没有在数据库中注册",
                        "是否进行注册？",
                        [
                            { text: "取消", onPress: () => console.log("Cancel Pressed") },
                            { text: "确定", onPress: () => navigation.navigate('nfcadd', { tag_id: tag.id }) }///将nfc的code传递过去
                        ]
                    );
                } else {
                    const tagInfo = list[0]
                    console.log('tagInfo:', tagInfo)
                    setNfcInfo(tagInfo)
                    let list_store = await Api.getStoreListByNfcId(tagInfo.id)
                    let temp_all_count = 0;
                    list_store.forEach((item) => {
                        temp_all_count += item.count
                    })
                    setAllCount(temp_all_count)
                    if (list_store.length > 0) { setStorelist(list_store) }
                }
            } catch (error) {
                console.log('error:', error)
            }
        }
    }, [])
    const init = useCallback(async () => {
        const is_sup_nfc = await NfcManager.isSupported();
        if (!is_sup_nfc) { ToastAndroid.showWithGravity("设备不支持NFC", ToastAndroid.SHORT, ToastAndroid.CENTER); return }
        await NfcManager.unregisterTagEvent()
        await NfcManager.registerTagEvent(onTagDiscovered) ///注册该事件，相当于开启此功能入口
    }, [])
    useEffect(() => {
        console.log('信息查看页面创建')
        init();
        return () => {
            console.log('卸载')
            NfcManager.unregisterTagEvent()///反注册该事件，相当于关闭此功能入口
        }
    }, [init])
    return (
        <View>
            <CommonBar title='信息查看' navigation_params={navigation} hasBack />
            {nfcInfo ?
                <Card>
                    <View>
                        <View style={styles.titlebar}>
                            <View style={styles.titlebarleft}>
                                <Image
                                    style={styles.image}
                                    resizeMode="cover"
                                    source={card_png}
                                />
                                <View>
                                    <Text style={styles.titletxt}>{nfcInfo.name}</Text>
                                    <Text style={styles.subtitletxt}>{nfcInfo.num ? '编号:' + nfcInfo.num : ''}</Text>
                                    <Text style={styles.subtitletxt}>{nfcInfo.model ? '型号:' + nfcInfo.model : ''}</Text>
                                    <Text style={styles.subtitletxt}>{nfcInfo.tag_name ? '区域:' + nfcInfo.tag_name : ''}</Text>
                                </View>
                            </View>
                            <Button buttonStyle={styles.backBtn} icon={<Icon name='close' color='#888888' size={20} />} title={null} onPress={() => {
                                setNfcInfo(null)
                            }} />
                        </View>
                        <Card.Divider />
                        {storelist.length > 0 ? <View>
                            {storelist.map((item, index) => {
                                return <View key={index} style={styles.storebar}>
                                    <Text>{item.name}</Text>
                                    <Text>{item.count} {item.unit}</Text>
                                </View>
                            })}
                            <View key={'x'} style={styles.storebar}>
                                <Text>合计</Text>
                                <Text>{allCount}</Text>
                            </View>
                        </View> : null}
                    </View>
                </Card> : <Card>
                    <Card.Title>请贴上货架标签</Card.Title>
                    <Card.Divider />
                    <View style={styles.contentview}>
                        <Image
                            style={styles.image2}
                            resizeMode="cover"
                            source={nfc_png}
                        />
                    </View>
                </Card>}
        </View>
    )
}
const styles = StyleSheet.create({
    titlebar: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    titlebarleft: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
    },
    backBtn: { backgroundColor: 'rgba(0, 0, 0, 0)' },
    storebar: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    contentview: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titletxt: {
        fontSize: 16,
        marginLeft: 10,
        width: 220,
    },
    subtitletxt: {
        fontSize: 12,
        marginLeft: 10,
        width: 220,
        color: '#888888'
    },
    image: {
        width: 30,
        height: 30,
    },
    image2: {
        width: 100,
        height: 100
    },
    user: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'row'
    }
})