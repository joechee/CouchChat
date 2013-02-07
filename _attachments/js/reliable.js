(function (db) {
  db.prototype.message = function (msgObj, cb) {
    var url;

    url = this.url + '_design/'+ this.dbName + '/_update/message' + '?type=message';
    for (var key in msgObj) {
      url += '&' + key + '=' + msgObj[key];
    }
    $.ajax({
      type: 'PUT',
      url: url,
      success: function (res) {
        if (cb) {
          cb(res);
        }
      }

    });
  };

  db.prototype.getMessages = function () {
    $.getJSON(this.url + '_design/'+ this.dbName + '/_view/messages', function (res) {
      console.log(res);
    });
  };


  db.prototype.subscribeMessages = function (cb) {
    var self = this;
    var since = 0;
    self.startLongpoll(0, cb);
  };

  db.prototype.startLongpoll = function (index, cb) {
    var self = this;

    if (cb) {
      self._cb = cb;
    } else {
      cb = self._cb;
    }
    self.longpoll = $.ajax({
      url: self.url + '_changes?include_docs=true&feed=longpoll&filter='+self.dbName+'/messages&since='+index,
      dataType: 'json',
      success: function (res) {
        var results = res.results;
        var last_seq = res.last_seq;
        var documents = _.map(results, function (result) {
          return result.doc;
        });

        if (cb) {
          cb(documents);
        }
        self.startLongpoll(last_seq, cb);
        
      },
      error: function (err, msg) {
        // TODO: Backoff after a certain period of time
        self.startLongpoll(index, cb);
      },
      timeout: 30000 // 30 seconds
    });
  };

  db.prototype.cleanUpOldMessages = function (cb) {

  };


  db.prototype.heartbeat = function (interval, room, cb) {
    var self = this;
    setInterval(function () {
      $.ajax({
        type: 'PUT',
        dataType: 'json',
        url: self.url + '_design/'+ self.dbName + '/_update/message?type=heartbeat&room=' + room,
        success: function (res) {
        }
      });
    }, interval);
  };

  var oldDate = Date;

  db.prototype.sync = function (cb) {
    var self = this;
    $.ajax({
      type: 'GET',
      url: self.url + '_design/'+ self.dbName + '/_show/now',
      success: function (res) {
        lag = (new Date()).getTime() - parseInt(res,10);
        Date = function () {
          var returnDate = new oldDate();
          returnDate.setTime(returnDate.getTime() - lag);
          return returnDate;
        };
        if (cb) {
          cb(lag);
        }
      }
    });
  };


})(CouchDB);