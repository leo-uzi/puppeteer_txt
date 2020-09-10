const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const urls = require('url');
// 自调用主函数
(async function() {
    // 开发环境配置
    let devOptions = {
            headless: false,
            defaultViewport: {
                width: 1000,
                height: 1000
            }
        }
        // 生产环境配置
    let prodOptions = {
            headless: true
        }
        // 设置定时器
    function setTime(time) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('定时器已开启')
            }, time);
        })
    }
    // 创建browser实例对象
    let browser = await puppeteer.launch(devOptions)
        // 创建新page实例对象
    let page = await browser.newPage()
        // 页面打开
    await page.goto('http://www.bookshuku.com/');
    // 若是前端渲染页面，需要等待页面元素渲染完成
    await page.waitForSelector('#newNav li a')
        // 获取所有类别的链接地址和类名
    let menuList = await page.$$eval('#newNav li a', (element) => {
        let menuArray = []
        element.forEach(item => {
            let obj = {
                title: item.innerHTML,
                url: item.getAttribute('href')
            }
            menuArray.push(obj)
        })
        return menuArray
    })
    page.close()
        // 获取并进去不同分类页面
    async function getTypeList() {
        let page = await browser.newPage()
            // menuList.forEach(item => {
            //     await page.goto(item.url)
            // })
        await page.goto(menuList[1].url)
            // 获取总页数
            // 若是前端渲染页面，需要等待页面元素渲染完成
        await page.waitForSelector('.mainNextPage')
        let pagenum = await page.$eval('.mainNextPage', (element) => {
            let pagenum = element.innerText.trim()
                // let pagenumReg = /.*?\/(.*?)/igs
                // pagenum = pagenumReg.exec(pagenum)
            pagenum = pagenum.slice(12, 16)
            return pagenum
        })
        page.close()
            // 循环进行每个分类总页数的书名和链接获取
        for (i = 1; i <= 1; i++) {
            let page = await browser.newPage()
            setTime(1000 * i)
            let urlNow = menuList[1].url + 'index_' + i + '.html'
            await page.goto(urlNow)
                // 若是前端渲染页面，需要等待页面元素渲染完成
            await page.waitForSelector('#mainlistUL .mainListInfo  a')
                // 获取对应的书名和链接地址
            let bookList = await page.$$eval('#mainlistUL .mainListInfo  a', (element) => {
                    let bookList = []
                    element.forEach(item => {
                        let obj = {
                            title: item.innerText,
                            url: item.getAttribute('href')
                        }
                        bookList.push(obj)
                    })

                    return bookList
                })
                // 获取下载书籍数据
            async function bookDownload() {
                bookList.forEach(async(item, i) => {
                    let bookReg = /bookinfo/
                    let page = await browser.newPage()
                    item.url = item.url.replace(bookReg, 'down')
                        // 设置请求拦截器拦截谷歌相关网页请求
                    await page.setRequestInterception(true);
                    page.on('request', interceptedRequest => {
                        if (interceptedRequest.url().indexOf('google') != -1)
                            fs.writeFile()
                        interceptedRequest.abort();
                        else
                            interceptedRequest.continue();
                    });
                    await page.goto(item.url)
                        // 若是前端渲染页面，需要等待页面元素渲染完成
                    await page.waitForSelector('#Frame tbody tr tbody tr:nth-child(5) .strong.blue')
                    let url = await page.$eval('#Frame tbody tr tbody tr:nth-child(5) .strong.blue', (element) => {
                        let url = element.getAttribute('href')
                        return url
                    })
                    let txtData = `{"title":"${item.title}","url":"${url}"}---\n`
                        // 书名和下载链接写入本地
                    fs.writeFile(`./txt/txtList.txt`, txtData, { flag: 'a', encoding: 'utf-8' }, (err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('写入成功');
                            page.close()
                        }
                    })
                })
            }
            bookDownload()
        }
    }
    // 获取各个分类页面的总页数
    getTypeList()
})()