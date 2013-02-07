function (doc, req) {
  if (!req.userCtx || ! req.userCtx.name) {
    throw({'error': 'user not authenticated!'});
  }

  if (!doc) {
    doc = {};
  }
  doc._id = req.uuid;
  doc.type = 'heartbeat';
  doc.room = req.query.room;
  doc.username = req.userCtx.name;
  doc.timestamp = (new Date()).getTime();

  for (var field in req.query) {
    doc[field] = req.query[field];
  }

  return [doc, JSON.stringify(doc)];
  
}