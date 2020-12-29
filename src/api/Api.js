import Axios from 'axios'
export const Testuri = 'http://ixiaomu.cn:3010/'///小木服务器数据库 3008正式 3010测试
export const permisstion = [{ name: '专工权限', value: 0 }, { name: '运行权限', value: 1 }, { name: '消费审批权限', value: 2 }, { name: '维修权限', value: 3 }]
const SERVER_URL = 'http://ixiaomu.cn:3210/'///仓库后台api

const Api = {
    ////////////////////////////////////////////////////////////////
    listAllTag: () => Axios.post(SERVER_URL + 'listAllTag', {}),
    ///////////////////////////////////////////////////////////////
    obs: function (params, f1, f2) {
        if (f1) {
            return Axios.post(Testuri + 'obs', params).then(res => {
                if (f1) { f1(res) }
            }).catch(res => {
                if (f2) { f2(res) }
            })
        } else {
            return Axios.post(Testuri + 'obs', params, f1, f2)
        }
    },
    getUserList: async (username, password) => {
        let condition_sql = '';
        if (username && password) {
            condition_sql = `and username = '${username}' and password = '${password}'`
        }
        let sql = `select users.* ,group_concat(u_m_j.mj_id) as major_id_all, group_concat(majors.name) as major_name_all,levels.name as level_name from users
        left join (select * from levels where effective = 1)levels on levels.id = users.level_id
        left join (select * from user_map_major where effective = 1) u_m_j on u_m_j.user_id = users.id
        left join (select * from majors  where effective = 1) majors on majors.id = u_m_j.mj_id
        where users.effective = 1 ${condition_sql}
        group by users.id
        order by level_id`
        let result = await Api.obs({ sql })
        if (result.data.code === 0) {
            return result.data.data
        }
        return []
    },
    getUserRole: async (user_id) => {
        let sql = `select roles.id,roles.value,roles.des from role_map_user
          left join roles on roles.id = role_map_user.role_id
          where user_id = ${user_id} and effective = 1`
        let result_role = await Api.obs({ sql })
        if (result_role.data.code === 0) {
            return result_role.data.data
        }
        return []
    },
    getNfcList: async (nfc_code) => {
        let condition_sql = ''
        if (nfc_code) { condition_sql = `where nfc_shelfs.isdelete = 0 and nfc_shelfs.code = '${nfc_code}'` }
        let sql = `select nfc_shelfs.*, tags.name as tag_name from nfc_shelfs
        left join (select * from tags where isdelete = 0) tags on tags.id = nfc_shelfs.tag_id
        ${condition_sql}`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return res.data.data
        }
        return []
    },
    getStoreListByNfcId: async (nfc_shelf_id) => {
        let sql = `select * from stores where nfc_shelf_id = ${nfc_shelf_id} and isdelete = 0`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return res.data.data
        }
        return []
    },
    getNfc: async ({ code }) => {
        let sql = `select * from nfc_shelfs where code = '${code}' and isdelete = 0`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return res.data.data
        }
        return []
    },
    addNfc: async ({ code, name, tagId, model, num }) => {
        let sql = `insert into nfc_shelfs (code,name,tag_id${model ? ',model' : ''}${num ? ',num' : ''}) values ('${code}','${name}',${tagId}${model ? ",'" + model + "'" : ''}${num ? ",'" + num + "'" : ''})`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return true
        }
        return false
    },
    updateNfc: async ({ code, name, tagId, model, num }) => {
        let sql = `update nfc_shelfs set name = '${name}', tag_id = ${tagId} ,model = ${model ? "'" + model + "'" : null},num = ${num ? "'" + num + "'" : null} where code = '${code}'`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return true
        }
        return false
    },
    getRfidList: async () => {
        let sql = `select rfids.*,stores.name as store_name from rfids
        left join stores on stores.id = rfids.store_id
        where rfids.isdelete = 0`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return res.data.data
        }
        return []
    },
    addRfidList: async ({ rfidName, selectList }) => {
        let temp_sql = '';
        selectList.forEach((item, index) => {
            let name_footer = index > 0 ? '(' + (index) + ')' : ''
            let temp_cell = '("' + item['code'] + '","' + rfidName + name_footer + '"),'
            temp_sql = temp_sql + temp_cell
        })
        temp_sql = temp_sql.substring(0, temp_sql.length - 1)
        let sql = `insert into rfids (rfid_code,name) values ${temp_sql}`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return true
        }
        return false
    },
    getAllRfidStores: async () => {
        let sql = `select * from stores where isdelete = 0 and has_rfid = 1`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return res.data.data
        }
        return []
    },
    bindRfidToStore: async ({ rfids, store_id }) => {
        let tempstr = '';
        rfids.forEach((rfid) => {
            tempstr = tempstr + '"' + rfid + '",'
        })
        tempstr = tempstr.substring(0, tempstr.length - 1)
        let sql = `update rfids set store_id = ${store_id} where rfid_code in (${tempstr})  and isdelete = 0`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return true
        }
        return false
    },
    getStoreCountByStoreId: async ({ store_id }) => {
        let sql = `select count(id) as count from rfids where store_id = ${store_id} and isdelete = 0`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return res.data.data
        }
        return []
    },
    updateStoreCount: async ({ count, store_id }) => {
        let sql = `update stores set count = ${count} where id = ${store_id} and isdelete = 0`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return true
        }
        return false
    },
    getStorelistByhasrfid: async () => {
        let sql = `select * from stores where isdelete = 0 and has_rfid = 1`
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return res.data.data
        }
        return []
    },
    /**
     * 上传扫描
     * @param {*} param0 
     * is_lost = 0, 是否遗漏
     * user_name, 用户名称
     * content_scan 扫描记录 JSON.stringify
     * content_lost 诊断记录 JSON.stringify 或 null
     * remark 备注 
     * time 时间 YYYY-MM-DD HH:MM:ss
     */
    uploadStoreScanRecords: async ({ is_lost = 0, user_name, content_scan = null, content_lost = null, remark = null, time }) => {
        let sql = `insert into store_scan_records (is_lost,user_name, content_scan, content_lost, remark, time) values 
        (${is_lost},'${user_name}',${content_scan ? "'" + content_scan + "'" : null},${content_lost ? "'" + content_lost + "'" : null},${remark ? "'" + remark + "'" : null},'${time}')`
        console.log('sql:', sql)
        let res = await Api.obs({ sql })
        if (res.data.code === 0) {
            return true
        }
        return false
    },
}
export default Api;