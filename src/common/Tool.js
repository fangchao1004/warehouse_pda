/**
 *检查密码是否有非法字符。避免sql注入的情况
 * @export
 * @param {*} password
 * @returns 
 */
export function checkPasswordChart(password) {
    let illegal_list = [',', "'", '"', '=', ' ']
    for (let index = 0; index < password.length; index++) {
        const chart = password[index];
        if (illegal_list.indexOf(chart) !== -1) {
            return false
        }
    }
    return true
}
/**
 * 过滤Tag
 * 暂时前端根据type和tids是否存在过滤
 * @export
 * @param {*} tagList 标签数组
 * @param {String} filterType 需要保留的tag type   0 物品  1 人员
 */
export function filterTag(tagList, filterType) {
    if (tagList && tagList.length > 0 && filterType >= 0) {
        return tagList.filter((item) => {
            if (!item.tids) { return item.type === filterType }
            else { return true }
        })
    } else {
        return tagList
    }
}
export const getJsonTree = function (data, pId) {
    let itemArr = []
    for (let i = 0; i < data.length; i++) {
        let node = data[i]
        if (node.pId === pId) {
            let newNode = {}
            // newNode.selectable = node.allselectable ? true : node.pId > 0 ///不让首层treeSelect元素可选
            newNode.id = node.id
            newNode.sortNo = node.id
            newNode.name = node.title
            newNode.parentId = pId
            newNode.children = getJsonTree(data, node.id)
            itemArr.push(newNode)
        }
    }
    return itemArr
}