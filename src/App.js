import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'
import NEARLogo from './assets/logo-black.svg'
import Robot from './assets/robot-idle.gif'

import getConfig from './config'
const { networkId } = getConfig('development')

export default function App() {
  // use React Hooks to store greeting in component state
  const [greeting, set_greeting] = React.useState()

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(true)

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        window.contract.get_greeting({ account_id: window.accountId })
          .then(greetingFromContract => {
            set_greeting(greetingFromContract)
          })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to NEAR!</h1>
        <p>
          To make use of the NEAR blockchain, you need to sign in. The button
          below will sign you in using NEAR Wallet.
        </p>
        <p>
          By default, when your app runs in "development" mode, it connects
          to a test network ("testnet") wallet. This works just like the main
          network ("mainnet") wallet, but the NEAR Tokens on testnet aren't
          convertible to other currencies – they're just for testing!
        </p>
        <p>
          Go ahead and click the button below to try it out:
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main >
      <div id="header">
      <img id="spinlogo"src={NEARLogo} style={{width:`60px`}}></img>
      <code style={{borderRadius: `0px`, textAlign:`right`}}>{window.contract.contractId}</code>
        <h1>
          Hello, 
          {' '/* React trims whitespace around tags; insert literal space character when needed */}
          <label
            htmlFor="greeting"
            style={{
              color: 'var(--primary)',
              borderBottom: '2px solid var(--gray)'
            }}
          >
            {greeting}
          </label>
        
          !
          
          
        </h1>
        
        
        </div>
        <form onSubmit={async event => {
          event.preventDefault()

          // get elements from the form using their id attribute
          const { fieldset, greeting } = event.target.elements

          // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
          const newGreeting = greeting.value

          // disable the form while the value gets updated on-chain
          fieldset.disabled = true

          try {
            // make an update call to the smart contract
            await window.contract.set_greeting({
              // pass the value that the user entered in the greeting field
              message: newGreeting
            })
          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Check your browser console for more info.'
            )
            throw e
          } finally {
            // re-enable the form, whether the call succeeded or failed
            fieldset.disabled = false
          }

          // update local `greeting` variable to match persisted value
          set_greeting(newGreeting)

          // show Notification
          setShowNotification(true)

          // remove Notification again after css animation completes
          // this allows it to be shown again next time the form is submitted
          setTimeout(() => {
            setShowNotification(false)
          }, 11000)
        }}>
          <fieldset id="fieldset" >
            <label
              htmlFor="greeting"
              style={{
                display: 'block',
                color: 'var(--light gray)',
                marginBottom: '0.5em'
              }}
            >
              Change your name
            </label>
            <div style={{ display: 'flex' }}>
              <input
                autoComplete="off"
                defaultValue={greeting}
                id="greeting"
                onChange={e => setButtonDisabled(e.target.value === greeting)}
                style={{ flex: 1 }}
              />
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '0 5px 5px 0' }}
              >
                Save
              </button>
            </div>
          </fieldset>
        </form>
        <div style={{display:`flex`}}>
        
        <div style={{display:`block`}}>
        <p>
          Congrats! You've signed your name as <code>{greeting}</code> on the NEAR blockchain.
        </p>
        <p>It's associated with the account <code>{window.accountId}</code></p>
        </div>
    
        <img id="robot" src={Robot}></img>

        </div>

      </main>
      {showNotification && <Notification />}
      <footer>robot sprite from: <a>https://opengameart.org/content/pixel-robot</a></footer>
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'set_greeting' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
