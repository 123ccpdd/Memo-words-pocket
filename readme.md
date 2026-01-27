# 运行方法
# 打包方法
## 为什么用expo而不是原生react-native
本项目主打一个小巧，开箱即用，不需要深度定制react-native
## 调试Android
手机应用商店下载Expo Go 
使用Expo Go扫描二维码
## eas云端构建Android框架
eas login

Email or username : bkg666
password : Ax411346

eas init

eas build --platform android --profile preview  (不写profile默认打包第一个build profile)

build踩坑: 不能有中文路径,打包默认生成abb（谷歌应用商店）记得改eas.json