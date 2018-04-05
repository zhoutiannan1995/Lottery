pragma solidity ^0.4.17;

import "./CFund.sol";
contract Management {
    address public owner;
    address public latestCFund;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function Management() public payable {
        owner = msg.sender;
    }

    function() public payable { }

    /********************
     * Functions for owner to manage
     ********************/
    function addOneCFund(address _sponsor, uint _fee, uint _maxNum, uint deposit, string _description) public onlyOwner returns (address) {
        address newCFund = new CFund(_sponsor, _fee, _maxNum, deposit, _description, latestCFund);
        concatLastCFund(newCFund);
        latestCFund = newCFund;
        return latestCFund;
    }

    function concatLastCFund(address _newCFund) internal returns (bool) {
        return latestCFund.call.gas(3000000)(bytes4(keccak256("setNext(address)")), _newCFund);
    }
}