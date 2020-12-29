import React, { useReducer } from 'react'

const initialState = {
    version: 'Beta 0.3',
    updatelog: [{ v: 'beta 0.2', des: 'NFC增加型号、编号属性' },
    { v: 'beta 0.3', des: '支持货架物品的NFC盘存，支持RFID的注册、绑定扫描盘存等功能' }
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