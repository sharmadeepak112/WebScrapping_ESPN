const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

let seriesName = process.argv[2];
let urlOfSeries = "https://www.espncricinfo.com/series/" + seriesName + "/match-results";
request(urlOfSeries, seriesCallBack);
function seriesCallBack(err, res, html) {
    if (err) {
        console.log(err);
    }
    else {
        allMatchOfSeries(html);
    }
}

let matchesDetails = [];
function allMatchOfSeries(html) {
    let $ = cheerio.load(html);
    let scoreCardArr = $("[data-hover='Scorecard']");
    for (let i = 0; i < scoreCardArr.length; i++) {
        let scoreCardUrl = $(scoreCardArr[i]).attr("href");
        let scoreCardUrlInArr = scoreCardUrl.split("/");
        let nameOfMatches = scoreCardUrlInArr[3];
        let nameOfMatchesInArr = nameOfMatches.split("-");
        matchesDetails.push({
            matchesId: nameOfMatchesInArr[nameOfMatchesInArr.length - 1],
        });

        scoreCardFullUrl = "https://www.espncricinfo.com" + scoreCardUrl;


        request(scoreCardFullUrl, scorCardCallBack.bind(this, scoreCardArr.length,i));
    }

}


function scorCardCallBack(totalMatches,index, err, res, html) {
    if (err) {
        console.log(err);
    }
    else {
        allTablesOfMatches(totalMatches,index, html);
    }
}
let count=0;
function allTablesOfMatches(totalMatches,index, html) {
    let $ = cheerio.load(html);
    let allTablesArr = $('.table');
    for (let i = 0; i < 4; i++) {
        count++;
        let headerofTable = $(allTablesArr[i]).find('thead>tr>th');
        let allRowsOfTable = $(allTablesArr[i]).find('tbody>tr');
        let table = [];
        for (let j = 0; j < allRowsOfTable.length; j++) {
            let allColumnOfRow = $(allRowsOfTable[j]).find('td');
            let tableObj = {};
            for (let c = 0; c < allColumnOfRow.length; c++) {
                let heading = $(headerofTable[c]).text();
                let rowData = $(allColumnOfRow[c]).text();
                tableObj[heading]=rowData;
            }
           table.push(tableObj);
        }
        let tableName = "table" + i;
        matchesDetails[index][tableName] = table;
    
    }
    if(count==totalMatches*4){
        fs.writeFileSync("ipl.json",JSON.stringify(matchesDetails));
       console.log("File is Ready");
    }
}
