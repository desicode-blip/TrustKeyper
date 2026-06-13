import { describe, expect, it } from "vitest";
import {
  CLOUD_SYNC_KEYS,
  collectBulkSyncEntries,
  collectPropertyShareEntries,
  propertyShareDataKey,
  PROPERTY_SHARE_KEY_PREFIX,
} from "./cloudSync";

function mockStorage(entries: Record<string, string>): Storage {
  const keys = Object.keys(entries);
  return {
    get length() {
      return keys.length;
    },
    key(index: number) {
      return keys[index] ?? null;
    },
    getItem(key: string) {
      return entries[key] ?? null;
    },
    setItem() {},
    removeItem() {},
    clear() {},
  } as Storage;
}

describe("CLOUD_SYNC_KEYS", () => {
  it("includes owner data keys that were previously bulk-sync gaps", () => {
    expect(CLOUD_SYNC_KEYS).toContain("owner_property_documents");
    expect(CLOUD_SYNC_KEYS).toContain("owner_property_maintenance");
    expect(CLOUD_SYNC_KEYS).toContain("owner_tenant_invites");
    expect(CLOUD_SYNC_KEYS).toContain("tenant_property_declines");
  });
});

describe("propertyShareDataKey", () => {
  it("builds property_share_<id> keys", () => {
    expect(propertyShareDataKey("prop_abc")).toBe(`${PROPERTY_SHARE_KEY_PREFIX}prop_abc`);
  });
});

describe("collectPropertyShareEntries", () => {
  it("finds all property_share_* keys for an account", () => {
    const phone = "9876543210";
    const role = "owner";
    const shareKey = propertyShareDataKey("prop_1");
    const storage = mockStorage({
      [`tk_${phone}_${role}_${shareKey}`]: '{"property":{"id":"prop_1"}}',
      [`tk_${phone}_${role}_profile`]: "{}",
      [`tk_${phone}_broker_${propertyShareDataKey("other")}`]: "ignored",
    });

    const result = collectPropertyShareEntries(phone, role, storage);
    expect(result).toEqual({
      [shareKey]: '{"property":{"id":"prop_1"}}',
    });
  });
});

describe("collectBulkSyncEntries", () => {
  it("merges static CLOUD_SYNC_KEYS and dynamic property share snapshots", () => {
    const phone = "9876543210";
    const role = "owner";
    const shareKey = propertyShareDataKey("prop_99");
    const storage = mockStorage({
      [`tk_${phone}_${role}_owner_property_maintenance`]: "[]",
      [`tk_${phone}_${role}_${shareKey}`]: '{"property":{"id":"prop_99"}}',
    });

    const result = collectBulkSyncEntries(phone, role, storage);
    expect(result.owner_property_maintenance).toBe("[]");
    expect(result[shareKey]).toBe('{"property":{"id":"prop_99"}}');
  });
});
