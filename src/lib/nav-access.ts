/**
 * Sidebar visibility from `permissions` on the session.
 *
 * - **`undefined` / `null`** → allow (legacy persisted auth without `user.permissions`).
 * - **Empty array** → deny gated items.
 * - **Only `['*']`** (wildcard alone, e.g. super admin) → allow all gated items.
 * - **`'*'` plus other codes** (typical school admin JWT) → **do not** treat `*` as “every UI
 *   module”; require at least one of `requiredAny` to appear **explicitly** in the array.
 *   This keeps the menu aligned with enumerated rights (e.g. hide Announcements if
 *   `announcement.read` was never linked to the role even when `*` is present).
 */
export function userHasAnyPermission(
  userPermissions: string[] | null | undefined,
  requiredAny: string[] | null | undefined,
): boolean {
  if (!requiredAny?.length) return true;

  if (userPermissions == null) {
    return true;
  }

  if (userPermissions.length === 0) {
    return false;
  }

  const hasStar = userPermissions.includes('*');
  if (hasStar && userPermissions.length === 1) {
    return true;
  }

  return requiredAny.some((code) => userPermissions.includes(code));
}
