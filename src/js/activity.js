App = {
  web3Provider: null,
  latestCFund: null,
  contracts: {},
  stateMap: {},
  stateMap: {
    0: '未激活',
    1: '进行中',
    2: '待开奖',
    3: '待领奖',
    9: '已结束'
  },
  init: () => {
    return App.initWeb3();
  },

  initWeb3: function () {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      console.log("has injected web3 instance");
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: async function () {
    await $.getJSON('Management.json', data => {
      var ManageArtifact = data;
      App.contracts.Management = TruffleContract(ManageArtifact);

      // Set the provider for our contract
      App.contracts.Management.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
    });
    await $.getJSON('CFund.json', data => {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var CFundArtifact = data;
      App.contracts.CFund = TruffleContract(CFundArtifact);

      // Set the provider for our contract
      App.contracts.CFund.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
    });
    return App.changeUI();
  },

  changeUI: () => {
    web3.eth.getAccounts(async (err, accounts) => {
      if (err) { console.log(err); }
      var account = accounts[0];
      var manageInstance = await App.contracts.Management.deployed();
      var latestCFund = await manageInstance.latestCFund.call();

      var itemList = $('.KittiesGrid');
      var itemTemplate = $('#itemTemplate');
      for (var i = 0; i < 12 && latestCFund != 0x0000000000000000000000000000000000000000; i++) {
        console.log(latestCFund);
        var cFundInstance = await App.contracts.CFund.at(latestCFund);
        var cFundInfo = await cFundInstance.info.call();
        itemTemplate.find('.KittyCard-image').attr("src", `images/goods${i % 3 + 1}.jpg`);
        itemTemplate.find('.KittyCard-details span:nth-child(1)').text("合约地址：" + latestCFund);
        itemTemplate.find('.KittyCard-details span:nth-child(2)').html("商品描述：" + cFundInfo[4]);
        itemTemplate.find('.KittyCard-details span:nth-child(3)').text("合约状态：" + App.stateMap[cFundInfo[3]]);
        itemTemplate.find('.KittyCard-details span:nth-child(4)').text("人数：" + cFundInfo[2] + "/" + cFundInfo[1]);
        itemTemplate.find('.KittyStatus-note').text(cFundInfo[0]);

        itemList.append(itemTemplate.html());

        latestCFund = cFundInfo[8];
      }
      App.latestCFund = latestCFund;


      // while (latestCFund != 0x0000000000000000000000000000000000000000) {
      //   var cFundInstance = await App.contracts.CFund.at(latestCFund);
      //   var cFundInfo = await cFundInstance.info.call();

      //   var activateCtrl = (cFundInfo[3] == 0 && cFundInfo[5] == account) ? '' : ' disabled="true" data-toggle="tooltip" data-placement="top" title="合约已激活或您不是该合约的商家！"';
      //   var joinCtrl = cFundInfo[3] == 1 ? '' : ' disabled="true"';
      //   var buttonString = '<td><div class="btn-group" role="group" aria-label="...">' +
      //     '<button type="button" class="btn btn-success btn-detail" data-toggle="modal" data-target="#detailModal">查看详情</button>' +
      //     '<button type="button" class="btn btn-warning btn-activate"' + activateCtrl + '>激活</button>' +
      //     '<button type="button" class="btn btn-danger btn-join"' + joinCtrl + '>参加</button></div></td>';
      //   var appendString = '<tr><td>' + latestCFund + '</td><td>' + cFundInfo[0] +
      //     '</td><td>' + cFundInfo[2] + '/' + cFundInfo[1] + '</td><td>' +
      //     cFundInfo[5] + '</td><td>' + App.stateMap[cFundInfo[3]] + '</td>' + buttonString + '</tr>';
      //   cFundTable.append(appendString);

      //   latestCFund = cFundInfo[8];
      // }
    });
  },

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});

function detail(event) {
  web3.eth.getAccounts(async (err, accounts) => {
    if (err) { console.log(err); }
    var account = accounts[0];

    var clickTarget = $(event);
    var cFundAddress = clickTarget.find('.KittyCard-details span:nth-child(1)').text().split('：')[1];
    console.log("点击的合约地址为：", cFundAddress);
    var cFundInstance = await App.contracts.CFund.at(cFundAddress);
    var cFundInfo = await cFundInstance.info.call();
    //合约地址
    $('#addon1').val(cFundAddress);
    //商家地址
    $('#addon2').val(cFundInfo[5]);
    //合约状态
    $('#addon3').val(App.stateMap[cFundInfo[3]]);
    //参与费用
    $('#addon4').val(cFundInfo[0]);
    //参加人数
    $('#addon5').val(cFundInfo[2]);
    //最大人数
    $('#addon6').val(cFundInfo[1]);
    //商家定金
    $('#addon7').val(cFundInfo[6]);
    //商品描述
    $('#addon8').val(cFundInfo[4]);
    //赢家地址
    $('#addon9').val(cFundInfo[7] == 0x0000000000000000000000000000000000000000 ? '还未产生' : cFundInfo[7]);
    //赢家联系方式
    $('#addon10').val(cFundInfo[10]);

    //测试用展示
    var secretNumHash = await cFundInstance.getSecretNumHash(account);
    $('#addon12').val(secretNumHash);
    var secretNum = await cFundInstance.getSecretNum(account);
    $('#addon13').val(secretNum);

    console.log('合约地址', cFundAddress, '商家地址', cFundInfo[5], '参加人数', cFundInfo[2], '最大人数', cFundInfo[1], '参与费用', cFundInfo[0], '合约状态', App.stateMap[cFundInfo[3]], '商品描述', cFundInfo[4]);
    console.log('debug随机数：', cFundInfo[12]);
    $(".Modal").attr("style", "display:block");
  })
}
function activate() {
  web3.eth.getAccounts(async (err, accounts) => {
    if (err) { console.log(err); }
    var account = accounts[0];
    var cFundAddress = $('#addon1').val();
    var insureFee = $('#addon7').val();

    var cFundInstance = await App.contracts.CFund.at(cFundAddress);
    var activateResult = await cFundInstance.activate({ from: account, value: insureFee });
    console.log("activateResult:", activateResult);
    window.location.reload();
  })
}
function join() {
  web3.eth.getAccounts(async (err, accounts) => {
    if (err) { console.log(err); }
    var account = accounts[0];
    var cFundAddress = $('#addon1').val();
    var joinFee = $('#addon4').val();
    var ensureFee = $('#addon7').val();
    var secretNum = leftPadding($('#addon11').val());
    console.log("封装过的秘密数字：", secretNum);
    var secretNumHash = web3.sha3(secretNum, {encoding: 'hex'});
    console.log("秘密数字的hash值为:", secretNumHash);

    var cFundInstance = await App.contracts.CFund.at(cFundAddress);
    var joinResult = await cFundInstance.join(secretNumHash, { from: account, value: web3.toBigNumber(joinFee).plus(web3.toBigNumber(ensureFee)) });
    console.log("joinResult:", joinResult);
    window.location.reload();
  })
}
function revealNum() {
  web3.eth.getAccounts(async (err, accounts) => {
    if (err) { console.log(err); }
    var account = accounts[0];
    var cFundAddress = $('#addon1').val();

    var secretNum = leftPadding($('#addon11').val());
    console.log("封装过的秘密数字：", secretNum);

    var cFundInstance = await App.contracts.CFund.at(cFundAddress);
    var revealNumResult = await cFundInstance.revealNum(secretNum, { from: account });
    console.log("revealNumResult:", revealNumResult);
    window.location.reload();
  })
}
function generateWinner() {
  web3.eth.getAccounts(async (err, accounts) => {
    if (err) { console.log(err); }
    var account = accounts[0];
    var cFundAddress = $('#addon1').val();

    var cFundInstance = await App.contracts.CFund.at(cFundAddress);
    var genWinResult = await cFundInstance.generateWinner({ from: account });
    console.log("genWinResult:", genWinResult);
    window.location.reload();
  })
}
function setPhone() {

}
function receipt() {
  web3.eth.getAccounts(async (err, accounts) => {
    if (err) { console.log(err); }
    var account = accounts[0];
    var cFundAddress = $('#addon1').val();

    var cFundInstance = await App.contracts.CFund.at(cFundAddress);
    var genWinResult = await cFundInstance.generateWinner({ from: account });
    console.log("genWinResult:", genWinResult);
    window.location.reload();
  })
}

function leftPadding(number) {
  number = number.toString();
  if (number.length > 64) alert("秘密数字长度不能超过64");
  else return '0x' + '0'.repeat(64 - number.length) + number;
}

function closeModal() {
  $('.Modal').attr("style", "display:none");
}