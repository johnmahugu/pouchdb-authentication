'use strict';

require('whatwg-fetch');
require('promise-polyfill');

var PouchDB = require('pouchdb-memory');
var Authentication = require('../lib');
PouchDB.plugin(Authentication);

var utils = require('./test-utils');
var chai = require('chai');
var should = chai.should();

var serverHost = utils.getConfig().serverHost;

describe('authentication', function () {

  var dbName = serverHost + '/testdb';
  var users = ['aquaman'];

  var db;

  beforeEach(function () {
    db = new PouchDB(dbName);
    return utils.ensureUsersDatabaseExists(db);
  });

  afterEach(function () {
    return db.logout().then(function () {
      return db.destroy().then(function () {
        // remove the fake users, hopefully we're in the admin party
        return utils.deleteUsers(db, users);
      });
    });
  });

  it('Test login/logout', function () {
    return db.signup('aquaman', 'sleeps_with_fishes').then(function () {
      return db.getSession();
    }).then(function (res) {
      should.equal(res.userCtx.name, null);
      return db.login('aquaman', 'sleeps_with_fishes');
    }).then(function (res) {
      res.ok.should.equal(true);
      return db.getSession();
    }).then(function (res) {
      res.userCtx.name.should.equal('aquaman');
      return db.logout();
    }).then(function () {
      return db.getSession();
    }).then(function (res) {
      should.equal(res.userCtx.name, null);
    });
  });
});
