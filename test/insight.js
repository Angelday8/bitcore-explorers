'use strict';

var sinon = require('sinon');
var should = require('chai').should();
var expect = require('chai').expect;
var bitcore = require('bitcore');
var explorers = require('../');

var Insight = explorers.Insight;
var Address = bitcore.Address;
var Transaction = bitcore.Transaction;
var Networks = bitcore.Networks;

describe('Insight', function() {

  describe('instantiation', function() {
    it('can be created without any parameters', function() {
      var insight = new Insight();
      should.exist(insight.url);
      should.exist(insight.network);
      if (insight.network === Networks.livenet) {
        insight.url.should.equal('https://insight.bitpay.com');
      } else if (insight.network === Networks.testnet) {
        insight.url.should.equal('https://test-insight.bitpay.com');
      }
    });
    it('can be created providing just a network', function() {
      var insight = new Insight(Networks.testnet);
      insight.url.should.equal('https://test-insight.bitpay.com');
      insight.network.should.equal(Networks.testnet);
    });
    it('can be created with a custom url', function() {
      var url = 'https://localhost:1234';
      var insight = new Insight(url);
      insight.url.should.equal(url);
    });
    it('can be created with a custom url and network', function() {
      var url = 'https://localhost:1234';
      var insight = new Insight(url, Networks.testnet);
      insight.url.should.equal(url);
      insight.network.should.equal(Networks.testnet);
    });
    it('defaults to defaultNetwork on a custom url', function() {
      var insight = new Insight('https://localhost:1234');
      insight.network.should.equal(Networks.defaultNetwork);
    });
  });

  describe('getting unspent utxos', function() {
    var insight = new Insight();
    var address = '371mZyMp4t6uVtcEr4DAAbTZyby9Lvia72';
    beforeEach(function() {
      insight.requestPost = sinon.stub();
      insight.requestPost.onFirstCall().callsArgWith(2, null, {statusCode: 200});
    });
    it('can receive an address', function(callback) {
      insight.getUnspentUtxos(new Address(address), callback);
    });
    it('can receive a address as a string', function(callback) {
      insight.getUnspentUtxos(address, callback);
    });
    it('can receive an array of addresses', function(callback) {
      insight.getUnspentUtxos([address, new Address(address)], callback);
    });
    it('errors if server is not available', function(callback) {
      insight.requestPost.onFirstCall().callsArgWith(2, 'Unable to connect');
      insight.getUnspentUtxos(address, function(error) {
        expect(error).to.equal('Unable to connect');
        callback();
      });
    });
    it('errors if server returns errorcode', function(callback) {
      insight.requestPost.onFirstCall().callsArgWith(2, null, {statusCode: 400});
      insight.getUnspentUtxos(address, function(error) {
        expect(error).to.deep.equal({statusCode: 400});
        callback();
      });
    });
  });

  describe('broadcasting a transaction', function() {
    var insight = new Insight();
    beforeEach(function() {
      insight.requestPost = sinon.stub();
      insight.requestPost.onFirstCall().callsArgWith(2, null, {statusCode: 200});
    });
    it('accepts a raw transaction', function(callback) {
      insight.broadcast(rawTx, callback);
    });
    it('accepts a transaction model', function(callback) {
      insight.broadcast(new Transaction(rawTx), callback);
    });
    it('errors if server is not available', function(callback) {
      insight.requestPost.onFirstCall().callsArgWith(2, 'Unable to connect');
      insight.broadcast(rawTx, function(error) {
        expect(error).to.equal('Unable to connect');
        callback();
      });
    });
    it('errors if server returns errorcode', function(callback) {
      insight.requestPost.onFirstCall().callsArgWith(2, null, {statusCode: 400}, 'error');
      insight.broadcast(rawTx, function(error) {
        expect(error).to.equal('error');
        callback();
      });
    });
  });
});

var rawTx = '01000000015884e5db9de218238671572340b207ee85b628074e7e467096c267266baf77a4000000006a473044022013fa3089327b50263029265572ae1b022a91d10ac80eb4f32f291c914533670b02200d8a5ed5f62634a7e1a0dc9188a3cc460a986267ae4d58faf50c79105431327501210223078d2942df62c45621d209fab84ea9a7a23346201b7727b9b45a29c4e76f5effffffff0150690f00000000001976a9147821c0a3768aa9d1a37e16cf76002aef5373f1a888ac00000000';
