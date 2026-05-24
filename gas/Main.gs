/**
 * Main entry point for the GAS Web App.
 * Handles incoming POST requests.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No post data received");
    }
    
    var payload = JSON.parse(e.postData.contents);
    
    // Auth Check
    var secret = payload.app_secret;
    if (!verifySecret(secret)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Unauthorized"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Read action
    if (payload.action === 'fetch_data') {
      var data = fetchData();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: data
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Write action
    if (payload.action === 'rollout_campaign') {
      var rolloutResult = withLock(function() {
        return rolloutCampaign(payload.campaign_id, payload.actor_employee_id);
      });
      return ContentService.createTextOutput(JSON.stringify(rolloutResult))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var result = withLock(function() {
      // Idempotency check
      if (checkEventExists(payload.request_id)) {
        return { success: true, message: "Already processed (idempotency)" };
      }
      
      // Update task and get previous status
      var statusBefore = updateTask(
        payload.task_id, 
        payload.status_after, 
        payload.memo, 
        payload.actor_employee_id
      );
      
      var eventId = Utilities.getUuid();
      
      // Append event to history
      appendEvent({
        event_id: eventId,
        task_id: payload.task_id,
        actor_employee_id: payload.actor_employee_id,
        event_type: 'status_changed',
        status_before: statusBefore,
        status_after: payload.status_after,
        memo: payload.memo || "",
        raw_input: payload.raw_input || "",
        ai_json: payload.ai_json ? JSON.stringify(payload.ai_json) : "",
        ai_confidence: payload.ai_json ? payload.ai_json.confidence : "",
        request_id: payload.request_id,
        source: payload.source || "web",
        created_at: new Date()
      });
      
      return { success: true, event_id: eventId };
    });
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    logError("system_error", error.message, e ? e.postData.contents : null, "gas", null);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function logError(errorType, message, payloadObj, source, requestId) {
  try {
    var sheet = getSheetByName("ErrorLogs");
    if (sheet) {
      sheet.appendRow([
        Utilities.getUuid(),
        requestId || "",
        source || "gas",
        errorType,
        message,
        payloadObj ? JSON.stringify(payloadObj) : "",
        new Date()
      ]);
    }
  } catch(e) {
    // Ignore error logging failure
  }
}
