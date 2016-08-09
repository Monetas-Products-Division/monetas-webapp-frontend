(function() {
    'use strict';

    angular
    .module('app.scan')
    .controller('ScanController', ScanController);

    ScanController.$inject = ['$state', '$cordovaBarcodeScanner', 'TransferService', 'ContactsService'];

    /* @ngInject */
    function ScanController($state, $cordovaBarcodeScanner, TransferService, ContactsService) {
        var vm = this;
        vm.payment = {};
        vm.AddSenderToContact = AddSenderToContact;
        activate();
        scanBarcode();
        ////////////////
        function activate() {
        }

        function scanBarcode() {
            if (!window.cordova) return false;

            $cordovaBarcodeScanner.scan().then(function(imageData) {
                parseBill(imageData.text);
                console.log("Barcode Format -> " + imageData.format);
                console.log("Cancelled -> " + imageData.cancelled);
            }, function(error) {
                console.log("An error happened -> " + error);
            });
        };

        function parseBill(req) {
            /* 
              goatd://pay?req=base64(jsonObject)
              jsonObject = {
                  amount: 120,
                  unit: ...,
                  descr: ...,
                  contact: ...
              }
            */
            console.log(req);
            console.log(atob(parseUrlQueryParams(req).req));
            vm.paymentId = atob(parseUrlQueryParams(req).req);
            showPaymentDetails(vm.paymentId);
        }

        function showPaymentDetails(id) {
            TransferService.getById(id, function(data) {
                console.log(data);
                vm.payment = data.result;
                // check if sender exists in contact list
                ContactsService.getById(vm.payment.sender._id, function(contact) {
                    console.log(contact);
                    if (!contact.result) {
                        vm.isNewContact = true;
                    };
                });             
            });
        };

        function AddSenderToContact() {
            console.log(vm.payment.sender);
            ContactsService.add({user:vm.payment.sender._id}, function(contact) {
                console.log(contact);
                vm.isNewContact = false;
            });             
        };

        function parseUrlQueryParams(uri) {
            if (!uri) return false;

            var params = {};
            new URL(uri)
            .search
            .replace(/^.*\?/, '')
            .split('&').forEach(function(item) {
                var n = item.split('='); 
                params[n[0]] = n[1];
            });

            return params;
        }
    }
})();
