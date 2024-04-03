# 功能

针对 uniapp 的条件编译的编程体验优化：

- 1、Snippets -- 识别键入 ifdef、ifndef 进行代码提示
- 2、Folding -- 对添加编译代码支持折叠
- 3、Decorations -- 可通过编辑器标题栏的平台选择器，选择相应编译平台，置灰其他平台条件编译代码

![gif](https://s2.loli.net/2022/09/12/vwtxZSVuJcAGPBd.gif)

## 使用说明

### Decorations

针对 uniapp 多平台项目，置灰未选择的编译平台所包含的[编译条件](https://uniapp.dcloud.net.cn/tutorial/platform.html)内代码。这里的编译平台是指启动命令中`uni -p mp-weixin -m dev` 中 -p 参数的可选值，因此除了默认的 mp-weixin、mp-baidu 等，也支持[package.json 扩展配置](https://uniapp.dcloud.net.cn/collocation/package.html)，即定义在 package.json 中的平台。

按照[package.json 扩展配置](https://uniapp.dcloud.net.cn/collocation/package.html) 所描述的，每个平台有其默认生效的编译条件，本插件支持如下：

| 参数值 （可选值）       | 平台描述                                 | 对应生效的编译条件（%PLATFORM%）                                                |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| h5                      | 浏览器                                   | H5 、WEB                                                                        |
| mp-weixin               | 微信小程序                               | MP-WEIXIN、MP                                                                   |
| mp-baidu                | 百度小程序                               | MP-BAIDU、MP                                                                    |
| mp-toutiao              | 抖音小程序                               | MP-TOUTIAO、MP                                                                  |
| mp-alipay               | 支付宝小程序                             | MP-ALIPAY、MP                                                                   |
| mp-kuaishou             | 快手小程序                               | MP-KUAISHOU、MP                                                                 |
| mp-lark                 | 飞书小程序                               | MP-LARK 、MP                                                                    |
| mp-qq                   | QQ 小程序                                | MP-QQ 、MP                                                                      |
| mp-jd                   | 京东小程序                               | MP-JD 、MP                                                                      |
| mp-360                  | 360 小程序                               | MP-360 、MP                                                                     |
| quickapp-webview        | 快应用通用(包含联盟、华为)               | QUICKAPP-WEBVIEW                                                                |
| quickapp-html           | 快应用联盟                               | QUICKAPP-WEBVIEW-UNION                                                          |
| quickapp-webview-huawei | 快应用华为                               | QUICKAPP-WEBVIEW-HUAWEI                                                         |
| 自定义的                | package.json 中 uni-app 中拓展的编译平台 | 包括 对应于 UNI_PLATFORM 平台对应生效的编译条件，以及定义在 define 中的编译条件 |

注：上述表格未提及的编译条件（%PLATFORM%），例如 VUE3、VUE2、uniVersion 等暂不支持。后续可支持针对特定编译平台指定生效的编译条件。

### 支持设置置灰文本颜色

![image-20220912172738939](https://s2.loli.net/2022/09/12/LMwRe26ItJkEAhi.png)
