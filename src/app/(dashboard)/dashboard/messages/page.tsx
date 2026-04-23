import { createClient } from '@/lib/supabase/server'
import { MessageSquare, Send, ArrowLeft } from 'lucide-react'
import { sendMessage, openConversation } from '../actions'
import { SubmitButton } from '@/components/submit-button'

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ chat?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  const chatId = params.chat

  const { data: profile } = await supabase.from('profiles').select('verification_status').eq('id', user!.id).single()
  const isVerified = profile?.verification_status === 'verified'

  if (!isVerified) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24">
        <MessageSquare className="h-14 w-14 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-2">You must be <a href="/dashboard/verify" className="text-primary font-semibold underline">verified</a> to send and receive messages.</p>
      </div>
    )
  }

  // Get conversations: distinct people the user has messaged or received from
  const { data: sent } = await supabase
    .from('messages')
    .select('*, profiles:receiver_id(id, first_name, last_name, role, avatar_url)')
    .eq('sender_id', user!.id)
    .order('created_at', { ascending: false })

  const { data: received } = await supabase
    .from('messages')
    .select('*, profiles:sender_id(id, first_name, last_name, role, avatar_url)')
    .eq('receiver_id', user!.id)
    .order('created_at', { ascending: false })

  // Build unique conversations by counterpart ID
  const conversationMap = new Map<string, { id: string; first_name: string; last_name: string; role: string; avatar_url?: string; lastMessage: string; unread: boolean }>()

  const allMessages = [...(sent ?? []), ...(received ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  allMessages.forEach(msg => {
    let counterpartId = ''
    let counterpartProfile = null
    let isUnread = false

    if (msg.sender_id === user!.id) {
       counterpartId = msg.receiver_id
       counterpartProfile = msg.profiles as unknown as { id: string; first_name: string; last_name: string; role: string; avatar_url: string }
    } else {
       counterpartId = msg.sender_id
       counterpartProfile = msg.profiles as unknown as { id: string; first_name: string; last_name: string; role: string; avatar_url: string }
       isUnread = !msg.is_read
    }

    if (counterpartId && !conversationMap.has(counterpartId)) {
      if (counterpartProfile) {
        conversationMap.set(counterpartId, { ...counterpartProfile, lastMessage: msg.content, unread: isUnread })
      }
    }
  })

  let chatMessages: any[] = []
  let chatCounterpart: any = null

  if (chatId) {
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${user!.id})`)
      .order('created_at', { ascending: true })

    chatMessages = messages ?? []

    // Mark received messages as read
    const unreadMessages = chatMessages.filter(m => m.receiver_id === user!.id && !m.is_read)
    if (unreadMessages.length > 0) {
      await supabase.from('messages').update({ is_read: true }).in('id', unreadMessages.map(m => m.id))
    }

    chatCounterpart = conversationMap.get(chatId)
    if (!chatCounterpart) {
      const { data: counterpartProfile } = await supabase.from('profiles').select('id, first_name, last_name, role, avatar_url').eq('id', chatId).single()
      if (counterpartProfile) chatCounterpart = counterpartProfile
    }
  }

  const conversations = Array.from(conversationMap.values())

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-1">Your conversations with verified professionals.</p>
      </div>

      {chatId && chatCounterpart ? (
        <div className="rounded-2xl border border-border bg-background flex flex-col h-[600px]">
          <div className="flex items-center gap-4 border-b border-border p-4 bg-muted/10 rounded-t-2xl">
            <a href="/dashboard/messages" className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </a>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
              {chatCounterpart.avatar_url ? <img src={chatCounterpart.avatar_url} alt="A" className="h-full w-full object-cover" /> : <>{chatCounterpart.first_name?.[0]}{chatCounterpart.last_name?.[0]}</>}
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">{chatCounterpart.first_name} {chatCounterpart.last_name}</h2>
              <p className="text-xs text-muted-foreground capitalize">{chatCounterpart.role}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 opacity-20 mb-3" />
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1">Send the first message to start the conversation.</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.sender_id === user!.id
                return (
                  <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                      <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <form action={sendMessage} className="p-4 border-t border-border bg-muted/5 rounded-b-2xl flex items-end gap-3">
            <input type="hidden" name="receiver_id" value={chatId} />
            <textarea
              name="content"
              placeholder="Type a message..."
              required
              rows={2}
              className="flex-1 rounded-xl bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm"
            />
            <SubmitButton className="bg-primary text-primary-foreground p-3.5 mb-[1px] rounded-xl hover:bg-primary/90 transition-colors shadow-sm" pendingText="...">
              <Send className="h-5 w-5" />
            </SubmitButton>
          </form>
        </div>
      ) : (
        <>
          {conversations.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-border">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground">No messages yet. Conversations start when employers shortlist your application.</p>
            </div>
          ) : (
            <div className="space-y-2 rounded-2xl border border-border bg-background overflow-hidden divide-y divide-border">
              {conversations.map(conv => (
                <form key={conv.id} action={openConversation}>
                  <input type="hidden" name="chat_id" value={conv.id} />
                  <button type="submit" className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors cursor-pointer group text-left">
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                      {conv.avatar_url ? <img src={conv.avatar_url} alt="A" className="h-full w-full object-cover" /> : <>{conv.first_name?.[0]}{conv.last_name?.[0]}</>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">{conv.first_name} {conv.last_name}</p>
                        <span className="text-xs text-muted-foreground capitalize">({conv.role})</span>
                        {conv.unread && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${conv.unread ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{conv.lastMessage}</p>
                    </div>
                    <div className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </div>
                  </button>
                </form>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
             <h2 className="font-bold">Message a Contact</h2>
             <p className="text-sm text-muted-foreground">Select a conversation above to start chatting with verified employers and candidates.</p>
          </div>
        </>
      )}
    </div>
  )
}
