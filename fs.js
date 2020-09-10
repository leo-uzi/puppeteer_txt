const fs = require('fs');
// 包装读取为promise对象
function fsRead(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, { flag: 'r', encoding: 'utf-8' }, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}
// 包装写入为promise对象
function fsWrite(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, { flag: 'a', encoding: 'utf-8' }, (err) => {
            if (err) {
                reject(err)
            }
        })
    })
}
module.exports.fsRead = fsRead;
module.exports.fsWrite = fsWrite