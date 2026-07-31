import { FieldValue } from 'firebase-admin/firestore'

export async function writeAuditLog(db, admin, action, resourceType, resourceId, summary, details = {}) {
  try {
    await db.collection('auditLogs').add({
      action,
      resourceType,
      resourceId,
      summary,
      details,
      actorUid: admin.uid,
      actorEmail: admin.email,
      createdAt: FieldValue.serverTimestamp(),
    })
  } catch (error) {
    // A secondary audit failure must never make a successful content mutation
    // look unsuccessful to the editor.
    console.error('Unable to write audit log:', error)
  }
}
