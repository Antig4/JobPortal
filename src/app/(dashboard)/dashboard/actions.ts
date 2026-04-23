'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const updates: any = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    bio: formData.get('bio') as string,
    phone: formData.get('phone') as string,
    location: formData.get('location') as string,
    website: formData.get('website') as string,
    company_name: formData.get('company_name') as string,
    skills: (formData.get('skills') as string)?.split(',').map(s => s.trim()).filter(Boolean),
  }

  const avatarFile = formData.get('avatar') as File | null
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    updates.avatar_url = publicUrl
  }

  await supabase.from('profiles').update(updates).eq('id', user.id)

  revalidatePath('/dashboard/profile')
  revalidatePath('/', 'layout')
  redirect('/dashboard/profile?message=Profile updated successfully!')
}

export async function uploadVerificationDoc(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const file = formData.get('document') as File
  const docType = formData.get('document_type') as string

  if (!file || file.size === 0) return

  const ext = file.name.split('.').pop()
  const path = `${user.id}/${Date.now()}.${ext}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('verification_docs')
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: true
    })

  if (uploadError || !uploadData) {
    console.error('Storage upload error:', uploadError)
    redirect(`/dashboard/verify?message=${encodeURIComponent('Failed to upload document: ' + (uploadError?.message || 'Unknown error'))}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('verification_docs')
    .getPublicUrl(path)

  const { error: dbError } = await supabase.from('verification_requests').insert({
    user_id: user.id,
    document_url: publicUrl,
    document_type: docType,
    status: 'pending',
  })

  if (dbError) {
    console.error('Database insert error:', dbError)
    redirect(`/dashboard/verify?message=${encodeURIComponent('Database error: ' + dbError.message)}`)
  }

  await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', user.id)

  revalidatePath('/dashboard/verify')
  redirect('/dashboard/verify')
}

export async function applyToJob(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const jobId = formData.get('job_id') as string
  const coverLetter = formData.get('cover_letter') as string
  const resumeFile = formData.get('resume') as File

  let resumeUrl: string | null = null

  if (resumeFile && resumeFile.size > 0) {
    const ext = resumeFile.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    await supabase.storage
      .from('resumes')
      .upload(path, resumeFile, {
        contentType: resumeFile.type || 'application/octet-stream',
        upsert: true
      })
    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(path)
    resumeUrl = publicUrl
  }

  await supabase.from('applications').insert({
    job_id: jobId,
    seeker_id: user.id,
    cover_letter: coverLetter,
    resume_url: resumeUrl,
    status: 'applied',
  })

  revalidatePath('/dashboard/applications')
  redirect('/dashboard/applications')
}

export async function saveJob(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('saved_jobs').upsert({
    seeker_id: user.id,
    job_id: formData.get('job_id') as string,
  })
  revalidatePath('/dashboard/saved')
  revalidatePath('/dashboard/jobs')
}

export async function unsaveJob(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('saved_jobs')
    .delete()
    .eq('seeker_id', user.id)
    .eq('job_id', formData.get('job_id') as string)

  revalidatePath('/dashboard/saved')
}

export async function postJob(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('jobs').insert({
    employer_id: user.id,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    requirements: formData.get('requirements') as string,
    location: formData.get('location') as string,
    is_remote: formData.get('is_remote') === 'true',
    job_type: formData.get('job_type') as string,
    industry: formData.get('industry') as string,
    experience_level: formData.get('experience_level') as string,
    salary_min: Number(formData.get('salary_min')) || null,
    salary_max: Number(formData.get('salary_max')) || null,
    salary_currency: formData.get('salary_currency') as string || 'USD',
    status: 'pending_moderation',
  })

  revalidatePath('/dashboard/jobs')
  redirect('/dashboard/jobs')
}

export async function updateApplicationStatus(formData: FormData) {
  const supabase = await createClient()
  const applicationId = formData.get('application_id') as string
  const newStatus = formData.get('status') as string

  // Fetch application details before updating
  const { data: appData } = await supabase
    .from('applications')
    .select(`
      seeker_id,
      jobs ( title, employer_id )
    `)
    .eq('id', applicationId)
    .single()

  await supabase.from('applications')
    .update({ status: newStatus })
    .eq('id', applicationId)

  if (appData && (newStatus === 'shortlisted' || newStatus === 'rejected')) {
    const job = appData.jobs as unknown as { title: string; employer_id: string }
    const { data: seekerProfile } = await supabase.from('profiles').select('first_name, last_name').eq('id', appData.seeker_id).single()
    const { data: employerProfile } = await supabase.from('profiles').select('first_name, last_name, company_name').eq('id', job.employer_id).single()

    const seekerName = seekerProfile ? `${seekerProfile.first_name} ${seekerProfile.last_name}` : 'Job Seeker'
    const employerName = employerProfile ? `${employerProfile.first_name} ${employerProfile.last_name}` : 'Employer'
    const companyName = employerProfile?.company_name || 'our company'

    let messageContent = ''

    if (newStatus === 'shortlisted') {
      const dates = []
      const times = [
        '10:00 AM to 11:00 AM',
        '2:00 PM to 3:00 PM',
        '9:00 AM to 10:00 AM'
      ]
      for (let i = 1; i <= 3; i++) {
        const d = new Date()
        d.setDate(d.getDate() + i + 1) // +2, +3, +4 days
        const monthDayYear = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        const weekday = d.toLocaleDateString('en-US', { weekday: 'long' })
        dates.push(`${monthDayYear} (${weekday}) – ${times[i - 1]}`)
      }

      messageContent = `Subject: Invitation to interview at ${companyName}

Hi ${seekerName},

Thank you again for applying at ${companyName}.

After reviewing your application, we would like to invite you to the next interview round.

You will meet the interviewer to discuss the role’s responsibilities and learn more about life at ${companyName}.

Please let us know if you are available in any of the dates and time slots below and we’ll send you a calendar invitation. Please note that these times are in Philippine Standard Time (PST).

${dates.join('\n')}

If none of these time slots work with your schedule, please let me know and we’ll make other arrangements.

We will conduct the interview via video call. Further details will be provided in the calendar invitation.

I'm looking forward to hearing from you soon.

Thanks,
${employerName}`
    } else if (newStatus === 'rejected') {
      messageContent = `Subject: Update on your application for ${job.title}

Dear ${seekerName},

Thank you for taking the time to apply for the position at ${companyName}. We truly appreciate your interest in joining our team.

After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. We had a strong pool of candidates, and this was not an easy decision.

We appreciate the effort you put into your application and encourage you to apply again in the future should a suitable opportunity arise.

Thank you again for your interest in ${companyName}, and we wish you all the best in your job search.

Sincerely,
${employerName}`
    }

    if (messageContent) {
      await supabase.from('messages').insert({
        sender_id: job.employer_id,
        receiver_id: appData.seeker_id,
        content: messageContent,
        is_read: false
      })

      await supabase.from('notifications').insert({
        user_id: appData.seeker_id,
        type: 'application_update',
        title: `Application ${newStatus === 'shortlisted' ? 'Shortlisted' : 'Update'}`,
        content: `You have a new message regarding your application for ${job.title}.`,
        link: `/dashboard/messages?chat=${job.employer_id}`
      })
    }
  }

  revalidatePath('/dashboard/applicants')
  revalidatePath('/', 'layout')
}

export async function viewResumeAndMarkViewed(formData: FormData) {
  const supabase = await createClient()
  const applicationId = formData.get('application_id') as string
  
  await supabase.from('applications')
    .update({ status: 'viewed' })
    .match({ id: applicationId, status: 'applied' })

  revalidatePath('/dashboard/applicants')
  revalidatePath('/', 'layout')
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const receiverId = formData.get('receiver_id') as string
  const content = formData.get('content') as string

  if (!receiverId || !content || !content.trim()) return

  await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content: content.trim(),
    is_read: false,
  })

  await supabase.from('notifications').insert({
    user_id: receiverId,
    type: 'new_message',
    title: 'New Message',
    content: 'You have received a new message.',
    link: `/dashboard/messages?chat=${user.id}`,
  })

  revalidatePath('/dashboard/messages')
}

export async function openConversation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const chatId = formData.get('chat_id') as string
  if (!chatId) return

  await supabase.from('messages')
    .update({ is_read: true })
    .match({ receiver_id: user.id, sender_id: chatId, is_read: false })

  revalidatePath('/', 'layout')
  redirect(`/dashboard/messages?chat=${chatId}`)
}

export async function markNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  revalidatePath('/dashboard/notifications')
  revalidatePath('/', 'layout')
}

export async function markSingleNotificationRead(formData: FormData) {
  const supabase = await createClient()
  const notificationId = formData.get('notification_id') as string
  const redirectUrl = formData.get('redirect_url') as string

  if (notificationId) {
    await supabase.from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
  }

  revalidatePath('/dashboard/notifications')
  revalidatePath('/', 'layout')

  if (redirectUrl && redirectUrl !== '#') {
    redirect(redirectUrl)
  }
}

export async function incrementJobView(jobId: string) {
  const supabase = await createClient()
  
  // Try to use the recommended RPC function
  // Even if it doesn't exist yet, this is the proper way to handle it
  const { error: rpcError } = await supabase.rpc('increment_job_views', { job_id: jobId })
  
  if (!rpcError) {
    return
  }

  // Fallback logging for debug
  console.log(`RPC increment_job_views failed or missing, trying direct update for job ${jobId}`)

  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('views_count')
    .eq('id', jobId)
    .single()

  if (fetchError) {
    console.error('Error fetching job for view count:', fetchError)
    return
  }

  if (job) {
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ views_count: (job.views_count ?? 0) + 1 })
      .eq('id', jobId)
    
    if (updateError) {
      console.error('Error updating view count (likely RLS):', updateError)
      
      // Log an audit entry so the admin can see that a view was attempted
      await supabase.rpc('log_audit', {
        p_action: 'job_view_attempt',
        p_target_table: 'jobs',
        p_target_id: jobId,
        p_metadata: { error: updateError.message }
      })
    }
  }
}
