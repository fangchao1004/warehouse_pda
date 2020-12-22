import React, { useContext } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AppDataContext } from '../data/AppData';
const { width } = Dimensions.get('window');
export default (props) => {
    const { appState } = useContext(AppDataContext)
    const height = props.height || 64;
    const hasBack = props.hasBack || false;
    const hasMenu = props.hasMenu || false;
    const navigation = props.navigation_params;
    const backCallback = props.backCallback;
    const menuCallback = props.menuCallback;
    const menuIcon = props.menuIcon || <Icon name='th-list' color='#FFFFFF' size={20} />
    // console.log('props:', props)
    return (
        <SafeAreaView style={{ height: height, backgroundColor: appState.themeColor }}>
            <View style={styles.root}>
                {hasBack ?
                    <Button buttonStyle={styles.backBtn} icon={<Icon name='chevron-left' color='#FFFFFF' size={20} />} title={null} onPress={() => {
                        if (navigation && !backCallback) { navigation.goBack() }
                        else if (navigation && backCallback) { backCallback() }
                    }} /> :
                    <View style={styles.emptyBox} />}
                <View style={styles.titleview}><Text style={styles.title}>{props.title || ''}</Text></View>
                {hasMenu ?
                    <Button buttonStyle={styles.backBtn} icon={menuIcon} title={null} onPress={() => {
                        if (menuCallback) menuCallback()
                    }} /> :
                    <View style={styles.emptyBox} />}
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        width: width,
    },
    emptyBox: { width: 40 },
    backBtn: { backgroundColor: 'rgba(0, 0, 0, 0)' },
    titleview: { width: width - 80, flexDirection: 'row', justifyContent: 'center' },
    title: { color: '#FFFFFF', fontSize: 16 }
})