const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
// 导入读取写入函数
const { fsRead, fsWrite } = require('./fs.js');
let devOptions = {
        headless: false,
        defaultViewport: {
            width: 1000,
            height: 1000
        }

    }
    // 设置定时器
function setTime(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('定时器以设置')
        }, time);
    })
}
// 读取书籍数据文件
async function readJson() {
    let bookListArray = []
    let dataString = await fsRead('./txt/txtList.txt')
    let dataStringReg = /(\{.*?\})---/igs
    let regTest
        // 循环提取并转化json保存至数组中
    while (regTest = dataStringReg.exec(dataString) != null) {
        data = dataStringReg.exec(dataString)[1]
        data = JSON.parse(data)
        bookListArray.push(data)
    }
    // 循环下载数组中对应书籍并保存本地
    bookListArray.forEach(async(item, i) => {
        setTime(100 * i)
        let { data } = await axios.get(item.url, { responseType: 'stream' })
            // let browser = await puppeteer.launch(devOptions)
            // let page = await browser.newPage()
            // await page.goto(item.url)
        let ws = fs.createWriteStream(`./book/${item.title}.zip`)
        data.pipe(ws)
        ws.on('close', () => {
            console.log('写入结束');
            ws.close()
        })
    })
}
readJson()