import crypto from "crypto"
import { prisma } from "@collablearn/database"

interface WebhookEvent {
  event: string
  workspaceId: string
  data: any
  timestamp: Date
}

// Trigger webhook for an event
export async function triggerWebhook(
  workspaceId: string,
  event: string,
  data: any
) {
  try {
    // Find webhooks that are subscribed to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        workspaceId,
        events: {
          has: event,
        },
        active: true,
      },
    })

    if (webhooks.length === 0) return

    const payload: WebhookEvent = {
      event,
      workspaceId,
      data,
      timestamp: new Date(),
    }

    // Send to all matching webhooks
    const deliveryPromises = webhooks.map((webhook) =>
      deliverWebhook(webhook, payload)
    )

    await Promise.allSettled(deliveryPromises)
  } catch (error) {
    console.error("Error triggering webhook:", error)
  }
}

// Deliver webhook to endpoint
async function deliverWebhook(webhook: any, payload: WebhookEvent) {
  const delivery = await prisma.webhookDelivery.create({
    data: {
      webhookId: webhook.id,
      payload: JSON.stringify(payload),
      status: "pending",
    },
  })

  try {
    const signature = generateSignature(
      JSON.stringify(payload),
      webhook.secret
    )

    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "User-Agent": "CollabLearn-Webhooks/1.0",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000), // 30s timeout
    })

    const responseBody = await response.text()

    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: response.ok ? "success" : "failed",
        statusCode: response.status,
        response: responseBody,
        deliveredAt: new Date(),
      },
    })

    // Update webhook stats
    await prisma.webhook.update({
      where: { id: webhook.id },
      data: {
        lastDeliveryAt: new Date(),
        ...(response.ok
          ? { successCount: { increment: 1 } }
          : { failureCount: { increment: 1 } }),
      },
    })

    return response.ok
  } catch (error: any) {
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "failed",
        response: error.message,
        deliveredAt: new Date(),
      },
    })

    await prisma.webhook.update({
      where: { id: webhook.id },
      data: {
        failureCount: { increment: 1 },
      },
    })

    // Disable webhook after 10 consecutive failures
    if (webhook.failureCount >= 10) {
      await prisma.webhook.update({
        where: { id: webhook.id },
        data: { active: false },
      })
    }

    return false
  }
}

// Generate HMAC signature for webhook verification
function generateSignature(payload: string, secret?: string): string {
  if (!secret) return ""
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

// Verify webhook signature
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
