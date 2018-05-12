pragma solidity ^0.4.17;

contract CFund {
    event Join(address joiner);

    struct JoinersNum {
        bool isIn;
        bool isReveal;
        uint secretNum;
        bytes32 secretNumHash;
    }
    struct CFundInfo {
        uint fee;
        uint maxNum;
        uint joinedNum;
        uint8 contractState;
        string description; //0-未激活,1-正在进行,2-待揭示,3-待领奖,8-已实效,9-已结束
        address sponsor;
        uint deposit;
        address winner;
        address lastCFund;
        address nextCFund;
        string winnerPhone;
        uint revealNum;
        uint randomNum;
        //bytes32 imageHash;
        //uint startDate;
        //uint endDate;
        //uint revealEndDate;
        mapping (address => JoinersNum) joiners;
        address[] joinerArr;
    }
    address public owner;
    CFundInfo public info;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    modifier onlySponsor() {
        require(msg.sender == info.sponsor);
        _;
    }
    modifier onlyWinner() {
        require(msg.sender == info.winner);
        _;
    }

    function CFund(address _sponsor, uint _fee, uint _maxNum, uint _deposit, string _description, address _lastCFund) public payable {
        owner = msg.sender;
        info.sponsor = _sponsor;
        info.fee = _fee;
        info.maxNum = _maxNum;
        info.deposit = _deposit;
        info.description = _description;
        info.lastCFund = _lastCFund;
        //info.startDate = _startDate;
        //info.endDate = _endDate;
        info.contractState = 0;
    }

    function() public payable { }

    /********************
    * Functions to operate contract
    ********************/
    //发起人缴纳保证金并激活合约
    function activate() public payable onlySponsor() {
        require(info.contractState == 0);
        require(msg.value == info.deposit);

        info.contractState = 1;
    }
    //参与者参加众筹,需提供一个数字的hash值
    function join(bytes32 _secretNumHash) public payable {
        require(info.contractState == 1);
        require(info.joiners[msg.sender].isIn == false);
        require(info.joinedNum < info.maxNum);
        require(msg.value == info.fee + info.deposit);

        info.joiners[msg.sender].isIn = true;
        info.joiners[msg.sender].secretNumHash = _secretNumHash;
        info.joinerArr.push(msg.sender);
        info.joinedNum++;
        if (info.joinedNum == info.maxNum) {
            info.contractState = 2;
        }
    }
    //参与者揭示自己的数字,合约返还保证金
    function revealNum(bytes32 _secretNum) public {
        require(info.contractState == 2);
        require(info.joiners[msg.sender].isReveal == false);
        require(keccak256(_secretNum) == info.joiners[msg.sender].secretNumHash);
        info.joiners[msg.sender].isReveal = true;
        info.joiners[msg.sender].secretNum = uint(_secretNum);
        info.revealNum++;
        info.randomNum = info.randomNum ^ uint(_secretNum);
        msg.sender.transfer(info.deposit);
        if (info.revealNum == info.joinedNum) {
            generateWinner();
        }
    }
    //待所有参与者揭示自己的数字后，产生赢家
    function generateWinner() internal {
        require(info.contractState == 2);
        info.winner = info.joinerArr[info.randomNum % info.joinedNum];
        info.contractState = 3;
    }
    //赢家上传自己的联系地址（加密）
    function setPhone(string _phone) public onlyWinner {
        info.winnerPhone = _phone;
    }
    //赢家签收货物，返还保证金
    function receipt() public onlyWinner {
        info.contractState = 9;
        info.sponsor.transfer(info.deposit);
    }
    //规定日期内人数不满，商家可终止合约
    function cancel() public onlySponsor {
        info.contractState = 8;
    }
    //规定日期内揭示秘密数字人数不满，可作废合约
    function repeal() public {
        info.contractState = 8;
    }
    //设置下一场
    function setNext(address _nextCFund) external onlyOwner {
        info.nextCFund = _nextCFund;
    }

    /********************
    * Functions to get info
    ********************/
    //获取复杂信息
    function getComplexInfo() public view returns (address[] joiners) {
        joiners = getJoiners();
    }
    //获取参与者
    function getJoiners() internal view returns (address[] memory j) {
        j = new address[](info.joinedNum);
        for (uint i = 0; i < info.joinedNum; i++) {
            j[i] = info.joinerArr[i];
        }
    }
    //获取某人的秘密数字
    function getSecretNum(address _joiner) public view returns (uint) {
        return info.joiners[_joiner].secretNum;
    }
    //获取某人的秘密数字哈希值
    function getSecretNumHash(address _joiner) public view returns (bytes32) {
        return info.joiners[_joiner].secretNumHash;
    }
    //是否参加
    function isIn(address _joiner) public view returns (bool) {
        return info.joiners[_joiner].isIn;
    }
    //合约余额
    function getBalance() public view returns (uint moment) {
        return this.balance;
    }
}