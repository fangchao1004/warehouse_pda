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
/**
 * 标签数据，归类
 * @param {*} bindedList 
 */
export function sortBindList(bindedList) {
    let tempStoreidList = [];
    let tempStoreObjList = [];
    bindedList.forEach((item) => {
        if (tempStoreidList.indexOf(item["store_id"]) === -1) { ///没处理过
            tempStoreObjList.push({
                "store_id": item["store_id"],
                "store_name": item["store_name"],
                "rfid_list": [{ "code": item["code"], "name": item["name"] }]
            })
            tempStoreidList.push(item['store_id'])
        } else {///已经处理过
            tempStoreObjList.forEach((storeObj) => {
                if (storeObj["store_id"] === item["store_id"]) {
                    storeObj["rfid_list"].push({ "code": item["code"], "name": item["name"] })
                }
            })
        }
    })
    return tempStoreObjList
}
/**
 * 判断是否有漏
 * @param {*} sample_list  模版list
 * @param {*} target_list  目标list
 */
export function checkIsLost(sample_list, target_list) {
    let is_lost = false;
    let sample_list_copy = JSON.parse(JSON.stringify(sample_list))
    let target_list_copy = JSON.parse(JSON.stringify(target_list))
    let lost_list = [];
    sample_list_copy.forEach((item) => {
        item['is_lost'] = true;///是否物品种类或是物品数量缺少
        item['count_lost'] = item['count'];///少了几个【默认全少了】
    })
    sample_list_copy.forEach((item) => {
        target_list_copy.forEach((element) => {
            if (item['store_id'] === element['store_id']) {///物品匹配上
                if (item['count'] === element['count']) {///数量匹配上
                    item['is_lost'] = false;
                    item['count_lost'] = 0;
                } else {
                    item['count_lost'] = item['count'] - element['count'];
                }
            }
        })
    })
    sample_list_copy.forEach((item) => {
        if (item['is_lost']) {
            is_lost = true
            lost_list.push(item)
        }
    })
    return { is_lost, lost_list }
}