<script lang="ts">
  import { onMount } from 'svelte'

  let { timeZone = 'Asia/Kolkata' }: { timeZone?: string } = $props()

  let now = $state<Date | null>(null)

  const formatted = $derived(
    now
      ? new Intl.DateTimeFormat('en-US', {
          timeZone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(now)
      : // Em-space placeholders keep the row from reflowing when the clock
        // arrives, since the font is tabular.
        '--:--'
  )

  const offset = $derived.by(() => {
    if (!now) return ''
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    }).formatToParts(now)
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? ''
  })

  onMount(() => {
    now = new Date()
    // 30s rather than 1s: the display only shows minutes, so a faster tick
    // would burn wakeups to render identical output.
    const id = setInterval(() => (now = new Date()), 30_000)
    return () => clearInterval(id)
  })
</script>

<span class="tabular-nums">{formatted}</span>
{#if offset}<span class="text-muted-foreground">({offset})</span>{/if}
