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
                makeCorsRequest();
            } catch (err) {
                console.log(err);
            }
        });
    }
};
// Create the XHR object.
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
}
// Make the actual CORS request.
function makeCorsRequest() {
    // This is a sample server that supports CORS.
    var url = 'http://localhost:9001/uploadImg';

    var xhr = createCORSRequest('POST', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }
    xhr.setRequestHeader("Content-Type", "image/jpeg");
    // Response handlers.
    xhr.onload = function () {
        var text = xhr.responseText;
        var title = text;
        alert('Response from CORS request to ' + url + ': ' + title);
    };

    xhr.onerror = function () {
        alert('Woops, there was an error making the request.');
    };
    var pic = document.querySelector('#pic').files;
    console.log(document.querySelector('#pic'));
    console.log(pic[0]);
    if (!pic) {
        alert('必须上传图片！');
        return;
    }
    xhr.send(pic[0]);
}
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#blah')
                .attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}
$(function () {
    $(window).load(function () {
        App.init();
    });
});