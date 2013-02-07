function (doc) {
  if (doc && doc.type == 'message') {
    emit(doc);
  }
}