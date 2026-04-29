import { ref } from 'vue'
import { scoresApi } from '../api/scores'
import { useToast } from './useToast'

/**
 * Submits the player's score and exposes a shareable URL when the backend returns one.
 */
export function useScoreSubmission(opts: {
  score: () => number
  money: () => number
  population: () => number
  ticksPlayed: () => number
}) {
  const { notify } = useToast()
  const lastShareUrl = ref<string | null>(null)
  const busy = ref(false)

  async function submit(): Promise<void> {
    if (busy.value) return
    busy.value = true
    lastShareUrl.value = null
    try {
      const result = await scoresApi.submit({
        score: Math.round(opts.score()),
        moneyFinal: Math.max(0, opts.money()),
        population: opts.population(),
        ticksPlayed: Math.round(opts.ticksPlayed()),
      })
      notify(`Score soumis : ${result.score} pts`, 'success')

      try {
        const share = await scoresApi.share(result.uid)
        lastShareUrl.value = share.shareUrl
      } catch {
        /* share is best-effort */
      }
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Erreur lors de la soumission du score', 'error')
    } finally {
      busy.value = false
    }
  }

  async function copyShareUrl(): Promise<void> {
    if (!lastShareUrl.value) return
    try {
      await navigator.clipboard.writeText(lastShareUrl.value)
      notify('Lien copié dans le presse-papier', 'success')
    } catch {
      notify('Impossible de copier', 'error')
    }
  }

  function dismissShareUrl(): void {
    lastShareUrl.value = null
  }

  return { lastShareUrl, busy, submit, copyShareUrl, dismissShareUrl }
}
