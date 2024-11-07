var loggedIn;
let pubkey = "";
let username = "";
let avatarURL = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// Access the functions from the global object
const { relayInit, generateSecretKey, getPublicKey, SimplePool } = NostrTools;
const nip19 = NostrTools.nip19;

checkLoginStatus();
displayUserInfo();

function checkLoginStatus() {
    const userInfo = JSON.parse(localStorage.getItem('__nostrlogin_accounts'));
    if (userInfo && userInfo.length > 0) {
        loggedIn = true
    } else {
        loggedIn = false
    }
}

function updateButtonVisibility() {
    const loginButton = document.getElementById('signupButton');
    const logoutButton = document.getElementById('logoutButton');
    const setRelays = document.getElementById('setrelays');
    const landing = document.getElementById('landing');
    const mainContainer = document.getElementById('main-container');

    if (loggedIn) {
        loginButton.style.display = 'none';
        setRelays.style.display = 'block';
        logoutButton.style.display = 'block';
        landing.style.display = 'none';
        mainContainer.style.display = 'block';

    } else {
        loginButton.style.display = 'block';
        setRelays.style.display = 'none';
        logoutButton.style.display = 'none';
        landing.style.display = 'block';
        mainContainer.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    if (window.nostr) {

        function onSignupClick() {
            document.dispatchEvent(new CustomEvent('nlLaunch', { detail: 'welcome' }));
        }
        document.getElementById('signupButton').addEventListener('click', onSignupClick);

        function onLogoutClick() {
            document.dispatchEvent(new Event("nlLogout"))
        }
        document.getElementById('logoutButton').addEventListener('click', onLogoutClick);
        updateButtonVisibility();

    } else {
        console.error('Nostr Login script is not loaded correctly.');
    }
});

/// methods 
document.addEventListener('nlAuth', (e) => {
    console.log("nlauth", e)
    if (e.detail.type === 'login' || e.detail.type === 'signup') {
        if (!loggedIn) {
            console.log("Logging In")
            loggedIn = true
            updateButtonVisibility(); // login/logout button visibility
            setTimeout(function () {
                loadUser();
            }, 200);
        }
    } else {
        if (loggedIn) {
            setTimeout(function () {
                console.log("logoff section")
                loggedIn = false
                clearUserInfo();
                document.dispatchEvent(new Event("nlLogout")); // logout from nostr-login
                updateButtonVisibility(); // login/logout button visibility
            }, 200);
        }
    }
})

function loadUser() {
    if (window.nostr) {
        window.nostr.getPublicKey().then(function (pubkey) {
            if (pubkey) {
                loggedIn = true
                // npubkey = pubkey
                console.log("fetched pubkey", pubkey)
                displayUserInfo();
                updateButtonVisibility(); // login/logout button visibility         
            }
        }).catch((err) => {
            console.log("LoadUser Err", err);
            console.log("logoff section")
            loggedIn = false
            document.dispatchEvent(new Event("nlLogout")); // logout from nostr-login
            //logOff()
            updateButtonVisibility(); // login/logout button visibility
        });
    }
}

function displayUserInfo() {
    setTimeout(() => { // Adding a delay to ensure data is available
        // Assuming userInfo is stored in localStorage or accessible through the event
        const userInfo = JSON.parse(localStorage.getItem('__nostrlogin_accounts'));
        try {
            if (userInfo && userInfo.length > 0) {
                const user = userInfo[0];
                // get npub to use with link to nostr
                pubkey = user.pubkey
                let npub = nip19.npubEncode(user.pubkey)
                var npubElement = document.getElementById('npub');

                const avatarElement = document.getElementById('avatar');
                avatarElement.style.display = 'block';

                // set avatar
                if (user.picture === undefined) {
                    // use default avatar pic
                    avatarElement.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                } else {
                    avatarElement.src = user.picture;
                    avatarURL = user.picture;
                }

                // set username
                username = user.name;
                if (username === undefined) {
                    username = npub;
                }
                // set welcome message
                npubElement.innerHTML = "Hello, <a href='https://njump.me/" + npub + "'>" + username + "</a>";
            } else {
                console.log("No user info available (empty array)");
            }
        } catch (error) {
            console.log("Error parsing userInfo:", error);
        }
    }, 200); // Delay to ensure data is loaded
}

function clearUserInfo() {
    loggedIn = false;
    document.getElementById('npub').innerHTML = '';
    document.getElementById('avatar').style.display = 'none';
    document.getElementById('setrelays').style.display = 'none';
    updateButtonVisibility(); // login/logout button visibility
}

class NostrAuthClient {
    /**
     * Construct a new NostrAuthClient instance.
     * @param {string} pubkey - Nostr public key of the user.
     */
    constructor(pubkey) {
      this.publicKey = pubkey;
    }
  
    // Generate a Nostr event for HTTP authentication
    async createAuthEvent(url, method, payload = null) {
      const tags = [
        ['u', url],
        ['method', method.toUpperCase()]
      ];
  
      // If payload exists, add its SHA256 hash
      if (payload) {
        const payloadHash = await this.sha256(payload);
        tags.push(['payload', payloadHash]);
      }
  
      const event = {
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: tags,
        content: '',
        pubkey: this.publicKey
      };
      console.log('event: ', event)

      // Calculate event ID
      event.id = await this.calculateId(event);
  
      // Sign the event
      event.sig = await window.nostr.signEvent(event);
      return event;
    }
  
    // Utility functions for cryptographic operations
    async sha256(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  
    async calculateId(event) {
      const eventData = JSON.stringify([
        0,
        event.pubkey,
        event.created_at,
        event.kind,
        event.tags,
        event.content
      ]);
      return await this.sha256(eventData);
    }
  }
  
// Make an authenticated request
async function fetchWithNostrAuth(url, options = {}) {
    const method = options.method || 'GET';
    const payload = options.body || null;
  
    const client = new NostrAuthClient(pubkey);
    const authEvent = await client.createAuthEvent(url, method, payload);
  
    // Convert event to base64
    const authHeader = 'Nostr ' + btoa(JSON.stringify(authEvent));
    console.log('Inside nostr.js Authorization headers: ', authHeader )
  
    // Add auth header to request
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', authHeader);
  
    // Make the request
    return fetch(url, {
      ...options,
      headers
    });
  }
  
// Helper function to get base domain/host with port if needed
function getBaseUrl() {
  // Get the full host (includes port if it exists)
  const host = window.location.host;
  // Get the protocol (http: or https:)
  const protocol = window.location.protocol;
  // Combine them
  return `${protocol}//${host}`;
}

// in json body, include username, profile pic and any preferred relays
// so that we don't need to refetch data already captured by current client.
async function handleButtonClick() {

  const roomName = "TestRoom";
  const preferredRelays = ['wss://hivetalk.nostr1.com']
  const isModerator = true;

  try {
      const baseUrl = getBaseUrl();
      const response = await fetchWithNostrAuth(`${baseUrl}/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            room: roomName,
            username: username,
            avatarURL: avatarURL,
            relays: preferredRelays,
            isPresenter: isModerator,
          }),
      });

        if (response.status === 302) {
          console.log("response status is 302")
          // Get the redirect URL from the response
          const data = await response.json();
          // Redirect to the protected page
          window.location.href = data.redirectUrl;

        } else if (response.ok) {
          console.log("reponse.ok", response.ok)
          // Handle successful response that isn't a redirect
          const protectedContent = await response.json();
          console.log(protectedContent['message'], protectedContent['redirectUrl'])
          document.getElementById('protected').innerHTML = protectedContent['message'];
        } else {
          console.error('Login failed');
        }

    } catch (error) {
      console.error('Error:', error);
    }
  }