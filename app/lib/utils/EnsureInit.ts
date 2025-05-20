export async function ensureGapiClientInitialized(apiKey: string): Promise<void> {
    if (!window.gapi) {
      throw new Error('gapi not loaded')
    }
  
    if (!window.gapi.client) {
      await new Promise<void>((resolve) => {
        window.gapi.load('client', async () => {
          await window.gapi.client.init({ apiKey })
          resolve()
        })
      })
    }
  }
  