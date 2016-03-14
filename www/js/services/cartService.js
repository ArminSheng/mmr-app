angular.module('mmr.services')

.factory('mmrCartService', ['$rootScope', 'mmrEventing', 'mmrAddressService',
  function($rootScope, mmrEventing, mmrAddressService) {

  return {

    isItemInCart: function(item) {
      return !!$rootScope.$root.cart.itemsId[item.id];
    },

    setItemCount: function(item, newCount) {
      $rootScope.$root.cart.itemsCount[item.id] = newCount;
    },

    getItemCount: function(item) {
      return $rootScope.$root.cart.itemsCount[item.id] || 0;
    },

    addItemToCart: function(scope, item) {
      // check whether count is greater than 0
      this.setItemCount(item, this.getItemCount(item) + 1);
      mmrEventing.doAddItemToCart(scope, {
        item: scope.item
      });
    },

    generateCartOrders: function(isNormalOrder) {
      if(isNormalOrder) {
        return $rootScope.$root.cart.normalOrders;
      } else {
        return $rootScope.$root.cart.reservedOrders;
      }
    },

    removeGeneratedItems: function(generatedOrder) {
      var currentOrders,
          type;
      if(generatedOrder.isReserved) {
        currentOrders = $rootScope.$root.cart.reservedOrders;
        type = 0;
      } else {
        currentOrders = $rootScope.$root.cart.normalOrders;
        type = 1;
      }

      // generated items count
      var generatedCount = $rootScope.$root.cart.checkedCounts[type];

      // remove checked orders
      var removedOrders = _.remove(currentOrders, function(order) {
        return order.checked;
      });

      // clear the counters on the removed items within the removed orders
      _.forEach(removedOrders, function(removedOrder) {
        _.forEach(removedOrder.items, function(removedItem) {
          $rootScope.$root.cart.itemsCount[removedItem.id] = 0;
        });
      });

      // remove checked items within the orders
      _.forEach(currentOrders, function(order) {
        var removedItems = _.remove(order.items, function(item) {
          return item.checked;
        });

        // clear the counters on the removed items within the partial removed orders
        _.forEach(removedItems, function(removedItem) {
          $rootScope.$root.cart.itemsCount[removedItem.id] = 0;
        });
      });

      this.updateCheckedInformation(type);
      updateTotalCount(type, generatedCount);

      function updateTotalCount(type, generatedCount) {
        $rootScope.$root.cart.totalCount -= generatedCount;
        $rootScope.$root.cart.counts[type] -= generatedCount;
      }
    },

    checkAllCartItems: function(type) {
      if(type === 0) {
        if($rootScope.$root.cart.allChecked[type]) {
          doCheckAll($rootScope.$root.cart.reservedOrders, true);
        } else {
          doCheckAll($rootScope.$root.cart.reservedOrders, false);
        }
      } else if(type === 1) {
        if($rootScope.$root.cart.allChecked[type]) {
          doCheckAll($rootScope.$root.cart.normalOrders, true);
        } else {
          doCheckAll($rootScope.$root.cart.normalOrders, false);
        }
      }

      function doCheckAll(collection, status) {
        _.forEach(collection, function(element) {
          element.checked = status;
          _.forEach(element.items, function(item) {
            item.checked = status;
          });
        });
      }
    },

    // 0: reserved, 1: normal
    updateCheckedInformation: function(type) {
      if(type === 0) {
        doFillCheckAll($rootScope.$root.cart.reservedOrders);
        doUpdateCheckedInfo($rootScope.$root.cart.reservedOrders);
      } else if(type === 1) {
        doFillCheckAll($rootScope.$root.cart.normalOrders);
        doUpdateCheckedInfo($rootScope.$root.cart.normalOrders);
      }

      function doFillCheckAll(collection) {
        var allChecked = true;
        if(collection.length === 0) {
          allChecked = false;
        } else {
          _.forEach(collection, function(element) {
            allChecked = _.every(element.items, {'checked': true});
            if(!allChecked) {
              return false;
            }
          });
        }

        $rootScope.$root.cart.allChecked[type] = allChecked;
      }

      function doUpdateCheckedInfo(collection) {
        var checkedCount = 0,
            checkedAmount = 0;
        _.forEach(collection, function(element) {
          _.forEach(element.items, function(item) {
            if(item.checked) {
              checkedCount += item.quantity;
              checkedAmount += item.price * item.quantity;
            }
          });
        });

        $rootScope.$root.cart.checkedCounts[type] = checkedCount;
        $rootScope.$root.cart.checkedAmounts[type] = checkedAmount;
      }
    },

    generateCheckedOrders: function(tab) {

      function generateOrders() {
        if(tab === 0) {
          disableEditing($rootScope.$root.cart.reservedOrders);
          return retainCheckedItems($rootScope.$root.cart.reservedOrders);
        } else if(tab === 1) {
          disableEditing($rootScope.$root.cart.normalOrders);
          return retainCheckedItems($rootScope.$root.cart.normalOrders);
        }

        function retainCheckedItems(orders) {
          var copiedOrders = angular.copy(orders);
          _.forEach(copiedOrders, function(order) {
            _.remove(order.items, function(item) {
              return !item.checked;
            });
          });

          // loop again to remove order which has no item
          _.remove(copiedOrders, function(order) {
            return order.items.length === 0;
          });

          return copiedOrders;
        }
      }

      function generateMoney() {
        function calculateActualMoney(money) {
          return money.total + (money.shipment || 0) - (money.coupon || 0);
        }

        var result = {
          total: $rootScope.$root.cart.checkedAmounts[tab].toFixed(2),
          shipment: 0,
          coupon: 0
        };

        result.summary = calculateActualMoney(result).toFixed(2); // bottom summary area in gen modal

        return result;
      }

      function disableEditing(orders) {
        _.forEach(orders, function(subOrder) {
          subOrder.isEditing = false;
        });
      }

      var orderObject = {
        isReserved: tab === 0,
        orders: generateOrders(),
        money: generateMoney(),
        delivery: '送货上门',
        receipt: '增值税普通发票',
        addresses: mmrAddressService.defaultAddresses()
      };

      return orderObject;
    },

    generateIndependentOrder: function(item, count) {
      item = this.convertToCartItem(item);

      var orderObject = {};

      orderObject.isReserved = item.isReserved;
      orderObject.orders = generateOrders(item, count);
      orderObject.delivery = '送货上门';
      orderObject.receipt = '增值税普通发票';
      orderObject.addresses = mmrAddressService.defaultAddresses();
      orderObject.money = generateMoney(item);
      orderObject.isIndependentOrder = true;

      return orderObject;

      function generateOrders(item, count) {
        // update item quantity
        item.quantity = count;

        var order = {};
        order.checked = true;
        order.id = item.shop.id;
        order.name = item.shop.name;
        order.items = [item];

        return [order];
      }

      function generateMoney(item) {
        function calculateActualMoney(money) {
          return money.total + (money.shipment || 0) - (money.coupon || 0);
        }

        var result = {
          total: (item.price * item.quantity).toFixed(2),
          shipment: 0,
          coupon: 0
        };

        result.summary = calculateActualMoney(result).toFixed(2); // bottom summary area in gen modal

        return result;
      }
    },

    isCheckoutable: function(tab) {
      if($rootScope.$root.cart.checkedCounts[tab] > 0 &&
         $rootScope.$root.cart.checkedAmounts[tab] > 0) {
        return true;
      } else {
        return false;
      }
    },

    // get total amount by the
    getTotalAmount: function(tab) {
      return $rootScope.$root.cart.amounts[tab];
    },

    convertToCartItem: function(item, newCount) {
      // construct the cart item instance
      var cartItem = {};

      cartItem.id = item.id;
      cartItem.name = item.title;
      cartItem.imagePath = item.banner[0].path || ''; // first banner image as default
      cartItem.attribute = item.attribute;
      cartItem.price = item.cprice;
      cartItem.quantity = newCount;
      cartItem.unitName = item.unitName;
      cartItem.isReserved = item.isReserved;
      cartItem.shop = item.shop;

      return cartItem;
    }

  };

}]);
