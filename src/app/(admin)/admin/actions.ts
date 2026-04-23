'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveVerification(formData: FormData) {
  const supabase = await createClient()
  const requestId = formData.get('requestId') as string
  const userId = formData.get('userId') as string

  await supabase
    .from('verification_requests')
    .update({ status: 'approved' })
    .eq('id', requestId)

  await supabase
    .from('profiles')
    .update({ verification_status: 'verified' })
    .eq('id', userId)

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'verification_update',
    title: 'Account Verified!',
    content: 'Congratulations! Your account has been verified. You now have full access to the platform.',
    link: '/dashboard',
  })

  await supabase.rpc('log_audit', {
    p_action: 'approve_verification',
    p_target_table: 'verification_requests',
    p_target_id: requestId,
  })

  revalidatePath('/admin/verification')
}

export async function rejectVerification(formData: FormData) {
  const supabase = await createClient()
  const requestId = formData.get('requestId') as string
  const userId = formData.get('userId') as string
  const notes = formData.get('notes') as string

  await supabase
    .from('verification_requests')
    .update({ status: 'rejected', admin_notes: notes })
    .eq('id', requestId)

  await supabase
    .from('profiles')
    .update({ verification_status: 'rejected', verification_notes: notes })
    .eq('id', userId)

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'verification_update',
    title: 'Verification Update',
    content: `Your verification was not approved. Reason: ${notes || 'Documents did not meet requirements.'}`,
    link: '/dashboard/verify',
  })

  await supabase.rpc('log_audit', {
    p_action: 'reject_verification',
    p_target_table: 'verification_requests',
    p_target_id: requestId,
    p_metadata: { notes },
  })

  revalidatePath('/admin/verification')
}

export async function approveJob(formData: FormData) {
  const supabase = await createClient()
  const jobId = formData.get('jobId') as string

  await supabase
    .from('jobs')
    .update({ status: 'active' })
    .eq('id', jobId)

  await supabase.rpc('log_audit', {
    p_action: 'approve_job',
    p_target_table: 'jobs',
    p_target_id: jobId,
  })

  revalidatePath('/admin/jobs')
}

export async function rejectJob(formData: FormData) {
  const supabase = await createClient()
  const jobId = formData.get('jobId') as string

  await supabase
    .from('jobs')
    .update({ status: 'closed' })
    .eq('id', jobId)

  await supabase.rpc('log_audit', {
    p_action: 'reject_job',
    p_target_table: 'jobs',
    p_target_id: jobId,
  })

  revalidatePath('/admin/jobs')
}

export async function updateUserRole(formData: FormData) {
  const supabase = await createClient()
  const userId = formData.get('userId') as string
  const role = formData.get('role') as string

  await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  await supabase.rpc('log_audit', {
    p_action: 'update_user_role',
    p_target_table: 'profiles',
    p_target_id: userId,
    p_metadata: { role },
  })

  revalidatePath('/admin/users')
}
