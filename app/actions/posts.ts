'use server'

import { revalidatePath } from 'next/cache'
import { approvePost, rejectPost } from '@/lib/airtable'

export async function handleApprove(recordId: string, clientSlug: string) {
  await approvePost(recordId)
  revalidatePath(`/portal/${clientSlug}`)
}

export async function handleReject(
  recordId: string,
  feedback: string,
  clientSlug: string
) {
  if (!feedback.trim()) {
    throw new Error('El feedback no puede estar vacío al rechazar un post.')
  }
  await rejectPost(recordId, feedback)
  revalidatePath(`/portal/${clientSlug}`)
}
