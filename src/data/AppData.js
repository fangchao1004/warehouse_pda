import React, { useReducer } from 'react'

const initialState = {
    version: 'Beta 0.2',
    updatelog: [{ v: 'beta 0.2', des: 'NFC增加型号、编号属性' }],///更新记录
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