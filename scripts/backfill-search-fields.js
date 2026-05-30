// One-time backfill for the prefix-search lowercase fields introduced in
// commit 32f48cc. Adds `usernameLower` + `displayNameLower` to every user
// doc and `titleLower` to every post doc that's missing them.
//
// SETUP (one-time, ~1 min):
//   1. Firebase Console -> Project Settings -> Service Accounts ->
//      "Generate new private key" -> save the JSON file as
//      `service-account.json` in the project root.
//      (This file is gitignored. Treat it like a password — never commit.)
//
// USAGE:
//   node scripts/backfill-search-fields.js
//
// Safe to re-run: only writes where the *Lower field is missing or stale.

const fs = require('fs')
const path = require('path')
const admin = require('firebase-admin')

const PROJECT_ID = 'line-7542e'
const KEY_PATH = path.join(__dirname, '..', 'service-account.json')

if (!fs.existsSync(KEY_PATH)) {
  console.error('Missing service-account.json at project root.\n')
  console.error('Get one from Firebase Console -> Project Settings ->')
  console.error('Service Accounts -> Generate new private key.\n')
  console.error('Save it as `service-account.json` in the project root.')
  console.error('(It is gitignored — never commit.)')
  process.exit(1)
}

const credential = admin.credential.cert(require(KEY_PATH))
admin.initializeApp({ credential, projectId: PROJECT_ID })

const db = admin.firestore()

const backfillUsers = async () => {
  const snap = await db.collection('users').get()
  let updated = 0
  let skipped = 0
  for (const doc of snap.docs) {
    const data = doc.data()
    const username = data.username ?? ''
    const displayName = data.displayName ?? ''
    const expectedUsernameLower = username.toLowerCase()
    const expectedDisplayNameLower = displayName.toLowerCase()

    const updates = {}
    if (data.usernameLower !== expectedUsernameLower) {
      updates.usernameLower = expectedUsernameLower
    }
    if (data.displayNameLower !== expectedDisplayNameLower) {
      updates.displayNameLower = expectedDisplayNameLower
    }

    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates)
      updated += 1
      console.log(`  users/${doc.id}: ${Object.keys(updates).join(', ')} (@${username})`)
    } else {
      skipped += 1
    }
  }
  console.log(`Users: ${updated} updated, ${skipped} already current\n`)
}

const backfillPosts = async () => {
  const snap = await db.collection('posts').get()
  let updated = 0
  let skipped = 0
  for (const doc of snap.docs) {
    const data = doc.data()
    const title = data.title ?? ''
    const expectedTitleLower = title.toLowerCase()

    if (data.titleLower === expectedTitleLower) {
      skipped += 1
      continue
    }

    await doc.ref.update({ titleLower: expectedTitleLower })
    updated += 1
    console.log(`  posts/${doc.id}: titleLower (${title.slice(0, 40)})`)
  }
  console.log(`Posts: ${updated} updated, ${skipped} already current\n`)
}

const run = async () => {
  console.log(`Backfilling search fields on project: ${PROJECT_ID}\n`)
  await backfillUsers()
  await backfillPosts()
  console.log('Done.')
}

run().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
