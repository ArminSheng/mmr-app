angular.module('mmr.services')

.factory('mmrAddressService', ['$q', '$http', '$timeout', 'restService', '$rootScope', 'Validator', 'mmrDataService', 'apiService',
  function($q, $http, $timeout, restService, $rootScope, Validator, mmrDataService, apiService) {

  var generateAddressVo = function(address) {
    var vo = {};

    if(address.id) {
      vo.id = address.id;
    }
    vo.uid = $rootScope.$root.pinfo.uid;
    vo.consignee = address.receiver;
    vo.address = address.street;
    vo.telphone = address.phoneArea + '-' + address.phone;
    vo.mobile = address.cellphone;
    vo.is_default = address.isDefault ? 1 : 0;
    vo.city = address.city.id;
    vo.area = address.area.id;

    return vo;
  };

  var postprocess = function(addresses) {
    _.forEach(addresses, function(address) {
      // split the phone into phoneArea-phone
      if(address.phone.indexOf('-') > 0) {
        var parts = _.split(address.phone, '-');
        address.phoneArea = parts[0];
        address.phone = parts[1];
      }

      // restore the province object
      address.province = $rootScope.$root.geo.flattenAll[address.city.parend_id];

      // restore isDefault to boolean value
      address.isDefault = address.isDefault === '0' ? false : true;

      // remove the possible '市辖区' and '县' in the summary
      // TODO
    });
  };

  return {

    defaultAddresses: function() {
      var dfd = $q.defer();

      if($rootScope.$root.addresses.length === 0) {
        // load the addresses
        this.fetchAddressList().then(function(res) {
          dfd.resolve(resolveCore(res));
        }, function(err) {
          dfd.reject(err);
        });
      } else {
        dfd.resolve(resolveCore($rootScope.$root.addresses));
      }

      return dfd.promise;

      function resolveCore(addresses) {
        var normalAddress = _.find(addresses, function(address) {
          return address.isDefault;
        });
        var receiptAddress = normalAddress;

        return {
          normal: normalAddress,
          receipt: receiptAddress,
          quarantine: {}
        };
      }
    },

    generateAddressCheckboxes: function(currentAddress) {
      return _.map($rootScope.$root.addresses, function(address) {
        return address.id === currentAddress.id;
      });
    },

    validateAddress: function(address) {
      // receiver
      if(!Validator.field(address.receiver, '收货人')) {
        return false;
      }

      // phone
      if(!Validator.phone(address.cellphone, true)) {
        return false;
      }

      // fixed phone
      if(!Validator.fixedPhone(address.phoneArea + '-' + address.phone, true)) {
        return false;
      }

      // city and area
      if(!Validator.field(address.city, '城市')) {
        return false;
      }

      if(!Validator.field(address.area, '地区')) {
        return false;
      }

      // street
      if(!Validator.field(address.street, '街道地址')) {
        return false;
      }

      return true;
    },

    generateAddressSummary: function(address) {
      if(address.summary) {
        return address.summary;
      }

      var summary = '';
      if(address.province) {
        summary += address.province.name;
      } else {
        summary += $rootScope.$root.geo.flattenAll[address.city.parend_id].name;
      }

      summary += address.city.name;
      summary += address.area.name;
      summary += address.street;

      return summary;
    },

    // API below
    fetchAddressList: function() {
      var dfd = $q.defer();

      mmrDataService.request($http({
        url: apiService.ADDRESS_LIST,
        method: 'POST',
        data: {
          uid: $rootScope.$root.pinfo.uid
        }
      })).then(function(res) {
        res = res[0];

        if(res instanceof Array) {
          postprocess(res);
          $rootScope.$root.addresses = res;
        } else {
          res = [];
        }

        dfd.resolve(res);
      }, function(err) {
        dfd.reject(err);
      });

      return dfd.promise;
    },

    createAddress: function(address) {
      var dfd = $q.defer(),
          self = this;

      // check whether the currently creating address is the only one
      if($rootScope.$root.addresses.length === 0) {
        address.isDefault = true;
      }

      mmrDataService.request($http({
        url: apiService.ADDRESS_ADD,
        method: 'POST',
        data: generateAddressVo(address)
      })).then(function(res) {
        res = res[0];
        if(res.status === 1 && res.msg === '操作成功') {
          address.id = res.data.id;
          if(address.isDefault) {
            _.forEach($rootScope.$root.addresses, function(address) {
              if(address.isDefault) {
                address.isDefault = false;

                // emit the update request
                self.updateAddress(address);
              }
            });
          }

          $rootScope.$root.addresses.push(address);

          // provide the summary field
          address.summary = self.generateAddressSummary(address);

          dfd.resolve(address);
        }
      }, function(err) {
        dfd.reject(err);
      });

      return dfd.promise;
    },

    updateAddress: function(address) {
      var dfd = $q.defer(),
          self = this;

      if(!address.id) {
        dfd.reject('无效地址');
      } else {
        mmrDataService.request($http({
          url: apiService.ADDRESS_EDIT,
          method: 'POST',
          data: generateAddressVo(address)
        })).then(function(res) {
          res = res[0];
          if(res.status === 1 && res.msg === '操作成功') {
            $rootScope.$root.addresses = _.map($rootScope.$root.addresses, function(target) {
              if(address.isDefault) {
                if(target.isDefault && target.id !== address.id) {
                  target.isDefault = false;

                  // emit the update request
                  self.updateAddress(target);
                }

                if(address.id === target.id) {
                  target = address;
                }
              }

              return target;
            });

            dfd.resolve(address);
          }
        }, function(err) {
          dfd.reject(err);
        });
      }

      return dfd.promise;
    },

    removeAddress: function(id) {
      var dfd = $q.defer(),
          self = this;

      if(id) {
        mmrDataService.request($http({
          url: apiService.ADDRESS_DELETE,
          method: 'POST',
          data: {
            id: id,
            uid: $rootScope.$root.pinfo.uid
          }
        })).then(function(res) {
          res = res[0];
          if(res.status === 1 && res.msg === '操作成功') {
            var removedAddress = _.remove($rootScope.$root.addresses, function(address) {
              return address.id === id;
            })[0];

            if(removedAddress) {
              if(removedAddress.isDefault && $rootScope.$root.addresses.length > 0) {
                var defaultCandidate = $rootScope.$root.addresses[0];
                defaultCandidate.isDefault = true;

                // update the default candidate
                self.updateAddress(defaultCandidate);
              }

              dfd.resolve();
            } else {
              dfd.reject('删除失败');
            }
          }
        }, function(err) {

        });
      }

      return dfd.promise;
    },

    fetchWarehouseList: function() {
      var dfd = $q.defer();

      mmrDataService.request($http({
        url: apiService.ADDRESS_WAREHOUSE,
        method: 'POST',
        data: {
          city: $rootScope.$root.location.id
        }
      })).then(function(res) {
        dfd.resolve(res[0]);
      }, function(err) {
        dfd.reject(err);
      });

      return dfd.promise;
    }

  };

}]);
