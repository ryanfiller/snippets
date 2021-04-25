<script>
  import { onMount } from 'svelte'
  import { colors, themes } from 'styles.js'
  import { getCustomProperty, setCustomProperty, setColors, setTheme } from 'helpers'

  const LS_KEY = 'user-color-scheme'
  const DOM_ATTR = `data-${LS_KEY}`
  const CSS_PROP = LS_KEY

  const getOpposite = (mode) => mode === 'dark' ? 'light' : 'dark'

  const setPreference = (newPreference, getCustomProperty, setCustomProperty, LS_KEY, DOM_ATTR, CSS_PROP) => {
    if (window) {
      if (newPreference) {
        document.documentElement.setAttribute(DOM_ATTR, newPreference)
        setCustomProperty(CSS_PROP, newPreference)
        window.localStorage.setItem(LS_KEY, newPreference)
      } else {
        const OS = getCustomProperty(CSS_PROP)
        document.documentElement.setAttribute(DOM_ATTR, OS)
        setCustomProperty(CSS_PROP, OS)
      }
    }
  }

  let toggleColorScheme
  onMount(() => {
    currentColorScheme = getCustomProperty(CSS_PROP)
    
    toggleColorScheme = event => {
      event.preventDefault()

      const currentPreference = window.localStorage.getItem(LS_KEY) || currentColorScheme
      const newPrefernece = getOpposite(currentPreference)

      setPreference(newPrefernece)
    }
  })
</script>

<svelte:head>
  {@html `
    <style>
      :root {
        --${CSS_PROP}: 'light';
        ${setTheme(themes.light)}
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --${CSS_PROP}: 'dark';
        }

        :root:not([data-user-color-scheme]) {
          ${setTheme(themes.dark)}
        }
      }

      [data-user-color-scheme='dark'] {
        ${setTheme(themes.dark)}
      }
    </style>
  `}

  {@html `
    <script>
      document.body.removeAttribute('data-no-js')
      
      var setPreference = ${setPreference.toString()}
      var getCustomProperty = ${getCustomProperty.toString()}
      var setCustomProperty = ${setCustomProperty.toString()}
      var existingUserPrefernece = window.localStorage.getItem('${LS_KEY}')
      setCustomProperty('${CSS_PROP}', getCustomProperty('${CSS_PROP}'))
      setPreference(existingUserPrefernece, setCustomProperty, '${LS_KEY}', '${DOM_ATTR}', '${CSS_PROP}')
    </script>
  `}
</svelte:head>

<style>
  :global([data-no-js] button) {
    display: none;
  }

  :global([style*='--user-color-scheme:light'] button) {
    ...
  }

  :global([style*='--user-color-scheme:dark'] button) {
    ...
  }

</style>

<button on:click={toggleColorScheme}>
  ...
</button>
