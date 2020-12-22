import React from 'react'
import { View, StatusBar, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native'
import { Card, } from 'react-native-elements'
import CommonBar from '../../../common/CommonBar';
import search_png from '../../../assets/search.png'
import input_png from '../../../assets/input.png'
import radar_png from '../../../assets/radar.png'

const { height, width } = Dimensions.get('window');

const list = [
    { img: search_png, title: '货架标签查看', value: 1 },
    { img: input_png, title: '货架标签录入', value: 2 },
    { img: radar_png, title: '物品盘存', value: 3 }
]
function renderFunCard(navigation) {
    return list.map((item, index) => {
        return <View key={index} style={{ width: width / 2, height: 170 }}>
            <TouchableOpacity
                onPress={() => {
                    switch (item.value) {
                        case 1:
                            console.log('into查看界面')
                            navigation.navigate('nfcshow')
                            break;
                        case 2:
                            console.log('into录入界面')
                            navigation.navigate('nfcadd')
                            break;
                        case 3:
                            console.log('物品标签查看')
                            navigation.navigate('rfidshow')
                            break;
                        default:
                            break;
                    }
                }}
            >
                <Card>
                    <Card.Title>{item.title}</Card.Title>
                    <View style={styles.user}>
                        <Image
                            style={styles.image}
                            resizeMode="cover"
                            source={item.img}
                        />
                    </View>
                </Card>
            </TouchableOpacity>
        </View>
    })
}
export default ({ navigation }) => {
    return (
        <View>
            <StatusBar
                animated={true}
                translucent={true}
                hidden={false}
                backgroundColor={'transparent'}
            />
            <CommonBar title='操作界面' navigation_params={navigation} />
            <ScrollView style={styles.scrollview}>
                <View style={styles.mainpage}>
                    {renderFunCard(navigation)}
                </View>
            </ScrollView>
        </View>
    )
}
const styles = StyleSheet.create({
    image: {
        width: 80,
        height: 80,
    },
    scrollview: {
        height: height - 120
    },
    mainpage: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: width,
    },
    user: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'row'
    }
})
