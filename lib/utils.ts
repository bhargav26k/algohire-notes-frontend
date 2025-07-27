export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(' ')
}

export function highlightMentions(text: string, users: { id: string; username: string }[]): string {
  let highlightedText = text


  for (const u of users) {
    const escapedUsername = u.username.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`@${escapedUsername}\\b`, 'g')
    highlightedText = highlightedText.replace(
      regex,
      `<span class="inline-block bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">@${u.username}</span>`
    )
  }

  return highlightedText
}
