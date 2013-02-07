function(newDoc, oldDoc, userCtx) {
  // Setup message transport
  if (!newDoc && oldDoc.username != userCtx.name) {
    throw ({'error': 'unauthorized'});
  } else if (oldDoc && userCtx.roles.indexOf("admin") != -1) {
    throw ({'error': 'messages are immutable!', 'user': userCtx});
  }
}