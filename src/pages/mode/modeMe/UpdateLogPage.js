import React, { useCallback, useContext, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native'
import { Card } from 'react-native-elements';
import CommonBar from '../../../common/CommonBar'
import { AppDataContext } from '../../../data/AppData'
const { height, width } = Dimensions.get('window');
export default function UpdateLogPage({ navigation }) {
    const { appState } = useContext(AppDataContext)
    return (
        <View>
            <CommonBar title='更新记录' navigation_params={navigation} hasBack />
            <View style={styles.flatListview}>
                <FlatList
                    data={appState.updatelog.map((item, index) => { item.key = String(index); return item }).reverse()}
                    renderItem={({ item }) => {
                        return <Card>
                            <Card.Title>{item.time}{'----'}{item.v}</Card.Title>
                            {item.des.map((onedes, index) => {
                                return <Text key={String(index)}>{index + 1}{'. '}{onedes}</Text>
                            })}
                        </Card>
                    }}
                />
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    root: { flex: 1 },
    flatListview: {
        height: height - 64,
        paddingLeft: 10, paddingRight: 10,
        // backgroundColor: 'red'
    },
})