const readline = require('linebyline');
const datafile = './data/imagelist.txt';
const userfile = './data/user.json';
const fs = require('fs');

exports.read =  function (callback) {
    let r3 = readline(datafile);
    let arr = new Array();
    let i=0;
    r3.on("line", function (line, ln) {
        arr[i] = line;
        i++;
    }
    );
    r3.on("end", function () {
        return callback(arr);
    });
    
}

exports.login = function (user, callback) {
    msg = {};
    fs.readFile(userfile, 'utf8', function (err, data) {
        if (err) {
            msg["error"] = '1';
            msg["msg"] = "Read file error";
            return callback(msg, null, null);
        }
        let users = JSON.parse(data);
        let password = users[user.name];
        if (password == null || typeof password === 'undefined') {
            msg["error"] = '1';
            msg["msg"] = "Not a registered username";
            return callback(msg, null);
        } else if (user.password != password) {
            msg["error"] = '1';
            msg["msg"] = "Invalid password";
            return callback(msg, null);
        } else {
            msg["error"] = '0';
            msg["msg"] = "Success";
            return callback(msg, user);
        }
    })
}

exports.update = function (user, callback) {
    msg = {};
    fs.readFile(userfile, 'utf8', function (err, data) {
        if (err) {
            msg["error"] = '1';
            msg["msg"] = "Read file error";
            return callback(msg);
        }
        let users = JSON.parse(data);
        if (users[user.name]) {
            msg["error"] = '1';
            msg["msg"] = "Account already exists,can't register again";
            return callback(msg);
        }
        let fileData = data.trim().substring(0, data.trim().length - 1);
        fileData = fileData + ',' + '"' + user.name + '":' + '"' + user.password + '"}'
        fs.writeFile(userfile, fileData, function (err) {
            if (err) {
                msg["error"] = '1';
                msg["msg"] = "Write file error";
                return callback(msg)
            }
            msg["error"] = '0';
            msg["msg"] = "Success";
            callback(msg);
        });
    })
}