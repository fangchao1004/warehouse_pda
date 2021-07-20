# warehouse_pda
### 仓库pda项目
### 只针对android系统
### rfid模块，只能在特定机器上运行
### ./gradlew assembleRelease
### 在打包-是否支持rfid的版本时，先查看AppData文件中 support_rfid 的说明；根据说明进行对应修改
### rfid功能要使用特定的pda设备！开启或屏蔽时要修改MainApplication.java 和 customPackage.java 文件中的代码；以及AppData.js文件中的support_rfid字段值
