function (doc, req) {
  var isOutdated = (doc.timestamp > ((new Date()).getTime() - 30000));
  var isDeleted = doc._deleted;
  return isOutdated || isDeleted;
}