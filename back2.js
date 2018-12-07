
function setupPage() {
    buildPrefixSelectList();
}

function buildPrefixSelectList() {
    let list = document.getElementById('prefix-dropdown');

    const subnet = 128;
    for (i = 1; i <= subnet; i++) {
        //default mask of network prefix max as 64
        if (i < 64) {
            const option = document.createElement('option');
            option.text = i + ` (${new BigNumber(2).pow(64 - i).toFormat()} networks /64)`;
            option.value = i;
            list.appendChild(option);
        } else {
            const option = document.createElement('option');
            option.text = i + ` (${new BigNumber(2).pow(subnet - i).toFormat()} addresses)`;
            option.value = i;
            list.appendChild(option);
        }
    }
}

function checkillegal() {

    let inputip = document.getElementById('inputip').value;

    console.log(inputip.search(/[^0-9:abcdef]/i))
    if (inputip.search(/[^0-9:abcdef]/i) !== -1) {
        createError();
        return;
    }

    if (inputip.length > 0) {

        //find all dot 
        const dotpattern = /[:]/g;
        var dotlist = [];

        while (match = dotpattern.exec(inputip)) {
            //console.log('found at' + match.index);
            dotlist.push(match.index);
        }

        console.log(dotlist);

        //find double dot
        const doubledotpattern = /(::)/g;
        let search = doubledotpattern.exec(inputip);

        var doubledot;
        if (search) {
            doubledot = search.index;

            //thorw error if double dot more than 1
            if (inputip.match(doubledotpattern).length > 1) {
                createError();
                return;
            }
        } else {
            doubledot = null;
        }
        //console.log(doubledot)

        //thorw error if first index is dot
        if (dotlist[0] === 0 && dotlist[0] !== doubledot) {
            createError();
            return;
        }

        if (dotlist.length === 7) {
            let newip = "";
            if (doubledot) {
                newip = insertBlankSpace(inputip, doubledot, dotlist.length);
            } else {
                newip = inputip;
            }
            //console.log(newip);

            //renew dotlist
            dotlist = [];
            while (match = dotpattern.exec(newip)) {
                //console.log('found at' + match.index);
                dotlist.push(match.index);
            }

            console.log(newip)

            //find if still have double dot then error
            search = doubledotpattern.exec(newip);

            if (search) {
                createError();
                return;
            }

            const ipblockarr = addZeroAndMakeItArray(dotlist, newip);
            // console.log(ipblockarr)

            //every thing pass
            //console.log(prefixlength);
            const prefixlength = document.getElementById('prefix-dropdown').value;
            clearError();
            createInfoTable(inputip, ipblockarr, prefixlength)
        } else {
            if (dotlist.length !== 0) {
                if (doubledot !== null) {
                    const newip = insertBlankSpace(inputip, doubledot, dotlist.length);
                    console.log(newip);

                    //renew dotlist
                    dotlist = [];
                    while (match = dotpattern.exec(newip)) {
                        //console.log('found at' + match.index);
                        dotlist.push(match.index);
                    }
                    //console.log(dotlist);

                    //find if still have double dot then error
                    search = doubledotpattern.exec(newip);

                    if (search) {
                        createError();
                        return;
                    }

                    const ipblockarr = addZeroAndMakeItArray(dotlist, newip);
                    //every thing pass
                    //console.log(prefixlength);
                    clearError();
                    const prefixlength = document.getElementById('prefix-dropdown').value;
                    createInfoTable(inputip, ipblockarr, prefixlength)
                } else {
                    createError();
                    return;
                }
                //console.log(addZeroAndMakeItArray(dotlist, inputip));
            } else {
                createError();
            }
        }
    } else {
        createError();
    }
}

function insertBlankSpace(ip, index, dotlength) {
    const firstpart = ip.slice(0, index);
    const secondpart = ip.slice(index + 1, ip.length);

    let zeroline = "";

    for (i = 0; i < 8 - dotlength; i++) {
        zeroline += ":0000"
    }

    const newip = firstpart + zeroline + secondpart;
    return newip;
}

function addZeroAndMakeItArray(dotlist, ip) {

    let arr = [];

    dotlist.map((dot) => {
        if (dotlist.indexOf(dot) === 0) {
            var newword = ip.slice(0, dot);
            if (dot < 4) {
                //console.log(newword)
                const length = newword.length;
                for (i = 0; i < 4 - length; i++) {
                    newword = 0 + newword;
                }
                arr.push(newword);
                //console.log(newword)
            } else if (dot > 4) {
                createError();
                return;
            } else {
                arr.push(newword);
            }
        } else {
            var newword = ip.slice(dotlist[dotlist.indexOf(dot) - 1] + 1, dot);
            //console.log(newword)
            if (dot - dotlist[dotlist.indexOf(dot) - 1] < 5) {
                //console.log(newword)
                const length = newword.length;
                for (i = 0; i < 4 - length; i++) {
                    newword = 0 + newword;
                }
                arr.push(newword);
            } else if (dot - dotlist[dotlist.indexOf(dot) - 1] > 5) {
                createError();
                return;
            } else {
                arr.push(newword);
            }
        }

    });


    //finish remain in last of ip
    var newword = ip.slice(dotlist[dotlist.length - 1] + 1, ip.length);
    if (ip.length - 1 - dotlist[dotlist.length - 1] < 5) {
        const length = newword.length;
        for (i = 0; i < 4 - length; i++) {
            newword = 0 + newword;
        }
        arr.push(newword);
    } else if (ip.length - 1 - dotlist[dotlist.length - 1] > 5) {
        createError();
        return;
    } else {
        arr.push(newword);
    }

    console.log(arr)

    return arr;
}

function createInfoTable(originalip, ipblock, prefixlength) {
    console.log(ipblock)
    if (document.getElementById('content') !== null) {
        document.getElementById('address').innerText = originalip + " /" + prefixlength;
        document.getElementById('network').innerText = getNetworkString(ipblock);
        document.getElementById('prefixlength').innerText = prefixlength;
        document.getElementById('networkrange').innerText = divideIpBlock(calculateNetworkRange(ipblock).minlength) + " - \n" + divideIpBlock(calculateNetworkRange(ipblock).maxlength);
        document.getElementById('totalip').innerText = new BigNumber(2).pow(128 - prefixlength).toFormat();

        document.getElementById('fullip').innerText = divideIpBlock(ipblock);
        document.getElementById('integerid').innerText = new BigNumber(createBinaryString(createBinaryArray(ipblock)), 2).toFixed(0);
        document.getElementById('hexadecimalid').innerText = createHexadecimalId(ipblock);
        document.getElementById('dotdecimalid').innerText = createDotDecimalId(ipblock);
        document.getElementById('binaryid').innerText = createBinaryString(createBinaryArray(ipblock));

        createSubnetArea(ipblock, prefixlength);


    } else {
        const contentdiv = document.createElement('div');
        contentdiv.setAttribute("id", "content");
        document.body.appendChild(contentdiv);

        let table = document.createElement('table');
        table.setAttribute('id', 'table1');

        //original address
        let addresstxt = document.createElement('td');
        addresstxt.appendChild(document.createTextNode('Address'));
        let address = document.createElement('td');
        address.appendChild(document.createTextNode(originalip + " /" + prefixlength));
        address.setAttribute('id', 'address');

        //address.style.border = '1px solid black';
        //addresstxt.style.border = '1px solid black';

        let row = document.createElement('tr');
        row.appendChild(addresstxt);
        row.appendChild(address);

        table.appendChild(row);

        //network address
        let networktxt = document.createElement('td');
        networktxt.appendChild(document.createTextNode('Network'));
        let networkvalue = document.createElement('td');
        networkvalue.appendChild(document.createTextNode(getNetworkString(ipblock)));
        networkvalue.setAttribute('id', 'network');


        //address.style.border = '1px solid black';
        //addresstxt.style.border = '1px solid black';

        row = document.createElement('tr');
        row.appendChild(networktxt);
        row.appendChild(networkvalue);

        table.appendChild(row);

        //prefix length
        let prefixtxt = document.createElement('td');
        prefixtxt.appendChild(document.createTextNode('Prefix length'));
        let prefixvalue = document.createElement('td');
        prefixvalue.appendChild(document.createTextNode(prefixlength));
        prefixvalue.setAttribute('id', 'prefixlength');

        row = document.createElement('tr');
        row.appendChild(prefixtxt);
        row.appendChild(prefixvalue);

        table.appendChild(row);

        //network range
        let networkrangetxt = document.createElement('td');
        networkrangetxt.appendChild(document.createTextNode('Network range'));
        let networkrangevalue = document.createElement('td');
        networkrangevalue.appendChild(document.createTextNode(divideIpBlock(calculateNetworkRange(ipblock).minlength) + " - \n" + divideIpBlock(calculateNetworkRange(ipblock).maxlength)));
        networkrangevalue.setAttribute('id', 'networkrange');

        row = document.createElement('tr');
        row.appendChild(networkrangetxt);
        row.appendChild(networkrangevalue);

        table.appendChild(row);

        //total ip addresses
        let totaltiptxt = document.createElement('td');
        totaltiptxt.appendChild(document.createTextNode('Total IP addresses'));
        let totalipvalue = document.createElement('td');
        totalipvalue.appendChild(document.createTextNode(new BigNumber(2).pow(128 - prefixlength).toFormat()));
        totalipvalue.setAttribute('id', 'totalip');

        row = document.createElement('tr');
        row.appendChild(totaltiptxt);
        row.appendChild(totalipvalue);

        table.appendChild(row);

        contentdiv.appendChild(table);

        contentdiv.appendChild(document.createElement('br'));

        //table 2
        let table2 = document.createElement('table');
        table2.setAttribute('id', 'table2');

        //full ip addresses
        let fulliptxt = document.createElement('td');
        fulliptxt.appendChild(document.createTextNode('IP Address (Full)'));
        let fullipvalue = document.createElement('td');
        fullipvalue.appendChild(document.createTextNode(divideIpBlock(ipblock)));
        fullipvalue.setAttribute('id', 'fullip');

        row = document.createElement('tr');
        row.appendChild(fulliptxt);
        row.appendChild(fullipvalue);

        table2.appendChild(row);

        //integer id
        let integeridtxt = document.createElement('td');
        integeridtxt.appendChild(document.createTextNode('Integer ID'));
        let integeridvalue = document.createElement('td');
        integeridvalue.appendChild(document.createTextNode(new BigNumber(createBinaryString(createBinaryArray(ipblock)), 2).toFixed(0)));
        integeridvalue.setAttribute('id', 'integerid');

        row = document.createElement('tr');
        row.appendChild(integeridtxt);
        row.appendChild(integeridvalue);

        table2.appendChild(row);

        //hexadecimal id
        let hexadecimaltxt = document.createElement('td');
        hexadecimaltxt.appendChild(document.createTextNode('Hexadecimal ID'));
        let hexadecimalvalue = document.createElement('td');
        hexadecimalvalue.appendChild(document.createTextNode(createHexadecimalId(ipblock)));
        hexadecimalvalue.setAttribute('id', 'hexadecimalid');

        row = document.createElement('tr');
        row.appendChild(hexadecimaltxt);
        row.appendChild(hexadecimalvalue);

        table2.appendChild(row);

        //dot decimal id
        let dotdecimaltxt = document.createElement('td');
        dotdecimaltxt.appendChild(document.createTextNode('Dotted decimal ID'));
        let dotdecimalvalue = document.createElement('td');
        dotdecimalvalue.appendChild(document.createTextNode(createDotDecimalId(ipblock)));
        dotdecimalvalue.setAttribute('id', 'dotdecimalid');

        row = document.createElement('tr');
        row.appendChild(dotdecimaltxt);
        row.appendChild(dotdecimalvalue);

        table2.appendChild(row);

        //binary id
        let binaryidtxt = document.createElement('td');
        binaryidtxt.appendChild(document.createTextNode('Binary ID'));
        let binaryidvalue = document.createElement('td');
        binaryidvalue.appendChild(document.createTextNode(createBinaryString(createBinaryArray(ipblock))));
        binaryidvalue.setAttribute('id', 'binaryid');

        row = document.createElement('tr');
        row.appendChild(binaryidtxt);
        row.appendChild(binaryidvalue);

        table2.appendChild(row);

        contentdiv.appendChild(table2);

        //subnet level
        contentdiv.appendChild(document.createElement('br'));
        contentdiv.appendChild(document.createElement('h3').appendChild(document.createTextNode('subnet level 1')));
        contentdiv.appendChild(document.createElement('br'));
        contentdiv.appendChild(document.createElement('br'));

        createSubnetArea(ipblock, prefixlength)
    }
}

function createSubnetArea(ipblock, prefixlength) {

    if (document.getElementById('subnetarea')) {
        document.body.removeChild(document.getElementById('subnetarea'));
    }

    let subnetarea = document.createElement('div');
    subnetarea.setAttribute('id', 'subnetarea');
    document.body.appendChild(subnetarea);

    for (i = 1; i < 64 && Number.parseInt(prefixlength) + i <= 128; i++) {

        let newsubnet = Number.parseInt(prefixlength) + i;

        let link = document.createElement('a');
        link.href = "javascript:void(0)";
        link.setAttribute("originalsubnet", prefixlength);
        link.setAttribute("newsubnet", newsubnet)
        link.onclick = () => {
            let originalsubnet = link.getAttribute("originalsubnet");
            let newsubnet = link.getAttribute("newsubnet");
            createSubnetAreaControl(ipblock, originalsubnet, newsubnet);
        }

        if (newsubnet < 64) {
            link.appendChild(document.createTextNode(`${new BigNumber(2).pow(i).toFormat()} networks /${newsubnet} (${new BigNumber(2).pow(64 - (newsubnet)).toFormat()} networks /64)`))
        } else {
            link.appendChild(document.createTextNode(`${new BigNumber(2).pow(i).toFormat()} networks /${newsubnet} (${new BigNumber(2).pow(128 - (newsubnet)).toFormat()} addresses)`))
        }

        subnetarea.appendChild(link);
        subnetarea.appendChild(document.createElement('br'));
    }
}

function createSubnetAreaControl(ipblock, originalsubnet, newsubnet) {

    if (document.getElementById('subnetarea')) {
        document.body.removeChild(document.getElementById('subnetarea'));
    }

    let subnetarea = document.createElement('div');
    subnetarea.setAttribute('id', 'subnetarea');
    document.body.appendChild(subnetarea);

    subnetarea.appendChild(document.createElement('h1').appendChild(document.createTextNode(`Orignal network`)));
    subnetarea.appendChild(document.createElement('br'));
    subnetarea.appendChild(document.createElement('p').appendChild(document.createTextNode(`${divideIpBlock(ipblock)} /${originalsubnet}`)));
    subnetarea.appendChild(document.createElement('br'));
    subnetarea.appendChild(document.createElement('br'));
    subnetarea.appendChild(document.createElement('p').appendChild(document.createTextNode(`subnet level 1 ที่ ${newsubnet} bits (แรกสุดและท้ายสุด)`)));
    let firstandlastsubnet = calculateSubnetting(ipblock, originalsubnet, newsubnet);
    subnetarea.appendChild(document.createElement('br'));
    subnetarea.appendChild(document.createElement('p').appendChild(document.createTextNode(`first network: ${firstandlastsubnet.firstnetwork}/${newsubnet}`)));
    subnetarea.appendChild(document.createElement('br'));
    subnetarea.appendChild(document.createElement('p').appendChild(document.createTextNode(`last network: ${firstandlastsubnet.lastnetwork}/${newsubnet}`)));

    //let show512button = document.createElement('button');
    //show512button.appendChild(document.createTextNode('โชว์ 512 network แรก'))

    //subnetarea.appendChild(show512button);


}

function clearError() {
    if (document.getElementById('error-text')) {
        document.body.removeChild(document.getElementById("error-text"));
    }
}

function createError() {
    if (document.getElementById('content')) {
        document.body.removeChild(document.getElementById('content'));
    }
    if (!document.getElementById('error-text')) {
        var error = document.createElement('p')
        error.style.color = "red";
        error.id = "error-text";

        var text = document.createTextNode("IP ไม่ถูกต้อง โปรดตรวจสอบ IP ที่ป้อน")
        error.appendChild(text);

        document.body.appendChild(error);
    }
}

function fillZeroInBinaryArray(array) {
    //build zero
    array.map((block) => {
        let zeroline = ""
        while (zeroline.length < 16 - block.length) {
            zeroline += "0";
        }
        array[array.indexOf(block)] = zeroline + block;
    });
    //console.log(array);
    return array;
}

function getNetworkString(ipblock) {
    const ipdata = calculateNetwork(ipblock);

    //make network string

    let returnstring = "";
    for (i = 0; i < ipdata.binaryblock.length; i++) {
        if (i === ipdata.blockindex && ipdata.binaryblock[i] == "0000000000000000") {
            returnstring.charAt(returnstring.length - 1) === ":" ? returnstring += ":" : returnstring += "::";
            break;
        } else if (i === ipdata.blockindex) {
            returnstring += Number.parseInt(ipdata.binaryblock[i], 2).toString(16) + "::";
            break;
        }
        else if (i === ipdata.binaryblock.length - 1) {
            returnstring += Number.parseInt(ipdata.binaryblock[i], 2).toString(16);
        } else {
            if (ipdata.binaryblock[i] == "0000000000000000") {
                returnstring += "0:";
            } else {
                returnstring += Number.parseInt(ipdata.binaryblock[i], 2).toString(16) + ":";
            }
        }
    }

    return returnstring;
}

function createBinaryArray(ipblock) {
    let binaryarr = [];

    ipblock.map((block) => {
        binaryarr.push(Number.parseInt(block, 16).toString(2));
    });
    return fillZeroInBinaryArray(binaryarr);
}

function createBinaryString(binaryarray) {
    let returnstring = "";
    binaryarray.map((block) => {
        returnstring += block;
    })

    return returnstring;
}


function calculateNetwork(ipblock) {
    //console.log(ipblock);
    let newblockbinary = createBinaryArray(ipblock)
    console.log(newblockbinary);
    //console.log(newipblock);
    const prefixlength = document.getElementById('prefix-dropdown').value
    //console.log(prefixlength)
    let blockindex;
    prefixlength == 128 ? 7 : blockindex = Number.parseInt(prefixlength / 16);
    const blockradix = prefixlength % 16;
    console.log(blockradix);

    console.log(blockindex)
    //fill block with zero
    let newstring = "";
    if (blockindex > 0) {
        if (blockindex === 8) {
            newstring = newblockbinary[blockindex - 1].slice(0, blockradix);
        } else {
            newstring = newblockbinary[blockindex].slice(0, blockradix);
        }

    } else {
        newstring = newblockbinary[0].slice(0, blockradix);
    }
    //console.log(newstring);
    for (i = blockradix + 1; i <= 16; i++) {
        newstring += "0";
    }
    //console.log(newstring);
    newblockbinary[blockindex] = newstring;

    //fill everybit behind prefix with zero
    for (i = blockindex + 1; i < ipblock.length; i++) {
        newblockbinary[i] = "0000000000000000";
    }

    const returnjson = {
        binaryblock: newblockbinary,
        blockindex: blockindex,
        blockradix: blockradix
    }
    return returnjson;
}

function calculateNetworkRange(ipblock) {
    const minrangedata = calculateNetwork(ipblock);
    //console.log(minrangedata);
    const binaryarray = minrangedata.binaryblock;
    const blockindex = minrangedata.blockindex;
    const blockradix = minrangedata.blockradix;

    //create max network range
    let newstring = binaryarray[blockindex].slice(0, blockradix);
    for (i = blockradix; i < binaryarray[blockindex].length; i++) {
        newstring = newstring + "1";
    }
    //console.log(newstring);


    //build string
    let minrangebinaryarr = [];

    for (i = 0; i < binaryarray.length; i++) {
        minrangebinaryarr[i] = Number.parseInt(binaryarray[i], 2).toString(16);
    }

    console.log(minrangebinaryarr)

    let maxrangebinaryarr = minrangebinaryarr.slice(0);

    for (i = blockindex; i < maxrangebinaryarr.length; i++) {
        if (i == blockindex) {
            maxrangebinaryarr[i] = Number.parseInt(newstring, 2).toString(16);
        } else {
            maxrangebinaryarr[i] = "ffff";
        }
    }

    console.log(maxrangebinaryarr)

    let returndata = {
        minlength: minrangebinaryarr,
        maxlength: maxrangebinaryarr
    }

    //console.log(returndata)
    return returndata;
}

function divideIpBlock(ipblock) {

    let returnstring = "";
    for (i = 0; i < ipblock.length; i++) {
        if (i == ipblock.length - 1) {
            returnstring += ipblock[i];
        } else {
            returnstring += ipblock[i] + ":";
        }
    }

    //console.log(returnstring)

    return returnstring;
}

function createHexadecimalId(ipblock) {
    let returnstring = "0x";

    ipblock.map((block) => {
        returnstring += block;
    })

    return returnstring;
}

function createDotDecimalId(ipblock) {
    let binaryarr = createBinaryArray(ipblock);

    let returnstring = ""
    for (i = 0; i < ipblock.length; i++) {
        let dotdecimalblock = "";
        if (i == 0) {
            dotdecimalblock += Number.parseInt(binaryarr[i].slice(0, 8), 2);
            dotdecimalblock += ".";
            dotdecimalblock += Number.parseInt(binaryarr[i].slice(9, 16), 2);
        } else {
            dotdecimalblock += "."
            dotdecimalblock += Number.parseInt(binaryarr[i].slice(0, 8), 2);
            dotdecimalblock += ".";
            dotdecimalblock += Number.parseInt(binaryarr[i].slice(9, 16), 2);
        }
        returnstring += dotdecimalblock;
    }
    return returnstring
}

function createBinaryArrayUsingString(binarystring) {
    let binaryarr = [];

    for (i = 1; i <= 8; i++) {
        binaryarr.push(binarystring.slice((i - 1) * 16, i * 16))
    }

    return binaryarr;
}

function convertBinaryIntoHexadecimal(binaryarray) {
    let ipblock = [];

    binaryarray.map((block) => {
        ipblock.push(Number.parseInt(block, 2).toString(16));
    })

    return ipblock;
}

function fillZeroInIpBlock(ipblock) {
    let newarr = [];
    ipblock.map((block) => {
        if (block.length < 4) {
            let newblock = block;
            //console.log(newblock.length);
            while (newblock.length < 4) {
                newblock = "0" + newblock;
            }
            newarr.push(newblock);
        } else { newarr.push(block); }
    })

    return newarr;
}

function calculateSubnetting(ipblock, originalsubnet, newsubnet) {
    let ipbinary = createBinaryString(createBinaryArray(ipblock));

    //console.log(ipbinary)

    //console.log(originalsubnet)
    //console.log(newsubnet)
    let slice = ipbinary.slice(0, Number.parseInt(originalsubnet));
    //console.log(slice);

    let newstring = "";
    for (i = Number.parseInt(originalsubnet); i < ipbinary.length; i++) {
        newstring += 0;
    }

    //console.log(slice + newstring);

    let firstnetwork = divideIpBlock(fillZeroInIpBlock(convertBinaryIntoHexadecimal(createBinaryArrayUsingString(slice + newstring))));

    let lastnetworkstring = "";
    for (i = Number.parseInt(originalsubnet); i < ipbinary.length; i++) {
        if (i >= Number.parseInt(originalsubnet) && i < Number.parseInt(newsubnet)) {
            lastnetworkstring += 1;
        } else {
            lastnetworkstring += 0;
        }
    }

    let lastnetwork = divideIpBlock(fillZeroInIpBlock(convertBinaryIntoHexadecimal(createBinaryArrayUsingString(slice + lastnetworkstring))));

    return {
        "firstnetwork": firstnetwork,
        "lastnetwork": lastnetwork
    }

}

setupPage();