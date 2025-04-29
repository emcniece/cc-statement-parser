const fs = require('fs');
const pdf = require('pdf-parse');
const ObjectsToCsv = require('objects-to-csv');

const statementDir = './statements-2024';

function getCategory(desc){
    if(desc.match(/homedep|hardware|canadiant|rona|princess|stapl|slegg/i)){
        return 'MATERIALS'
    }

    if(desc.match(/pizz|cream|bin4|skip|popey|LABELLE|foost|caffe|gamersup|earls|mcdo|smiths|bedford|ghostra|clarity|opas|\&w64|A&W|spoon|italian|mocktail|tacof|farmhousecof|sushi|dqgril|fujiya|murch|booster|secondch|starbu|coffee|greencu|parsonag|maygold|floyd|timh/i)){
        return 'TREAT'
    }

    if(desc.match(/liqu|brewe|EVERYTHINGWINE|heraldstreet|drake|heckler|smallgod|distil|superfl/i)){
        return 'LIQ'
    }

    if(desc.match(/LONDOND|dental|clearly|madele|pharma/i)){
        return 'MEDS'
    }

    if(desc.match(/thrift|fairw|saveon|galey|realcdn|st.jean|costco|marketon|rootcel|deli/i)){
        return 'FOOD'
    }

    if(desc.match(/veter|pacificcat|petsm|bosley/i)){
        return 'CAT'
    }

    if(desc.match(/spotif|twitch|playst|nint|artgal|royalandmcp|cineplex|puzzlelab|patreo|butchart|butterfly|royalbc|backerkit|steam|russel|kobo|maximu|herman|streamlab|bandcam|tangi|maxsol|munro|druid/i)){
        return 'ENTERTAIN'
    }

    if(desc.match(/telus|publicm|victory|barber|icbc|google|saanich|fedex|simpletax|dhl|ups|parking|gfl|insuran|westland|cityofvic|vultr|amazonweb|adobe|parkvic|bchyd/i)){
        return 'BILLS'
    }

    if(desc.match(/michael|valuevil|ikea|homesen|sportch|ebay|oscar|theregional|plusbeads|mountainequip|beadworl|kickst|lordco|dollara|sonos|oldnavy|etsy|wal-mar|papery|cardino|winner|gardenw|fabricl|chatter|thebay|lavie|aliexpre|indigo|floathou|hudson|mark|marshall|gapcan|shopper|redb|bestbuy|sephor|softmoc/i)){
        return 'SHOP'
    }

    if(desc.match(/name-cheap|tucows|ubiqu|101domain|tayda|interiorelec|mouser|digik/i)){
        return 'EMC2Build'
    }

    if(desc.match(/blackfor|westwind|leevall|cutlist|reimer|carbide|VANISLEPLYWOOD|spind.plast/i)){
        return 'EMC2Wood'
    }

    if(desc.match(/opus|scribd|stairway|spinnacl|KENBROMLEYART|PRETTYPAINT/i)){
        return 'MelArt'
    }

    if(desc.match(/retailint|ANNUALFEE/i)){
        return 'INTEREST'
    }

    if(desc.match(/payment-|rewardsred/i)){
        return 'PAYMENTS'
    }

    if(desc.match(/kia|bicycle|petrocan|ONTHERUNEV|easypark|easyjet|airport|airfra|aircan|expedia|satain|trvlins|bcf|bestwestern|PENINSULACO/i)){
        return 'TRAVEL'
    }

    return false
}

async function parseFiles(){
    let outputObj = []
    const files = fs.readdirSync(statementDir);
    console.log(files)

    for(const file of files){
        let fPath = `${statementDir}/${file}`
        console.log('starting', file)
        let dataBuffer = await fs.readFileSync(fPath);
        data = await pdf(dataBuffer)

        // console.log('number of pages', data.numpages);
        // console.log('number of rendered pages', data.numrender);
        // console.log('PDF info', data.info);
        // console.log('PDF metadata', data.metadata); 
        // console.log('PDF.js version', data.version);
        // console.log('PDF text', typeof data.text); 

        // This expression captures the expense lines:
        // NOV15NOV18$25.10VICTORIAFUJIYAFOODSVICTORIA
        let money = "-?\\$\\d{1,3}(,\\d{3})*(\\.\\d{2})?"
        let month = '\\w{3}\\d{1,2}'
        let expenseRe = new RegExp(`^(${month})(${month})(${money})(.*)`, 'g')

        data.text.split(/\r?\n/).forEach(line => {
            let result;
            while(result = expenseRe.exec(line)) {
                let cat = getCategory(result[6])
                outputObj.push({
                    transDate: result[1],
                    postDate: result[2],
                    amount: result[3],
                    desc: result[6],
                    category: getCategory(result[6]),
                    orig: result[0]
                });
            }
        });
        console.log('Added', outputObj.length, file)
    }
    return outputObj
}


(async () => {
    data = await parseFiles()
    console.log('Final length:', data.length)
    const csv = new ObjectsToCsv(data);
   
    // Write to file:
    await csv.toDisk('./test.csv');
    console.log('done')
})();
