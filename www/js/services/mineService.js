angular.module('mmr.services')

.factory('mmrMineFactory', ['$http', 'restService', 'mmrCacheFactory', 'mmrDataService', 'mmrItemFactory', '$rootScope', '$q',
  function($http, restService, mmrCacheFactory, mmrDataService, mmrItemFactory, $rootScope, $q) {

  // mock
  var details = [
    // { time: new Date(), direction: 'in', orderId: '20151223123456', amount: 200 },
    // { time: new Date(), direction: 'out', orderId: '20151223123457', amount: 300 },
    // { time: new Date(), direction: 'in', orderId: '20151223123458', amount: 400 },
    // { time: new Date(), direction: 'out', orderId: '20151223123459', amount: 500.66 },
    // { time: new Date(), direction: 'in', orderId: '20151223123460', amount: 700.33 },
    // { time: new Date(), direction: 'out', orderId: '20151223123461', amount: 100.11 }
  ];

  var couponUnused = [
    // { status: 0, periodStart: '2015-11-01', periodEnd: '2016-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节' },
    // { status: 0, periodStart: '2015-11-01', periodEnd: '2016-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节' },
    // { status: 0, periodStart: '2015-11-01', periodEnd: '2016-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节' },
    // { status: 0, periodStart: '2015-11-01', periodEnd: '2016-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节' },
    // { status: 0, periodStart: '2015-11-01', periodEnd: '2016-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节' }
  ],

  couponUsed = [
    // { status: 1, periodStart: '2015-11-01', periodEnd: '2016-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节', usedTime: '2015-12-31 14:30:33' },
    // { status: 1, periodStart: '2015-11-01', periodEnd: '2016-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节', usedTime: '2015-12-31 14:30:33' },
    // { status: 1, periodStart: '2015-11-01', periodEnd: '2016-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节', usedTime: '2015-12-31 14:30:33' },
    // { status: 1, periodStart: '2015-11-01', periodEnd: '2016-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节', usedTime: '2015-12-31 14:30:33' },
    // { status: 1, periodStart: '2015-11-01', periodEnd: '2016-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节', usedTime: '2015-12-31 14:30:33' }
  ],

  couponExpired = [
    // { status: 2, periodStart: '2015-11-01', periodEnd: '2015-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节' },
    // { status: 2, periodStart: '2015-11-01', periodEnd: '2015-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节' },
    // { status: 2, periodStart: '2015-11-01', periodEnd: '2015-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节' },
    // { status: 2, periodStart: '2015-11-01', periodEnd: '2015-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节' },
    // { status: 2, periodStart: '2015-11-01', periodEnd: '2015-12-31', amount: 99, requirementAmount: 399, range: '禽类产品', compaign: '双11狂欢节' }
  ];

  var usual = [
    // { status: 0, companyName: '上海买卖肉食品有限公司', taxpayer: '', registerAddress: '', phone: '', bank: '', bankAccount: '', license: []},
    // { status: 1, companyName: '上海买卖肉食品有限公司', taxpayer: '', registerAddress: '', phone: '', bank: '', bankAccount: '', license: []},
    // { status: 2, companyName: '上海买卖肉食品有限公司', taxpayer: '', registerAddress: '', phone: '', bank: '', bankAccount: '', license: []},
    // { status: 0, companyName: '上海买卖肉食品有限公司', taxpayer: '', registerAddress: '', phone: '', bank: '', bankAccount: '', license: []}
  ],

  special = [
    // { status: 0, companyName: '上海买卖肉食品有限公司', taxpayer: '243648139573957', registerAddress: '上海市普陀区曹杨路450号', phone: '18616524565', bank: '交通银行', bankAccount: '6217003860001085170', license: []},
    // { status: 1, companyName: '上海买卖肉食品有限公司', taxpayer: '243648139573957', registerAddress: '上海市普陀区曹杨路450号', phone: '18616524565', bank: '交通银行', bankAccount: '6217003860001085170', license: []},
    // { status: 2, companyName: '上海买卖肉食品有限公司', taxpayer: '243648139573957', registerAddress: '上海市普陀区曹杨路450号', phone: '18616524565', bank: '交通银行', bankAccount: '6217003860001085170', license: []},
    // { status: 0, companyName: '上海买卖肉食品有限公司', taxpayer: '243648139573957', registerAddress: '上海市普陀区曹杨路450号', phone: '18616524565', bank: '交通银行', bankAccount: '6217003860001085170', license: []}
  ];

  var favShops = [
    {
      name: '中粮旗舰店',
      signUpTime: '2015-12-01',
      logoPath: 'img/common/shop-brand.png'
    },
    {
      name: '上海中粮专卖店',
      signUpTime: '2015-12-01',
      logoPath: 'img/common/shop-brand.png'
    },
    {
      name: '上海中粮旗舰店',
      signUpTime: '2015-12-01',
      logoPath: 'img/common/shop-brand.png'
    },
    {
      name: '中粮旗舰店',
      signUpTime: '2015-12-01',
      logoPath: 'img/common/shop-brand.png'
    }
  ],
  favProducts = [
      {
        id: 1,
        name: '苏北草鸭腿950g',
        imagePath: 'img/item/sample.png',
        attribute: '冻品',
        price: 190,
        cprice: 250,
        salesAmount: 3,
        unitName: '箱',
        brand: '买卖肉'
      },
      {
        id: 2,
        name: '苏北草鸭腿950g',
        imagePath: 'img/item/sample.png',
        attribute: '鲜品',
        price: 200,
        cprice: 290,
        salesAmount: 4,
        unitName: '箱',
        brand: '买卖肉'
      },
      {
        id: 3,
        name: '苏北草鸭腿950g',
        imagePath: 'img/item/sample.png',
        attribute: '冻品',
        price: 210,
        cprice: 280,
        salesAmount: 5,
        unitName: '箱',
        brand: '买卖肉'
      },
      {
        id: 4,
        name: '苏北草鸭腿950g',
        imagePath: 'img/item/sample.png',
        attribute: '冻品',
        price: 190,
        cprice: 270,
        salesAmount: 3,
        unitName: '箱',
        brand: '买卖肉'
      },
      {
        id: 5,
        name: '苏北草鸭腿950g',
        imagePath: 'img/item/sample.png',
        attribute: '鲜品',
        price: 200,
        cprice: 250,
        salesAmount: 4,
        unitName: '箱',
        brand: '买卖肉'
      },
      {
        id: 6,
        name: '苏北草鸭腿950g',
        imagePath: 'img/item/sample.png',
        attribute: '冻品',
        price: 210,
        cprice: 230,
        salesAmount: 5,
        unitName: '箱',
        brand: '买卖肉'
      }

  ];

  return {
    depositDetails: function() {
      // save into cache
      mmrCacheFactory.set('depositDetails', details);
      return details;
    },

    couponDetails: function() {
      // save into cache
      mmrCacheFactory.set('couponDetails.unused', couponUnused);
      mmrCacheFactory.set('couponDetails.used', couponUsed);
      mmrCacheFactory.set('couponDetails.expired', couponExpired);

      return [couponUnused, couponUsed, couponExpired];
      // return [[], [], couponExpired];
    },

    receiptDetails: function() {
      // save into cache
      mmrCacheFactory.set('receiptDetails.usual', usual);
      mmrCacheFactory.set('receiptDetails.special', special);
      return [usual, special];
    },

    myFav: function(index) {
      var dfd = $q.defer();

      if (index === 1) {
        mmrCacheFactory.set('myFav.favShops', favShops);
        return favShops;
      } else {
        mmrDataService.request(mmrItemFactory.footprintList({
          uid: $rootScope.$root.pinfo.uid,
          type: 3
        })).then(function(res) {
          dfd.resolve(res);
        }, function(err) {

        });

        return dfd.promise;
      }
    }
  };

}]);
