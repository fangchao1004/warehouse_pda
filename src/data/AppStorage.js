import AsyncStorage from "@react-native-async-storage/async-storage"
/**
 * 详情查看
 * https://react-native-async-storage.github.io/async-storage/docs/api#multiremove
 */

export async function getStorage({ key }) {
    try {
        return await AsyncStorage.getItem(key)
    } catch (e) {
        // read error
    }
    console.log('Done.')
}
export async function getStorageObject({ key }) {
    try {
        const jsonValue = await AsyncStorage.getItem('@key')
        return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (e) {
        // read error
    }
    console.log('Done.')
}
export async function setStorage({ key, value }) {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (e) {
        // save error
    }
    console.log('Done.')
}
export async function setStorageObject({ key, value }) {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
        // save error
    }
    console.log('Done.')
}
export function removeStorage({ key }) {
    try {
        await AsyncStorage.removeItem(key)
    } catch (e) {
        // remove error
    }
    console.log('Done.')
}
/**
 * 批量获取键值对
 * @param {*} param0 
 */
export async function getMultiple({ key_list: [] }) {
    let values
    try {
        values = await AsyncStorage.multiGet(key_list)
    } catch (e) {
        // read error
    }
    console.log(values)
}
/**
 * 批量设置键值对
 * 以二维数组模式
 * @param {*} multi_key_value_list  
 * [[key_1, value_1], [key_2, value_2]]
 */
export async function multiSet({ multi_key_value_list }) {
    // const firstPair = ["@MyApp_user", "value_1"]
    // const secondPair = ["@MyApp_key", "value_2"]
    try {
        await AsyncStorage.multiSet(multi_key_value_list)
    } catch (e) {
        //save error
    }
    console.log("Done.")
}
/**
 * 批量移除
 * @param {*} key_list 
 */
export async function multiRemove({ key_list }) {
    // const keys = ['@MyApp_USER_1', '@MyApp_USER_2']
    try {
        await AsyncStorage.multiRemove(key_list)
    } catch (e) {
        // remove error
    }
    console.log('Done')
}
export async function clearAll() {
    try {
        await AsyncStorage.clear()
    } catch (e) {
        // clear error
    }
    console.log('Done.')
}