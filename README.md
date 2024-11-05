# NIP98-sample-client

For hivetalk remote room auth for nostr users

Potential Use cases:

- NIP 98 auth on success - can automatically forward the user to a remote http site
- NIP 98 auth on success allows user access to remote http site with jwt token

- NIP98 auth on success - returns a jwt token which is appended to the url for the room authentication,
the returned url + jwt then becomes a redirect for the user to enter the room
