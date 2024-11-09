# NIP98-sample-client

## Specification

See specification reference at: [https://github.com/nostr-protocol/nips/blob/master/98.md](https://github.com/nostr-protocol/nips/blob/master/98.md)


## Usage

Install:  `npm i `

To Run: `npm run start`

For the remote Auth API server see this repository:
[https://github.com/bitkarrot/nip98-vercel-api](https://github.com/bitkarrot/nip98-vercel-api)

## Notes

For hivetalk remote room auth for nostr users

In this sample repo, we have a sample login page, and after nostr login there is a NIP98 auth button which allows the user to auth
and retrieve content from a remote server API endpoint.

remote API endpoint: `https://nip98-vercel-api.vercel.app/api/auth`

## Other Possible Use cases:

- NIP 98 auth on success
  - can automatically forward the user to a remote http site
  - show content from remote site on current client
  - redirect to another site with auth
  - returns a jwt token, to allow remote http site auth.

Note: the relays are not used in the example but is extra code that can be reused for testing other options.
