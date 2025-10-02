// Minimal E2EE utilities using Web Crypto API (ECDH P-256 + AES-GCM)
// NOTE: This is a simplified demo. In production, harden key storage and rotation.

const ALG = {
  name: 'ECDH',
  namedCurve: 'P-256',
}

const AES = {
  name: 'AES-GCM',
  length: 256,
}

export async function generateUserKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(ALG, true, ['deriveKey', 'deriveBits'])
  const pub = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey)
  const prv = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey)
  return { publicKeyJwk: pub, privateKeyJwk: prv }
}

export async function importPublicKey(jwk) {
  return window.crypto.subtle.importKey('jwk', jwk, ALG, true, [])
}

export async function importPrivateKey(jwk) {
  return window.crypto.subtle.importKey('jwk', jwk, ALG, true, ['deriveKey', 'deriveBits'])
}

export async function deriveSharedAesKey(myPrivateJwk, otherPublicJwk) {
  const myPriv = await importPrivateKey(myPrivateJwk)
  const otherPub = await importPublicKey(otherPublicJwk)
  return window.crypto.subtle.deriveKey(
    { name: 'ECDH', public: otherPub },
    myPriv,
    AES,
    false,
    ['encrypt', 'decrypt']
  )
}

export async function aesEncrypt(key, plaintext) {
  const enc = new TextEncoder()
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const ct = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
  return { cipherText: b64(new Uint8Array(ct)), iv: b64(iv) }
}

export async function aesDecrypt(key, cipherTextB64, ivB64) {
  const dec = new TextDecoder()
  const iv = fromB64(ivB64)
  const ct = fromB64(cipherTextB64)
  const pt = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return dec.decode(pt)
}

function b64(arr) { return btoa(String.fromCharCode(...arr)) }
function fromB64(str) {
  const bin = atob(str)
  const arr = new Uint8Array(bin.length)
  for (let i=0;i<bin.length;i++) arr[i] = bin.charCodeAt(i)
  return arr
}

const LS_PRIV = 'e2ee_private_key'

export async function ensureUserKeypairUploaded(api, authStore) {
  const { currentUser } = authStore.getState()
  if (!currentUser) return
  let prv = localStorage.getItem(LS_PRIV)
  if (!currentUser.publicKeyJwk || !prv) {
    const { publicKeyJwk, privateKeyJwk } = await generateUserKeyPair()
    localStorage.setItem(LS_PRIV, JSON.stringify(privateKeyJwk))
    await api.updateMe({}) // ensure session
    await fetchPublicKeyUpdate(api, publicKeyJwk)
  }
}

async function fetchPublicKeyUpdate(api, publicKeyJwk) {
  await fetch((process.env.REACT_APP_API_BASE || 'http://localhost:4000') + '/users/me/keys', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
    body: JSON.stringify({ publicKeyJwk })
  })
}

export function getPrivateKeyJwk() {
  const raw = localStorage.getItem(LS_PRIV)
  return raw ? JSON.parse(raw) : null
}
