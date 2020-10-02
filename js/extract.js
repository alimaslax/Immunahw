var _ = require('lodash');

// using lodash to sort and transform our data to what we need
function spentByZipcode(data) {
    var new_data = [];
    _.forEach(data, function (item) {
        var temp = {
            "vendor_zip": item.vendor_zip,
            "amount": parseFloat(item.amount)
        }
        if (!(_.some(new_data, ['vendor_zip', temp.vendor_zip]))) {
            new_data.push(temp)
        }
        else {
          var index = _.findIndex(new_data, function (o) { return o.vendor_zip == item.vendor_zip; });
          new_data[index].amount = parseFloat(new_data[index].amount)+parseFloat(item.amount);
        }
    });
    return _.orderBy(new_data, 'amount', 'desc');
}


exports.spentByZipcode = spentByZipcode;