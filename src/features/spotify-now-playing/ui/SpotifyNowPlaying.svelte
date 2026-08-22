<script lang="ts">
  import { onMount } from 'svelte'
  import { Spring, prefersReducedMotion } from 'svelte/motion'
  import type { NowPlaying } from '../model/spotify'

  const SPOTIFY_PATH =
    'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z'

  // Fixed geometry for both states. Framer's `layout` measures the DOM and
  // FLIPs between whatever it finds; Svelte has no equivalent, so the two
  // states are given explicit dimensions and every value is interpolated by a
  // single spring. Fixed widths also match the original, which truncates its
  // title rather than letting the pill grow.
  const PILL = { w: 296, h: 54, radius: 999, disc: 40, discX: 7, discY: 7 }
  const CARD = { w: 304, h: 304, radius: 34, disc: 280, discX: 12, discY: -112 }

  /**
   * Space reserved on the pill's right for the equaliser. The title block ends
   * here rather than carrying a fixed max-width — both are absolutely
   * positioned, so a long title would otherwise run under the bars.
   */
  const PILL_RIGHT_RESERVE = 86

  let track = $state<NowPlaying | null>(null)
  let failed = $state(false)
  let expanded = $state(false)
  let cardEl = $state<HTMLElement | null>(null)

  // Snappy with a touch of overshoot — the closest feel to the original's
  // spring(stiffness 350, damping 28) on Svelte's normalised scale.
  const progress = new Spring(0, { stiffness: 0.22, damping: 0.72 })

  $effect(() => {
    progress.target = expanded ? 1 : 0
  })

  // Honour reduced motion by snapping instead of springing.
  $effect(() => {
    if (prefersReducedMotion.current) progress.set(expanded ? 1 : 0, { instant: true })
  })

  const p = $derived(progress.current)
  const lerp = (a: number, b: number) => a + (b - a) * p
  // Crossfade the two content sets past each other rather than at the midpoint,
  // so they are never both fully visible.
  const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
  const pillFade = $derived(clamp01(1 - p * 2.2))
  const cardFade = $derived(clamp01((p - 0.45) * 2.2))

  async function load() {
    try {
      const response = await fetch('/api/spotify')
      if (!response.ok) throw new Error(String(response.status))
      track = (await response.json()) as NowPlaying
      failed = false
    } catch {
      failed = true
    }
  }

  onMount(() => {
    load()
    // 30s sits inside the endpoint's 60s cache, so most polls never reach
    // Spotify at all.
    const id = setInterval(load, 30_000)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') load()
    }
    const onOutside = (event: MouseEvent) => {
      if (!expanded) return
      if (cardEl && !cardEl.contains(event.target as Node)) expanded = false
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && expanded) expanded = false
    }

    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('keydown', onKey)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('keydown', onKey)
    }
  })

  // Only spins once expanded. At 40px in the pill the rotation reads as a
  // rendering glitch rather than a turntable — it needs the vinyl to make sense.
  const spinning = $derived(
    Boolean(track?.isPlaying) && expanded && !prefersReducedMotion.current
  )
</script>

{#snippet soundBars(size: 'sm' | 'lg')}
  <span class="flex items-end gap-[3px] {size === 'lg' ? 'h-3.5' : 'h-3'}">
    {#each [0, 1, 2, 3] as i}
      <span
        class="w-[3px] rounded-full bg-[#1DB954] {track?.isPlaying
          ? 'animate-eq'
          : 'h-1/3'} motion-reduce:animate-none motion-reduce:h-1/3"
        style="animation-delay: {i * 120}ms"
      ></span>
    {/each}
  </span>
{/snippet}

{#snippet spotifyIcon(cls: string)}
  <svg viewBox="0 0 24 24" fill="currentColor" class={cls} aria-hidden="true">
    <path d={SPOTIFY_PATH} />
  </svg>
{/snippet}

{#if failed && !track}
  <!-- Renders nothing. An error about a music widget is noise on a portfolio. -->
{:else if !track}
  <!--
    Skeleton, laid out from the same PILL constants as the loaded state rather
    than sized by its content. Sharing the geometry is the point: a content-fit
    placeholder is narrower than the real pill, so the widget visibly jumped
    and re-centred the moment data arrived.
  -->
  <div
    class="relative overflow-hidden border border-border bg-surface select-none"
    style="
      width: {PILL.w}px;
      height: {PILL.h}px;
      border-radius: {PILL.radius}px;
    "
  >
    <div
      class="absolute flex animate-pulse items-center justify-center rounded-full bg-muted"
      style="
        left: {PILL.discX}px;
        top: {PILL.discY}px;
        width: {PILL.disc}px;
        height: {PILL.disc}px;
      "
    >
      {@render spotifyIcon('size-5 text-muted-foreground')}
    </div>

    <div
      class="absolute inset-y-0 left-14 flex flex-col justify-center leading-tight"
    >
      <span class="text-[13px] font-semibold text-muted-foreground">Spotify</span>
      <span class="text-[11px] text-muted-foreground/70">Loading activity…</span>
    </div>
  </div>
{:else}
  <div
    bind:this={cardEl}
    role="button"
    tabindex="0"
    aria-expanded={expanded}
    aria-label={expanded ? 'Collapse now playing' : 'Expand now playing'}
    onclick={() => (expanded = !expanded)}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        expanded = !expanded
      }
    }}
    class="relative z-40 cursor-pointer overflow-hidden border border-border bg-surface text-foreground shadow-lg ring-1 ring-black/5 select-none dark:ring-white/10"
    style="
      width: {lerp(PILL.w, CARD.w)}px;
      height: {lerp(PILL.h, CARD.h)}px;
      border-radius: {lerp(PILL.radius, CARD.radius)}px;
    "
  >
    <!-- Shared vinyl disc. One element across both states, so it grows and
         rises continuously instead of crossfading between two copies.
         The card clips its top edge — that crop is the design. -->
    <div
      class="absolute"
      style="
        left: {lerp(PILL.discX, CARD.discX)}px;
        top: {lerp(PILL.discY, CARD.discY)}px;
        width: {lerp(PILL.disc, CARD.disc)}px;
        height: {lerp(PILL.disc, CARD.disc)}px;
      "
    >
      {#if track.albumArt}
        <img
          src={track.albumArt}
          alt=""
          class="size-full rounded-full object-cover {spinning
            ? 'animate-[spin_15s_linear_infinite]'
            : ''}"
        />
      {:else}
        <span class="flex size-full items-center justify-center rounded-full bg-muted">
          {@render spotifyIcon('size-1/3 text-[#1DB954]')}
        </span>
      {/if}

      <!-- Metallic spindle, only meaningful at vinyl scale. -->
      <div
        class="pointer-events-none absolute inset-0 m-auto flex items-center justify-center rounded-full border-[3px] border-[#A0A4B8] bg-gradient-to-b from-[#D2D5E5] via-[#9DA1B6] to-[#717588] shadow-md dark:border-neutral-600 dark:from-neutral-700 dark:to-neutral-900"
        style="width: {48 * p}px; height: {48 * p}px; opacity: {cardFade}"
      >
        <div
          class="rounded-full border border-neutral-400 bg-surface shadow-inner dark:border-neutral-700"
          style="width: {18 * p}px; height: {18 * p}px"
        ></div>
      </div>
    </div>

    <!-- Pill content. Ends where the right-hand element begins, so a long
         title truncates instead of running underneath it. -->
    <div
      class="pointer-events-none absolute inset-y-0 left-14 flex flex-col justify-center leading-tight"
      style="
        right: {PILL_RIGHT_RESERVE}px;
        opacity: {pillFade};
        visibility: {pillFade === 0 ? 'hidden' : 'visible'};
      "
    >
      <span class="truncate text-[13px] font-semibold">
        {track.title ?? 'Offline'}
      </span>
      <span class="truncate text-[11px] text-muted-foreground">
        {track.artist ?? 'Not listening right now'}
      </span>
    </div>

    <div
      class="pointer-events-none absolute inset-y-0 right-3.5 flex items-center"
      style="opacity: {pillFade}; visibility: {pillFade === 0 ? 'hidden' : 'visible'}"
    >
      {#if track.isPlaying}
        {@render soundBars('sm')}
      {/if}
    </div>

    <!-- Card content -->
    <div
      class="absolute inset-x-0 flex flex-col items-center px-3 text-center"
      style="top: {CARD.disc + CARD.discY + 8}px; opacity: {cardFade}; visibility: {cardFade === 0 ? 'hidden' : 'visible'}"
    >
      <div class="mb-1.5 flex items-center justify-center">
        {@render soundBars('lg')}
      </div>

      <!-- Artist above title, matching the original's `order-first`. -->
      <span class="max-w-[250px] truncate text-sm font-medium tracking-wide text-muted-foreground">
        {track.artist ?? 'Not listening right now'}
      </span>
      <span class="max-w-[250px] truncate text-lg font-bold tracking-tight">
        {track.title ?? 'Offline'}
      </span>

      <div class="my-2.5 h-[2px] w-7 rounded-full bg-muted-foreground/40"></div>

      <a
        href={track.songUrl ?? 'https://open.spotify.com'}
        target="_blank"
        rel="noopener"
        onclick={(e) => e.stopPropagation()}
        class="group/link flex items-center gap-1.5 text-xs font-bold text-[#1DB954] transition-colors hover:text-[#1ed760]"
      >
        <span>Open Song</span>
        {@render spotifyIcon('size-3.5 transition-transform group-hover/link:scale-110')}
      </a>
    </div>
  </div>
{/if}
