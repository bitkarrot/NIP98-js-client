# NIP98-sample-client

For hivetalk remote room auth for nostr users

In this sample repo, we have a sample login page, and after nostr login there is a NIP98 auth button which allows the user to auth
and retrieve content from a server API endpoint '/protected'. 

Other Possible Use cases:

- NIP 98 auth on success
  - can automatically forward the user to a remote http site
  - show content from remote site on current client
  - redirect to another site with auth
  - returns a jwt token, to allow remote http site auth.
