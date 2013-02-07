function (doc, req) {
  doc.timestamp = new Date();
  for (var field in req.query) {
    doc[field] = req.query[field];
  }
}