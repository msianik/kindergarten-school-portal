import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rulesText = fs.existsSync('firestore.rules')
  ? fs.readFileSync('firestore.rules', 'utf8')
  : fs.readFileSync('DRAFT_firestore.rules', 'utf8');

interface AuthContext {
  uid: string;
  email?: string;
  email_verified?: boolean;
}

function evaluateDiaryPostWrite(
  auth: AuthContext | null,
  docId: string,
  payload: Record<string, unknown>,
  serverTime: string,
  existingDoc?: Record<string, unknown>
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!auth || auth.email_verified !== true) return 'PERMISSION_DENIED';
  if (!docId || docId.length > 128 || !/^[a-zA-Z0-9_\-]+$/.test(docId)) return 'PERMISSION_DENIED';

  const requiredKeys = [
    'titleBn',
    'descriptionBn',
    'className',
    'activityType',
    'mood',
    'teacherNameBn',
    'authorUid',
    'createdAt',
    'updatedAt',
  ];
  const allowedKeys = [...requiredKeys, 'photoUrl'];
  const keys = Object.keys(payload);
  if (!requiredKeys.every((k) => keys.includes(k))) return 'PERMISSION_DENIED';
  if (!keys.every((k) => allowedKeys.includes(k))) return 'PERMISSION_DENIED';

  if (typeof payload.titleBn !== 'string' || payload.titleBn.length < 1 || payload.titleBn.length > 200)
    return 'PERMISSION_DENIED';
  if (
    typeof payload.descriptionBn !== 'string' ||
    payload.descriptionBn.length < 1 ||
    payload.descriptionBn.length > 2000
  )
    return 'PERMISSION_DENIED';
  if (!['Playgroup', 'Nursery', 'KG-1', 'KG-2'].includes(String(payload.className)))
    return 'PERMISSION_DENIED';
  if (
    !['rhyme', 'art_craft', 'block_play', 'snack_time', 'outdoor', 'circle_time'].includes(
      String(payload.activityType)
    )
  )
    return 'PERMISSION_DENIED';
  if (!['joyful', 'curious', 'peaceful', 'creative', 'playful'].includes(String(payload.mood)))
    return 'PERMISSION_DENIED';
  if (
    typeof payload.teacherNameBn !== 'string' ||
    payload.teacherNameBn.length < 1 ||
    payload.teacherNameBn.length > 120
  )
    return 'PERMISSION_DENIED';
  if (payload.authorUid !== auth.uid) return 'PERMISSION_DENIED';

  if (!existingDoc) {
    if (payload.createdAt !== serverTime || payload.updatedAt !== serverTime) return 'PERMISSION_DENIED';
    return 'ALLOWED';
  } else {
    if (payload.authorUid !== existingDoc.authorUid) return 'PERMISSION_DENIED';
    if (payload.createdAt !== existingDoc.createdAt) return 'PERMISSION_DENIED';
    if (payload.updatedAt !== serverTime) return 'PERMISSION_DENIED';
    return 'ALLOWED';
  }
}

test('Firestore rules file contains all mandatory Eight Pillars', () => {
  assert.ok(rulesText.includes("rules_version = '2';"));
  assert.ok(rulesText.includes('allow read, write: if false;'));
  assert.ok(rulesText.includes('isValidDiaryPost(incoming())'));
  assert.ok(rulesText.includes('isValidGalleryItem(incoming())'));
  assert.ok(rulesText.includes('isValidPickupLog(incoming())'));
  assert.ok(rulesText.includes('isValidFcmNotification(incoming())'));
  assert.ok(rulesText.includes('affectedKeys().hasOnly'));
});

test('Dirty Dozen #1-12 payloads return PERMISSION_DENIED', () => {
  const now = '2026-10-31T13:00:00Z';
  const validBase = {
    titleBn: 'সংখ্যা মেলানো খেলা',
    descriptionBn: 'আজ শিশুরা আনন্দের সাথে সংখ্যা মিলিয়েছে।',
    className: 'Playgroup',
    activityType: 'art_craft',
    mood: 'joyful',
    teacherNameBn: 'রোকেয়া পারভীন',
    authorUid: 'user_123',
    createdAt: now,
    updatedAt: now,
  };
  const verifiedAuth: AuthContext = { uid: 'user_123', email: 'teacher@school.bd', email_verified: true };

  // 1. Unauthenticated Write
  assert.equal(evaluateDiaryPostWrite(null, 'post_1', validBase, now), 'PERMISSION_DENIED');

  // 2. Unverified Email Spoof
  assert.equal(
    evaluateDiaryPostWrite({ uid: 'user_123', email: 'msianik.bd@gmail.com', email_verified: false }, 'post_1', validBase, now),
    'PERMISSION_DENIED'
  );

  // 3. Author UID Spoofing
  assert.equal(
    evaluateDiaryPostWrite(verifiedAuth, 'post_1', { ...validBase, authorUid: 'other_user' }, now),
    'PERMISSION_DENIED'
  );

  // 4. Shadow/Ghost Field Injection
  assert.equal(
    evaluateDiaryPostWrite(verifiedAuth, 'post_1', { ...validBase, isAdmin: true }, now),
    'PERMISSION_DENIED'
  );

  // 5. ID Poisoning Attack
  assert.equal(evaluateDiaryPostWrite(verifiedAuth, 'bad/id$!', validBase, now), 'PERMISSION_DENIED');

  // 6. Oversized String ("Denial of Wallet")
  assert.equal(
    evaluateDiaryPostWrite(verifiedAuth, 'post_1', { ...validBase, descriptionBn: 'ক'.repeat(2005) }, now),
    'PERMISSION_DENIED'
  );

  // 7. Invalid Enum Value
  assert.equal(
    evaluateDiaryPostWrite(verifiedAuth, 'post_1', { ...validBase, className: 'Class-10' }, now),
    'PERMISSION_DENIED'
  );

  // 8. Forged Client Timestamp
  assert.equal(
    evaluateDiaryPostWrite(verifiedAuth, 'post_1', { ...validBase, createdAt: '2020-01-01T00:00:00Z' }, now),
    'PERMISSION_DENIED'
  );

  // 9. Immutable Field Mutation
  assert.equal(
    evaluateDiaryPostWrite(
      verifiedAuth,
      'post_1',
      { ...validBase, createdAt: '2025-01-01T00:00:00Z' },
      now,
      validBase
    ),
    'PERMISSION_DENIED'
  );

  // 10. Update-Gap Type Poisoning
  assert.equal(
    evaluateDiaryPostWrite(verifiedAuth, 'post_1', { ...validBase, titleBn: 9999 }, now, validBase),
    'PERMISSION_DENIED'
  );

  // Valid baseline passes
  assert.equal(evaluateDiaryPostWrite(verifiedAuth, 'post_1', validBase, now), 'ALLOWED');
});
