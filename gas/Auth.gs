/**
 * Verifies the shared secret for Phase 1 authentication.
 * Note: Since GAS Web Apps cannot reliably read custom HTTP headers,
 * the secret should be passed within the JSON payload.
 */
function verifySecret(secret) {
  var expectedSecret = PropertiesService.getScriptProperties().getProperty('GAS_SHARED_SECRET');
  if (!expectedSecret) {
    throw new Error("Server configuration error: missing GAS_SHARED_SECRET in Script Properties");
  }
  return secret === expectedSecret;
}
