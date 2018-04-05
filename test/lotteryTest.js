var CFund = artifacts.require("CFund");
var Manage = artifacts.require("Manage");

//var sleep = require('sleep');

contract('CFund', accounts => {

  it("主流程", async function () {
    var acc1 = accounts[0]; //0x627306090abaB3A6e1400e9345bC60c78a8BEf57
    var acc2 = accounts[1]; //0xf17f52151EbEF6C7334FAD080c5704D77216b732
    var acc3 = accounts[2]; //0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef
    var sponsor = accounts[10];
    var cfund = await CFund.deployed();
    //var manage = await Another.deployed();
    var joinEvent = cfund.Join(function (error, result) {
      console.log("joinEvent is as following:-------");
      console.log(JSON.stringify(result));
      console.log("joinEvent ending-------");
    });
    var blockNum = await cfund.getBlockNumber.call();
    var owner = await cfund.owner.call();
    var info = await cfund.info.call();
    info[0] = info[0].toNumber(); info[1] = info[1].toNumber(); info[2] = info[2].toNumber();
    console.log("CFund部署于blockNumber:", blockNum.toNumber(), '\n合约所有者:', owner, '\n合约信息:', info);

    console.log("正在参加……………………");
    await cfund.join({ from: acc1 });
    await cfund.join({ from: acc2, value: 10000 });
    await cfund.join({ from: acc3, value: 10000 });
    //sleep.sleep(6);


    var joiners = await cfund.getJoiners.call();
    console.log("参与者有：", joiners);

    info = await cfund.info.call();
    info[0] = info[0].toNumber(); info[1] = info[1].toNumber(); info[2] = info[2].toNumber();
    console.log('合约信息(新):', info);
    var winner = await cfund.getWinner.call();
    console.log("acc1:", '0x627306090abaB3A6e1400e9345bC60c78a8BEf57');
    console.log("acc2:", '0xf17f52151EbEF6C7334FAD080c5704D77216b732');
    console.log("acc3:", '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef');
    console.log("winnner:", winner);
    assert.equal(true, true, "true is true");

    // //how to send ether
    // // instance.sendTransaction({...}).then(function(result) {
    // //   // Same transaction result object as above.
    // // });
    // // instance.send(web3.toWei(1, "ether")).then(function(result) {
    // //   // Same result object as above.
    // // });
    joinEvent.stopWatching();
  });
});

//how to add new contract instance
//var newInstance = await ContractName.new();
//newInstance.address