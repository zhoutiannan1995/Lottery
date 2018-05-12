App = {
    web3Provider: null,
    contracts: {},

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
        App.bindEvents();
    },

    bindEvents: () => {
        $(document).on('click', '.btn-create', App.create);
    },
    create: (event) => {
        event.preventDefault();
        web3.eth.getAccounts(async (err, accounts) => {
            try {
                if (err) { console.log(err); }
                var account = accounts[0];
                var manageInstance = await App.contracts.Management.deployed();
                console.log($('#address').val(), $('#fee').val(), $('#maxNum').val(), $('#deposit').val(), $('#description').val());
                await manageInstance.addOneCFund($('#address').val(), $('#fee').val(), $('#maxNum').val(), $('#deposit').val(), $('#description').val(), { from: account });
                var newCFundAddress = await manageInstance.latestCFund.call();
                console.log("新创建的CFund地址为：", newCFundAddress);
                alert("新创建的CFund地址为：" + newCFundAddress);
                //makeCorsRequest();
                $("#uploadForm").find('.Section').append('<input type="text" name="text" id="addr"/>');
                $("#addr").attr("value", newCFundAddress);
                $("#addr").remove();
                doUpload();
            } catch (err) {
                console.log(err);
            }
        });
    }
};

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#blah')
                .attr('src', e.target.result);
            console.log(e.target.result);
            console.log("imageHash:",web3.sha3(e.target.result));
        };

        reader.readAsDataURL(input.files[0]);
    }
}

function doUpload() {
    var formData = new FormData($("#uploadForm")[0]);  
    console.log(formData);
    $.ajax({  
        url: 'http://localhost:9001/uploadImg',
        type: 'POST',  
        data: formData,  
        cache: false,  
        contentType: false,  
        processData: false,  
        success: function (returndata) {  
            console.log(returndata);  
        },
        error: function (returndata) {  
            console.log(returndata);  
        }
    });  
}

$(function () {
    $(window).on('load', function () {
        App.init();
    });
});