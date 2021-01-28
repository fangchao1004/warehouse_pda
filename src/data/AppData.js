import React, { useReducer } from 'react'

const initialState = {
    version: 'Beta 0.4',
    updatelog: [
        { v: 'beta 0.1', des: ['应用初始化构建，基本功能搭建'], time: '2020-11-20' },
        { v: 'beta 0.2', des: ['NFC增加型号、编号属性'], time: '2020-12-23' },
        { v: 'beta 0.3', des: ['支持货架物品的NFC盘存','支持RFID的注册、绑定扫描盘存等功能'], time: '2020-12-29' },
        { v: 'beta 0.4', des: ['货架标签录入改为在平台录入后再用PDA端进行NFC的绑定', '货架物品数量修改时，必须添加备注', '添加应用更新记录'], time: '2021-01-28' }
    ],///更新记录
    themeColor: '#1890ff',
    user: null,
}
function reducer(state, action) {
    switch (action.type) {
        case 'user': return { ...state, user: action.data }
        default: return state
    }
}

export const AppDataContext = React.createContext(null)

export default function AppRedux({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    return <AppDataContext.Provider value={{ appState: state, appDispatch: dispatch }}>{children}</AppDataContext.Provider>
}