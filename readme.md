# 我爱记单词
txt简易导入
记录默写一键生成
## 运行方法
npm start
## 打包方法
##### 为什么用expo而不是原生react-native
本项目主打一个小巧，开箱即用，不需要深度定制react-native
##### 调试Android
手机应用商店下载Expo Go 
使用Expo Go扫描二维码
##### eas云端构建Android框架
eas login

Email or username : bkg666
password : Ax411346

eas init

eas build --platform android --profile preview  (不写profile默认打包第一个build profile)

build踩坑: 本地不能有中文路径,打包默认生成abb（谷歌应用商店）记得在eas.json改生成apk

## 未来开发规划
##### 接入AI agent ，一键生成txt
##### 保存位置优化，android
##### 苹果接入
##### 单词列表不好看，改为如图格式

![image-20260127161441302](./assets/image-20260127161441302.png)

##### 添加单词新增音标/助记发音填写项

##### 查看答案应该按单个查看