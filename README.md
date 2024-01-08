// todo: update these docs
// todo: make a little docker container

source code for [https://cards.jakedowns.com](https://cards.jakedowns.com)


https://user-images.githubusercontent.com/1683122/166343608-b03ef7fe-cea6-4a36-bd32-fe7eea6d59f2.mp4


### basics:

1. use nvm or some other means to make sure you have at least node v12 (v14 recommended)
2. npm install to get the basic node dependencies
3. add a `.env` file with the following properties

  ```
  HTTP_PORT=3090
  WS_PORT=3091
  HMR_PORT=3092
  HOSTNAME="cards.site"
  WS_HOSTNAME="cards.site"
  SSL_CERT_PATH="../ssl/cert.crt"
  SSL_KEY_PATH="../ssl/decrypted.key"
  SSL_CA_CERT_PATH="../ssl/ca.crt"
  ```
  > note: you can generate certs via `https://pkiaas.io/`
  >
  > _ssl certs are required for `MediaDevices` API (Video/Audio streaming)_

4. `npx mix` to do a one-time mix of js assets

   - `npx mix watch` to start a watcher
   - `npx mix watch --hot` to start a watcher AND set up hot-reloading
   - `npx mix --production` mix for a prod deploy

5. in a separate terminal run `nodemon server/server.mjs` (if nodemon is not found, `npm i -g nodemon`) // can also use `forever`
6. visit `https://cards.site:3090` (or whatever hostname/port config you gave it)


### Overview

- an engine for designing and playing card games collaboratively
- powered by THREE.js

- server is node
- 3d client is Vue + THREE.js
- 2d client is Vue + css animations (potentially could use canvas, but native dom is a fun challenge)

- future goals:
  - testing porting to Flutter
  - testing porting to React Native
  - (maybe) test port to Unity / Unreal

### Generating a self-signed cert in ubuntu (.cert,.key, & CA.cert)
1. Open a terminal and navigate to the directory where you want to create the certificates.
2. Generate a private key using the following command:
   ```
   openssl genrsa -out server.key 2048
   ```
   > This will create a 2048 bit private key and save it to a file named server.key.

3. Generate a Certificate Signing Request (CSR) with the private key:
   ```
   openssl req -new -key server.key -out server.csr
   ```
   > You will be prompted to enter details for the certificate. These can be left as default.

4. Generate a self-signed certificate with the private key and CSR:
   ```
   openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert
   ```
   > This will create a self-signed certificate valid for 365 days. The certificate will be saved to a file named server.cert.

5. Finally, verify the certificate:
   ```
   openssl x509 -text -noout -in server.cert
   ```
   > This will output the details of the certificate. If everything is correct, your self-signed certificate is ready to use.

6. Remember to update the `.env` file with the paths to your newly created `.cert`, `.key`, and `CA.cert` files.

7. Generate a Certificate Authority (CA) certificate:
   ```
   openssl req -new -x509 -key server.key -out ca.cert
   ```
   > This will create a CA certificate using the server key. The certificate will be saved to a file named ca.cert.

8. Finally, verify the CA certificate:
   ```
   openssl x509 -text -noout -in ca.cert
   ```
   > This will output the details of the CA certificate. If everything is correct, your CA certificate is ready to use.

9. Remember to update the `.env` file with the paths to your newly created `.cert`, `.key`, and `CA.cert` files.
