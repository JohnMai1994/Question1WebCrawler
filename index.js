const request = require('request')
const cheerio = require('cheerio')
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/indeed"

/*
* Part1: 获取数据
* Part2: 存入数据库
* */


async function app(keyword = "Software Developer") {

    for (let page = 1; page <=50 ; page++) {
        const table = await getTable(keyword, page, MongoClient);
    }

}


async function getTable(keyword, page, MongoClient) {

    await request(
        `https://ca.indeed.com/jobs?q=${keyword.replace(" ", "+")}&start=${page * 10}`,
        (err, res) => {
            if (err) {
                console.log(err.code);
            } else {
                MongoClient.connect(url, function (err, db) {
                    let dbo = db.db("indeed");
                    // 抓取数据
                    let $ = cheerio.load(res.body);
                    let jsonData = {};
                    jsonData.keyWord = `${keyword}`;
                    jsonData.lists = [];
                    $('.jobsearch-SerpJobCard').each(function (index) {
                        let list = {};
                        list.title = $(this).find(".title>a").text().trim();
                        list.company = $(this).find(".sjcl .company").text().trim();
                        // jsonData.lists.push(list);
                        dbo.collection(keyword).insertOne(list, function(err, res) {
                            if (err) throw err;
                            console.log("文档插入成功");
                        });
                    })
                    db.close();
                })
            }
        }
    )

}

app();






