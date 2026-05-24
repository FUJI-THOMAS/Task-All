/**
 * LockService wrapper to prevent concurrent modification issues.
 * Ensures that all writes to the spreadsheet are synchronized.
 */
function withLock(callback) {
  var lock = LockService.getScriptLock();
  try {
    // Wait for up to 10 seconds for other processes to finish.
    var success = lock.tryLock(10000);
    if (!success) {
      throw new Error("Lock timeout");
    }
    return callback();
  } catch (e) {
    throw new Error("Execution error: " + e.message);
  } finally {
    lock.releaseLock();
  }
}
