var winston = require('winston');
var moment  = require('moment');
var divvy  = require('divvy-lib');
var async   = require('async');
var utils   = require('../utils');

var marketPairs = [
  {
    // Bitstamp USD market
    base: {currency: 'USD', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'},
    counter: {currency: 'XDV'}
  },
  {
    // Bitstamp BTC market
    base: {currency: 'BTC', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'},
    counter: {currency: 'XDV'}
  },
  {
    // DivvyCN CNY market
    base: {currency: 'CNY', issuer: 'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK'},
    counter: {currency: 'XDV'}
  },
  {
    // DivvyChina CNY market
    base: {currency: 'CNY', issuer: 'razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA'},
    counter: {currency: 'XDV'}
  },
  {
    // DivvyFox CNY market
    base: {currency: 'CNY', issuer: 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y'},
    counter: {currency: 'XDV'}
  },
  {
    // SnapSwap USD market
    base: {currency: 'USD', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'},
    counter: {currency: 'XDV'}
  },
  {
    // SnapSwap EUR market
    base: {currency: 'EUR', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'},
    counter: {currency: 'XDV'}
  },
  {
    // SnapSwap BTC market
    base: {currency:'BTC', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'},
    counter: {currency:'XDV'}
  },
  {
    // TokyoJPY JPY
    base: {currency:'JPY', issuer: 'r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN'},
    counter: {currency:'XDV'}
  },
  {
    // Digital Gate Japan JPY
    base: {currency:'JPY', issuer: 'rJRi8WW24gt9X85PHAxfWNPCizMMhqUQwg'},
    counter: {currency:'XDV'}
  },
  {
    // Divvy Exchange Tokyo JPY
    base: {currency:'JPY', issuer: 'r9ZFPSb1TFdnJwbTMYHvVwFK1bQPUCVNfJ'},
    counter: {currency:'XDV'}
  },
  {
    // Divvy Fox STR
    base: {currency:'STR', issuer: 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y'},
    counter: {currency:'XDV'}
  },
  {
    // Divvy Fox FMM
    base: {currency:'FMM', issuer: 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y'},
    counter: {currency:'XDV'}
  },
  {
    // Bitso MXN
    base: {currency:'MXN', issuer: 'rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn'},
    counter: {currency:'XDV'}
  },
  {
    // Bitso BTC
    base: {currency:'BTC', issuer: 'rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn'},
    counter: {currency:'XDV'}
  },
  {
    // Snapswap EUR/ Snapswap USD
    base    : {currency: 'EUR', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'},
    counter : {currency: 'USD', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'}
  },
  {
    // Bitstamp BTC/USD
    base    : {currency: 'BTC', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'},
    counter : {currency: 'USD', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'},
  },
  {
    // Bitstamp BTC/USD
    base    : {currency: 'BTC', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'},
    counter : {currency: 'USD', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'},
  },
  {
    // Bitstamp BTC/ Snapswap BTC
    base    : {currency: 'BTC', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'},
    counter : {currency: 'BTC', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'},
  },
  {
    // Bitstamp USD/ Snapswap USD
    base    : {currency: 'USD', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'},
    counter : {currency: 'USD', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'},
  },
  {
    // Bitstamp USD/ divvyCN CNY
    base    : {currency: 'CNY', issuer: 'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK'},
    counter : {currency: 'USD', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'}
  },
  {
    // Bitstamp USD/ divvyChina CNY
    base    : {currency: 'CNY', issuer: 'razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA'},
    counter : {currency: 'USD', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'}
  },
  {
    // Bitstamp USD/ divvyFox CNY
    base    : {currency: 'CNY', issuer: 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y'},
    counter : {currency: 'USD', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'}
  },
  {
    // Snapswap USD/ divvyFox CNY
    base    : {currency: 'CNY', issuer: 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y'},
    counter : {currency: 'USD', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'}
  },
  {
    // Snapswap USD/ divvyFox CNY
    base    : {currency: 'CNY', issuer: 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y'},
    counter : {currency: 'FMM', issuer: 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y'}
  },
  {
    // TokyoJPY JPY/ divvyFox CNY
    base    : {currency: 'JPY', issuer: 'r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN'},
    counter : {currency: 'CNY', issuer: 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y'}
  },
  {
    // TokyoJPY JPY/ Snapswap BTC
    base    : {currency: 'JPY', issuer: 'r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN'},
    counter : {currency: 'BTC', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'}
  },
  {
    // TokyoJPY JPY/ Snapswap USD
    base    : {currency: 'JPY', issuer: 'r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN'},
    counter : {currency: 'USD', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'}
  },
  {
    // TokyoJPY JPY/ Bitstamp USD
    base    : {currency: 'JPY', issuer: 'r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN'},
    counter : {currency: 'USD', issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'}
  },
  {
    // Bitso MXN / Snapswap USD
    base    : {currency: 'MXN', issuer: 'rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn'},
    counter : {currency: 'USD', issuer: 'rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q'}
  }
];

var intervals = [
  'hour',
  'day',
  'week',
  'month'
];

function tradeVolume(params, callback) {

  var rowkey;
  var startTime;
  var endTime;

  if (!params) params = {};
  interval  = (params.interval || '').toLowerCase();
  startTime = params.startTime;

  rowkey    = 'trade_volume';

  if (!startTime) {
    startTime = moment.utc().subtract(24, 'hours');
    endTime   = moment.utc();
    rowkey   += '|live';
    interval  = null;

  } else if (!interval || intervals.indexOf(interval) === -1) {
    callback('invalid interval');
    return;

  } else {
    startTime.startOf(interval === 'week' ? 'isoWeek' : interval);
    rowkey += '|' + interval + '|' + utils.formatTime(startTime);
    endTime = moment.utc(startTime).add(1, interval);
  }

  async.map(marketPairs, function(assetPair, asyncCallbackPair){
    var options = {
      base       : assetPair.base,
      counter    : assetPair.counter,
      start      : startTime,
      end        : endTime,
      descending : false
    }

    var pair = {
      base    : assetPair.base,
      counter : assetPair.counter
    };

    if (interval === 'week') {
      options.interval = '7day';
    } else if (interval) {
      options.interval = '1' + interval;
    } else {
      options.reduce   = true;
    }

    //the section below will use
    //the previously calculated
    //vwap from the aggregated row

    hbase.getExchanges(options, function(err, resp) {
      if (err) {
        asyncCallbackPair(err);
        return;
      }

      if (options.interval) {
        resp = resp[0];
      }

      if (resp) {
        pair.rate   = resp.vwap;
        pair.count  = resp.count;
        pair.amount = resp.base_volume;

      } else {
        pair.rate   = 0;
        pair.count  = 0;
        pair.amount = 0;
      }

      asyncCallbackPair(null, pair);
    });

  }, function(err, pairs) {
    if (err) {
      if (callback) callback(err);
      return;
    }

    var rates = { };
    var response = {
      startTime    : startTime.format(),
      endTime      : endTime.format(),
      exchange     : {currency:'XDV'},
      exchangeRate : 1,
      total        : 0,
      count        : 0
    };

    //get rates vs XDV
    pairs.forEach(function(pair, index) {
      if (pair.counter.currency === 'XDV') {
        rates[pair.base.currency + "." + pair.base.issuer] = pair.rate;
      }
    });


    //convert non - XDV to XDV value
    pairs.forEach(function(pair, index) {
      if (pair.counter.currency !== 'XDV') {
        pair.rate = rates[pair.base.currency + "." + pair.base.issuer];
      }

      pair.convertedAmount = pair.rate ? pair.amount * pair.rate : 0;
      response.total += pair.convertedAmount;
      response.count += pair.count;
    });

    response.components = pairs;

    //cache XDV normalized version
    if (!params.no_cache) {
      cacheResponse (rowkey, response);
    }
    callback (null, response);
  });

  function cacheResponse (rowkey, response) {
    var table = 'agg_metrics';
    hbase.putRow(table, rowkey, response);
    console.log('cacheing metric:', rowkey);
  }
}

module.exports = tradeVolume;
