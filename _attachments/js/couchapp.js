/*
  Interface to the database

*/
(function (window) {

  function getDefaultDBLocation() {
    return window.location.href.match(/\/\/[^\/]*\/[^\/]*\//)[0];
  }

  function getDefaultDBName() {
    return window.location.href.split('/')[3];
  }

  function randomSalt(length) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$_+?%^&)";
    var salt = "";
    for (var i = 0; i < length; i++) {
      salt += chars[Math.floor(Math.random() * chars.length)];
    }
    return salt;
   }

  var CouchDB = function (opts) {
    if (!opts) {
      opts = {};
    }
    $.extend(opts, {
      url: getDefaultDBLocation(),
      dbName: getDefaultDBName()
    });
    this.url = opts.url;
    this.dbName = opts.dbName;
  };

  CouchDB.prototype.uuid = randomSalt;

  CouchDB.prototype.get = function (url, success, error) {
    $.ajax({
      url: this.url + url,
      success: success,
      error: error,
      dataType: 'json'
    });
  };

  CouchDB.prototype.update = function (data, success, error) {
    $.ajax({
      type: 'PUT',
      url: this.url + data._id,
      data: JSON.stringify(data),
      success: success,
      error: error
    });
  };

  CouchDB.prototype.remove = function (data, success, error) {
    $.ajax({
      type: 'DELETE',
      url: this.url + data['_id'],
      data: JSON.stringify(data),
      success: success,
      error: error
    });
  };

  CouchDB.prototype.login = function (name, password, success, error) {
    $.ajax({
      url: '/_session',
      type: 'POST',
      data: {
        name: name,
        password: password
      },
      success: function () {
        this.logged_in = true;
        success.apply(this, arguments);
      },
      error: error
    });
  };

  CouchDB.prototype.createUser = function (name, password, success, error) {
    var salt = randomSalt(10);
    $.ajax({
      url: '//' + window.location.hostname + '/_users/',
      type: 'POST',
      data: JSON.stringify({
        _id: 'org.couchdb.user:'+name,
        name: name,
        password_sha: $.sha1(password + salt),
        salt: salt,
        type: 'user',
        roles: []
      }),
      contentType: 'application/json',
      success: function () {
        success.apply(this, arguments);
      },
      error: error
    });
  };

  CouchDB.prototype.logout = function (successCallback, errorCallback) {
    $.ajax({
      type: 'DELETE',
      url:'/_session',
      success: function (res) {
        if (successCallback) {
          successCallback(res);
        }
      },
      error: function (err) {
        if (errorCallback) {
          errorCallback(err);
        }
      }
    });
  };

  // Extended API
  CouchDB.prototype.getCurrentUser = function (success, error) {
    $.ajax({
      url: '/_session',
      type: 'GET',
      dataType: 'json',
      success: success,
      error: error
    });
  };









  window.CouchDB = CouchDB;
})(window);