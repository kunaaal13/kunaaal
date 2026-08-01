<script lang="ts">
  import { onMount, tick } from 'svelte'
  import {
    groupResults,
    search,
    type SearchItem,
  } from '../model/search-index'

  let { items = [] }: { items: SearchItem[] } = $props()

  let open = $state(false)
  let query = $state('')
  let activeIndex = $state(0)
  let inputEl = $state<HTMLInputElement | null>(null)
  let listEl = $state<HTMLElement | null>(null)

  const results = $derived(search(items, query))
  const groups = $derived(groupResults(results))
  // Flat order drives keyboard nav; the grouped view is only for rendering.
  const flat = $derived(groups.flatMap((g) => g.items))

  // Clamp rather than reset: as results narrow, keep the selection in range
  // instead of yanking it back to the top on every keystroke.
  $effect(() => {
    if (activeIndex >= flat.length) activeIndex = Math.max(0, flat.length - 1)
  })

  function show() {
    open = true
    query = ''
    activeIndex = 0
    tick().then(() => inputEl?.focus())
  }

  function hide() {
    open = false
  }

  function go(item: SearchItem | undefined) {
    if (!item) return
    hide()
    if (item.href.startsWith('http')) window.open(item.href, '_blank', 'noopener')
    else window.location.href = item.href
  }

  function onKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      open ? hide() : show()
      return
    }
    if (!open) return

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        hide()
        break
      case 'ArrowDown':
        event.preventDefault()
        activeIndex = (activeIndex + 1) % Math.max(1, flat.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        activeIndex = (activeIndex - 1 + flat.length) % Math.max(1, flat.length)
        break
      case 'Enter':
        event.preventDefault()
        go(flat[activeIndex])
        break
    }
  }

  // Keep the highlighted row in view during keyboard nav.
  $effect(() => {
    if (!open) return
    activeIndex
    listEl
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  })

  onMount(() => {
    window.addEventListener('keydown', onKeydown)
    // The mobile search button is plain HTML elsewhere in the page; it opens
    // the menu through this event rather than needing its own island.
    window.addEventListener('command-menu:open', show)
    return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('command-menu:open', show)
    }
  })
</script>

<button
  type="button"
  onclick={show}
  class="flex h-8 items-center gap-1.5 rounded-md px-1.5
         text-muted-foreground transition-colors hover:bg-accent hover:text-foreground
         focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none max-sm:hidden"
  aria-label="Search"
>
  <svg
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
  <!-- Two chips rather than one "⌘K" string: it reads as two physical keys. -->
  <kbd
    class="flex size-5 items-center justify-center rounded bg-muted font-sans text-xs"
    >⌘</kbd
  >
  <kbd
    class="flex size-5 items-center justify-center rounded bg-muted font-sans text-xs"
    >K</kbd
  >
</button>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-100 flex items-start justify-center bg-black/40 p-4 pt-[10vh] backdrop-blur-sm"
    onclick={(e) => e.target === e.currentTarget && hide()}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      class="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
    >
      <div class="flex items-center gap-2 border-b border-line px-3">
        <svg
          class="size-4 shrink-0 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          bind:this={inputEl}
          bind:value={query}
          type="text"
          placeholder="Search projects, posts, pages…"
          class="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          autocomplete="off"
          spellcheck="false"
        />
        <kbd
          class="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
        >
          esc
        </kbd>
      </div>

      <div bind:this={listEl} class="max-h-[60vh] overflow-y-auto p-2">
        {#if flat.length === 0}
          <p class="px-3 py-8 text-center text-sm text-muted-foreground">
            No results for “{query}”
          </p>
        {:else}
          {#each groups as group (group.group)}
            <div class="mb-2 last:mb-0">
              <p
                class="px-2 py-1.5 font-mono text-xs tracking-wide text-muted-foreground uppercase"
              >
                {group.group}
              </p>
              <ul>
                {#each group.items as item (item.id)}
                  {@const index = flat.indexOf(item)}
                  <li>
                    <a
                      href={item.href}
                      data-active={index === activeIndex}
                      onmouseenter={() => (activeIndex = index)}
                      onclick={(e) => {
                        e.preventDefault()
                        go(item)
                      }}
                      class="flex flex-col gap-0.5 rounded-md px-2 py-2 text-sm
                             data-[active=true]:bg-accent"
                    >
                      <span class="font-medium">{item.title}</span>
                      {#if item.description}
                        <span class="line-clamp-1 text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      {/if}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}
