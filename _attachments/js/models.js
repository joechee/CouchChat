var App = Backbone.Router.extend({
  initialize: function (opts) {
    var self = this;
    var messages = this.messages = new MessageCollection([], {
      room: opts.room
    });
    var collectionView = new MessageCollectionView({
      collection: messages
    });

    users = new Users();
    var usersView = new UsersView({
      collection: users
    });
    $('.users').append(usersView.$el);

    var $messagesContainer = $('.message-app .messages');
    $messagesContainer.empty();

    $messagesContainer.append(collectionView.$el);
    if (!opts) {
      opts = {};
    }
    this.db = opts.db;
    this.user = opts.user;
    this.db.sync(function () {
      self.db.subscribeMessages(function (res) {
        _.each(res, function (msg) {
          if (msg.type == "message") {
            if (self.room && self.room != msg.room) {
              return;
            } else if (!self.room && msg.room) {
              return;
            }
            messages.add(msg, {
              merge: true
            });
          } else if (msg.type == "heartbeat") {
            users.add(msg, {
              merge: true
            });
          }

        });
      });

      setInterval(function () {
        self.db.sync();
      }, 10000);

      // Tell everyone that you are in the house
      self.db.heartbeat(10000, opts.room);
    });
    


    // setup widgets. Should abstract into own views

    var sendMessage = function () {
      var message = $('.message-form .edit-message').val();
      if (message.trim() === "") {
        return;
      }
      var room = $('.room-name').val();
      if (room && room !== "") {
        app.db.message({
          'message': message,
          'room': room
        }, function () {
          $('.message-form .edit-message').val("");
        });
      } else {
        app.db.message({
          'message': message
        }, function () {
          $('.message-form .edit-message').val("");
        });
      }
    };
    $('.message-form .send').click(sendMessage);
    $('.message-form .edit-message').on('keydown', function (e) {
      if (e.keyCode == 13) {
        sendMessage();
      }
    });
    $('.logout').click(function () {
      self.db.logout(function () {
        $('.overlay').show();
        $('.login-widget').show();
      });
    });

    $('.edit-message').focus();
  },
  changeRoom: function (roomName) {
    this.room = roomName;
  }
});


var Message = Backbone.Model.extend({
  idAttribute: "_id",
  initialize: function (attr) {
  }
});

var MessageCollection = Backbone.Collection.extend({
  model: Message
});

var MessageView = Backbone.View.extend({
  model: Message,
  initialize: function () {
    var model = this.model;
    var $view = $('<div class="message-line">');
    var $author = $('<div class="author">').text(model.get('username')+":");
    var $message = $('<div class="message">').text(model.get('message'));
    $view
      .append($author)
      .append($message);

    this.setElement($view);
  }
});

var MessageCollectionView = Backbone.View.extend({
  collection: MessageCollection,
  SubView: MessageView,
  initialize: function () {
    var self = this;
    var _subViews = [];
    this.collection.on('add', function (model, collection, options) {
      var newView = new self.SubView({
        model: model
      });
      var index = collection.indexOf(model);
      if (index === 0) {
        self.$el.prepend(newView.$el);
      } else if (index > 0 && index < collection.length - 1) {
        _subViews[index].$el.after(newView.$el);
      } else if (index == collection.length - 1) {
        self.$el.append(newView.$el);
      }
      _subViews.splice(index, 0, newView);

    });

    this.collection.on('remove', function (model) {
      var removedView;
      _subViews = _.filter(_subViews, function (view) {
        if (view.model.cid == model.cid) {
          removedView = view;
          return false;
        } else {
          return true;
        }
      });
      removedView.remove();
    });
  }

});

var User = Backbone.Model.extend({
  idAttribute: 'username',
  initialize: function () {
    var self = this;
    var interval = setInterval(function () {
      var time = (new Date()).getTime();
      if (self.get('timestamp') < (time - 10000)) {
        clearInterval(interval);
        self.collection.remove(self);
      }
    }, 1000);
  }});
var Users = Backbone.Collection.extend({
  model: User
});

var UserView = Backbone.View.extend({
  model: User,
  initialize: function () {
    var model = this.model;
    var $view = $('<div class="user">').text(model.get('username'));
    this.setElement($view);
  }
});

var UsersView = Backbone.View.extend({
  collection: MessageCollection,
  SubView: UserView,
  initialize: function () {
    var self = this;
    var _subViews = [];
    this.collection.on('add', function (model, collection, options) {
      var newView = new self.SubView({
        model: model
      });
      var index = collection.indexOf(model);
      if (index === 0) {
        self.$el.prepend(newView.$el);
      } else if (index > 0 && index < collection.length - 1) {
        _subViews[index].$el.after(newView.$el);
      } else if (index == collection.length - 1) {
        self.$el.append(newView.$el);
      }
      _subViews.splice(index, 0, newView);

    });

    this.collection.on('remove', function (model) {
      var removedView;
      _subViews = _.filter(_subViews, function (view) {
        if (view.model.cid == model.cid) {
          removedView = view;
          return false;
        } else {
          return true;
        }
      });
      removedView.remove();
    });
  }

});
