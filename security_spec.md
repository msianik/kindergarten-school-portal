# Ananda Pathshala Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default-Deny Catch-All**: All paths not explicitly matched (`/{document=**}`) deny all reads and writes.
2. **Verified Identity**: All write operations require `request.auth != null && request.auth.token.email_verified == true`.
3. **Ownership & Author Integrity**: Every created document (`diary_posts`, `gallery_items`, `pickup_logs`) must have `authorUid == request.auth.uid`, and `authorUid` and `createdAt` are immutable across updates.
4. **Temporal Integrity**: `createdAt` and `updatedAt` must strictly equal `request.time`.
5. **Query Enforcer (No Blanket List)**: Every `allow list` rule enforces `resource.data.authorUid == request.auth.uid || isAdmin()` so clients cannot scrape records belonging to other accounts without explicit ownership or admin status.
6. **Terminal State Locking**: `pickup_logs` documents with `resource.data.status == 'completed'` or `'cancelled'` are locked against non-admin state mutations.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: `auth = null`, creating `/diary_posts/post_1` -> `PERMISSION_DENIED`
2. **Unverified Email Spoof**: `auth = { uid: 'u1', token: { email: 'msianik.bd@gmail.com', email_verified: false } }`, creating `/diary_posts/post_1` -> `PERMISSION_DENIED`
3. **Author UID Spoofing**: `auth.uid = 'u1'`, payload sets `authorUid: 'u2'` -> `PERMISSION_DENIED`
4. **Shadow/Ghost Field Injection**: Payload includes `isVerifiedAdmin: true` not in `hasOnly()` -> `PERMISSION_DENIED`
5. **ID Poisoning Attack**: Document ID exceeds 128 characters or contains spaces/slashes (`post/../admin`) -> `PERMISSION_DENIED`
6. **Oversized String ("Denial of Wallet")**: `descriptionBn` length > 2000 characters -> `PERMISSION_DENIED`
7. **Invalid Enum Value**: `className: 'Grade-10'` or `mood: 'angry'` -> `PERMISSION_DENIED`
8. **Forged Client Timestamp**: `createdAt` != `request.time` -> `PERMISSION_DENIED`
9. **Immutable Field Mutation**: Updating `createdAt` or `authorUid` on `/diary_posts/post_1` -> `PERMISSION_DENIED`
10. **Update-Gap Type Poisoning**: Updating `titleBn` on `/diary_posts/post_1` to a number `12345` or empty string `""` -> `PERMISSION_DENIED`
11. **Terminal State Bypass**: Updating a `/pickup_logs/log_1` document whose `existing().status == 'completed'` as non-admin -> `PERMISSION_DENIED`
12. **Unauthorized Cross-User List/Get**: Reading `/pickup_logs/log_other` where `resource.data.authorUid != request.auth.uid` as non-admin -> `PERMISSION_DENIED`
