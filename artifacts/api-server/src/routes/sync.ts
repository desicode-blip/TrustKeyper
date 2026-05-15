import { Router, type IRouter } from "express";
import {
  accountHasProfile,
  getAccountData,
  getRolesForPhone,
  normalizePhone,
  setAccountDataBulk,
  setAccountDataKey,
} from "../lib/accountStore";

const router: IRouter = Router();

/** Wipe all cloud accounts. Requires TRUSTKEYPER_RESET_SECRET header in production. */
router.delete("/sync/accounts", async (req, res) => {
  try {
    const secret = process.env.TRUSTKEYPER_RESET_SECRET;
    const token = req.header("x-reset-token");
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && (!secret || token !== secret)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { clearAllAccountData } = await import("../lib/accountStore");
    const result = await clearAllAccountData();
    res.json({ ok: true, cleared: result.store });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset accounts", detail: String(err) });
  }
});

router.get("/sync/accounts/:phone/roles", async (req, res) => {
  try {
    const phone = normalizePhone(String(req.params.phone ?? ""));
    if (phone.length !== 10) {
      res.status(400).json({ error: "Invalid phone" });
      return;
    }
    const roles = await getRolesForPhone(phone);
    res.json({ phone, roles });
  } catch (err) {
    res.status(500).json({ error: "Failed to list roles", detail: String(err) });
  }
});

router.get("/sync/accounts/:phone/:role/exists", async (req, res) => {
  try {
    const phone = normalizePhone(String(req.params.phone ?? ""));
    const role = String(req.params.role ?? "");
    if (phone.length !== 10 || !role) {
      res.status(400).json({ error: "Invalid phone or role" });
      return;
    }
    const exists = await accountHasProfile(phone, role);
    res.json({ phone, role, exists });
  } catch (err) {
    res.status(500).json({ error: "Failed to check account", detail: String(err) });
  }
});

router.get("/sync/accounts/:phone/:role", async (req, res) => {
  try {
    const phone = normalizePhone(String(req.params.phone ?? ""));
    const role = String(req.params.role ?? "");
    if (phone.length !== 10 || !role) {
      res.status(400).json({ error: "Invalid phone or role" });
      return;
    }
    const data = await getAccountData(phone, role);
    if (!data.profile) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    res.json({ phone, role, data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load account", detail: String(err) });
  }
});

router.put("/sync/accounts/:phone/:role/:dataKey", async (req, res) => {
  try {
    const phone = normalizePhone(String(req.params.phone ?? ""));
    const role = String(req.params.role ?? "");
    const dataKey = String(req.params.dataKey ?? "");
    const value = typeof req.body?.value === "string" ? req.body.value : null;
    if (phone.length !== 10 || !role || !dataKey || value === null) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    await setAccountDataKey(phone, role, dataKey, value);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save data", detail: String(err) });
  }
});

router.put("/sync/accounts/:phone/:role", async (req, res) => {
  try {
    const phone = normalizePhone(String(req.params.phone ?? ""));
    const role = String(req.params.role ?? "");
    const entries = req.body?.entries as Record<string, string> | undefined;
    if (phone.length !== 10 || !role || !entries || typeof entries !== "object") {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    await setAccountDataBulk(phone, role, entries);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save data", detail: String(err) });
  }
});

export default router;
