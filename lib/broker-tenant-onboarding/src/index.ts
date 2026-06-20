export type OnboardRequest = {
  method: string;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

export type OnboardResponse = {
  status(code: number): OnboardResponse;
  setHeader(name: string, value: string | string[]): OnboardResponse;
  end(body: string): void;
};

export type OnboardStore = {
  findEntryByDataKey: (
    dataKey: string,
  ) => Promise<{ phone: string; role: string; value: string } | null>;
  getAccountData: (phone: string, role: string) => Promise<Record<string, string>>;
  setAccountDataKey: (phone: string, role: string, dataKey: string, value: string) => Promise<void>;
};

type BrokerOnboardInviteStatus =
  | "pending"
  | "onboarding_pending"
  | "onboarding_started"
  | "submitted"
  | "requirements_submitted"
  | "converted"
  | "expired";

type BrokerOnboardTokenSnapshot = {
  token: string;
  tenantName: string;
  tenantPhone: string;
  brokerPhone: string;
  brokerName: string;
  inviteLink?: string;
  status: BrokerOnboardInviteStatus;
  createdAt: number;
  expiresAt: number;
  startedAt?: number;
  submittedAt?: number;
  convertedAt?: number;
};

type BrokerTenantOnboardingInvite = BrokerOnboardTokenSnapshot & { id: string };

type StoredTenant = {
  id: string;
  name: string;
  phone: string;
  linkedinUrl?: string;
  occupancyFrom?: string;
  who?: string;
  identify?: string[];
  food?: string;
  city?: string;
  localities?: string[];
  propertyType?: string;
  sharing?: string;
  roommate?: string[];
  status: "Lead Added" | "Profile Complete";
  invitationSent: boolean;
  detailsComplete: boolean;
  leadStatus?: string;
  source?: string;
  onboardingToken?: string;
  submittedAt?: number;
  createdAt: number;
};

type SubmitBody = {
  name?: string;
  phone?: string;
  linkedinUrl?: string;
  occupancyFrom?: string;
  who?: string;
  identify?: string[];
  food?: string;
  city?: string;
  localities?: string[];
  propertyType?: string;
  sharing?: string;
  roommate?: string[];
  detailsComplete?: boolean;
};

function onboardPathSegments(req: OnboardRequest): string[] {
  const raw = req.query.onboardPath ?? req.query.path;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string" && raw.length > 0) return raw.split("/").filter(Boolean);
  return [];
}

function phoneLast10(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function tokenDataKey(token: string): string {
  return `broker_tenant_onboard_${token}`;
}

export function json(res: OnboardResponse, status: number, body: unknown): void {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function readJsonBody(req: OnboardRequest): unknown {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
}

function resolveInviteStatus(snapshot: BrokerOnboardTokenSnapshot): BrokerOnboardInviteStatus {
  if (snapshot.status === "submitted" || snapshot.status === "requirements_submitted") {
    return "requirements_submitted";
  }
  if (snapshot.status === "converted") return "converted";
  if (snapshot.expiresAt <= Date.now()) return "expired";
  if (snapshot.status === "onboarding_started") return "onboarding_started";
  if (snapshot.status === "onboarding_pending" || snapshot.status === "pending") {
    return "onboarding_pending";
  }
  return snapshot.status;
}

function isSubmittedStatus(status: BrokerOnboardInviteStatus): boolean {
  return status === "submitted" || status === "requirements_submitted";
}

async function updateInviteListStatus(
  store: OnboardStore,
  brokerPhone: string,
  token: string,
  patch: Partial<BrokerTenantOnboardingInvite>,
): Promise<void> {
  const data = await store.getAccountData(brokerPhone, "broker");
  const raw = data["broker_tenant_onboarding_invites"];
  if (!raw) return;
  try {
    const list = JSON.parse(raw) as BrokerTenantOnboardingInvite[];
    if (!Array.isArray(list)) return;
    const updated = list.map((inv) => (inv.token === token ? { ...inv, ...patch } : inv));
    await store.setAccountDataKey(
      brokerPhone,
      "broker",
      "broker_tenant_onboarding_invites",
      JSON.stringify(updated),
    );
  } catch {
    /* ignore malformed invites list */
  }
}

async function markInviteStarted(
  store: OnboardStore,
  brokerPhone: string,
  token: string,
  snapshot: BrokerOnboardTokenSnapshot,
): Promise<BrokerOnboardTokenSnapshot> {
  if (
    snapshot.status === "onboarding_started" ||
    isSubmittedStatus(snapshot.status) ||
    snapshot.status === "converted"
  ) {
    return snapshot;
  }

  const now = Date.now();
  const nextSnapshot: BrokerOnboardTokenSnapshot = {
    ...snapshot,
    status: "onboarding_started",
    startedAt: snapshot.startedAt ?? now,
  };
  await store.setAccountDataKey(
    brokerPhone,
    "broker",
    tokenDataKey(token),
    JSON.stringify(nextSnapshot),
  );
  await updateInviteListStatus(store, brokerPhone, token, {
    status: "onboarding_started",
    startedAt: nextSnapshot.startedAt,
  });
  return nextSnapshot;
}

async function loadTokenSnapshot(
  store: OnboardStore,
  token: string,
): Promise<{
  snapshot: BrokerOnboardTokenSnapshot;
  brokerPhone: string;
} | null> {
  const entry = await store.findEntryByDataKey(tokenDataKey(token));
  if (!entry) return null;

  try {
    const snapshot = JSON.parse(entry.value) as BrokerOnboardTokenSnapshot;
    if (snapshot.token !== token) return null;
    return { snapshot, brokerPhone: entry.phone };
  } catch {
    return null;
  }
}

async function markInviteSubmitted(
  store: OnboardStore,
  brokerPhone: string,
  token: string,
  snapshot: BrokerOnboardTokenSnapshot,
): Promise<void> {
  const now = Date.now();
  const nextSnapshot: BrokerOnboardTokenSnapshot = {
    ...snapshot,
    status: "requirements_submitted",
    submittedAt: now,
  };
  await store.setAccountDataKey(
    brokerPhone,
    "broker",
    tokenDataKey(token),
    JSON.stringify(nextSnapshot),
  );

  const data = await store.getAccountData(brokerPhone, "broker");
  const raw = data["broker_tenant_onboarding_invites"];
  if (!raw) return;
  try {
    const list = JSON.parse(raw) as BrokerTenantOnboardingInvite[];
    if (!Array.isArray(list)) return;
    const updated = list.map((inv) =>
      inv.token === token
        ? { ...inv, status: "requirements_submitted" as const, submittedAt: now }
        : inv,
    );
    await store.setAccountDataKey(
      brokerPhone,
      "broker",
      "broker_tenant_onboarding_invites",
      JSON.stringify(updated),
    );
  } catch {
    /* ignore malformed invites list */
  }
}

async function appendBrokerTenantLead(
  store: OnboardStore,
  brokerPhone: string,
  token: string,
  body: SubmitBody,
): Promise<{ tenant: StoredTenant; isDuplicate: boolean }> {
  const data = await store.getAccountData(brokerPhone, "broker");
  const raw = data.tenants;
  const list: StoredTenant[] = raw ? (JSON.parse(raw) as StoredTenant[]) : [];
  const digits = phoneLast10(body.phone ?? "");
  const existing = list.find(
    (row) =>
      phoneLast10(row.phone) === digits &&
      row.onboardingToken === token &&
      row.source === "broker_onboarding_link",
  );
  if (existing) {
    return { tenant: existing, isDuplicate: true };
  }

  const now = Date.now();
  const detailsComplete = body.detailsComplete === true;
  const tenant: StoredTenant = {
    id: `t_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: (body.name ?? "").trim(),
    phone: body.phone ?? "",
    linkedinUrl: body.linkedinUrl?.trim() || undefined,
    occupancyFrom: body.occupancyFrom,
    who: body.who,
    identify: body.identify,
    food: body.food,
    city: body.city,
    localities: body.localities,
    propertyType: body.propertyType,
    sharing: body.sharing,
    roommate: body.roommate,
    status: detailsComplete ? "Profile Complete" : "Lead Added",
    invitationSent: true,
    detailsComplete,
    leadStatus: "New Lead",
    source: "broker_onboarding_link",
    onboardingToken: token,
    submittedAt: now,
    createdAt: now,
  };

  list.unshift(tenant);
  await store.setAccountDataKey(brokerPhone, "broker", "tenants", JSON.stringify(list));
  return { tenant, isDuplicate: false };
}

function validateSubmitBody(body: SubmitBody): string | null {
  const name = (body.name ?? "").trim();
  const phone = phoneLast10(body.phone ?? "");
  if (name.length < 2) return "Name is required";
  if (phone.length !== 10) return "Valid phone number is required";
  if (!(body.linkedinUrl ?? "").trim()) return "LinkedIn profile is required";
  if (!(body.occupancyFrom ?? "").trim()) return "Occupancy date is required";
  if (body.who !== "Family" && body.who !== "Bachelor") return "Staying preference is required";
  if (body.food !== "Veg" && body.food !== "Non-Veg") return "Food preference is required";
  if (body.who === "Bachelor" && (!body.identify || body.identify.length === 0)) {
    return "Identification is required for bachelors";
  }
  if (body.detailsComplete) {
    if (!body.city?.trim()) return "City is required";
    if (!body.localities || body.localities.length === 0) return "At least one locality is required";
    if (!body.propertyType?.trim()) return "Property type is required";
    if (!body.sharing?.trim()) return "Sharing preference is required";
    if (
      body.sharing !== "Entire Property" &&
      (!body.roommate || body.roommate.length === 0)
    ) {
      return "Roommate preference is required";
    }
  }
  return null;
}

export async function handleBrokerTenantOnboardRequest(
  req: OnboardRequest,
  res: OnboardResponse,
  store: OnboardStore,
): Promise<void> {
  const segments = onboardPathSegments(req);
  const token = segments[0];
  if (!token) {
    json(res, 404, { error: "Not found" });
    return;
  }

  if (segments.length === 1) {
    if (req.method !== "GET") {
      json(res, 405, { error: "Method not allowed" });
      return;
    }

    const record = await loadTokenSnapshot(store, token);
    if (!record) {
      json(res, 404, { error: "Invalid onboarding link" });
      return;
    }

    let snapshot = record.snapshot;
    let status = resolveInviteStatus(snapshot);
    if (status === "expired") {
      json(res, 410, {
        error: "This onboarding link has expired",
        brokerName: snapshot.brokerName,
        status,
      });
      return;
    }

    if (status === "onboarding_pending") {
      snapshot = await markInviteStarted(store, record.brokerPhone, token, snapshot);
      status = resolveInviteStatus(snapshot);
    }

    json(res, 200, {
      tenantName: snapshot.tenantName,
      tenantPhone: snapshot.tenantPhone,
      brokerName: snapshot.brokerName,
      status,
      expiresAt: snapshot.expiresAt,
    });
    return;
  }

  if (segments[1] === "submit") {
    if (req.method !== "POST") {
      json(res, 405, { error: "Method not allowed" });
      return;
    }

    const record = await loadTokenSnapshot(store, token);
    if (!record) {
      json(res, 404, { error: "Invalid onboarding link" });
      return;
    }

    const status = resolveInviteStatus(record.snapshot);
    if (status === "expired") {
      json(res, 410, { error: "This onboarding link has expired", status });
      return;
    }

    const rawBody = readJsonBody(req);
    const body: SubmitBody =
      rawBody && typeof rawBody === "object" ? (rawBody as SubmitBody) : {};
    const validationError = validateSubmitBody(body);
    if (validationError) {
      json(res, 400, { error: validationError });
      return;
    }

    const submitPhone = phoneLast10(body.phone ?? "");
    const invitePhone = phoneLast10(record.snapshot.tenantPhone);
    if (submitPhone !== invitePhone) {
      json(res, 400, { error: "Phone number does not match the invitation" });
      return;
    }

    if (isSubmittedStatus(status)) {
      const { tenant } = await appendBrokerTenantLead(store, record.brokerPhone, token, body);
      json(res, 200, {
        ok: true,
        duplicate: true,
        brokerName: record.snapshot.brokerName,
        tenantId: tenant.id,
      });
      return;
    }

    try {
      const { tenant, isDuplicate } = await appendBrokerTenantLead(
        store,
        record.brokerPhone,
        token,
        body,
      );
      if (!isDuplicate) {
        await markInviteSubmitted(store, record.brokerPhone, token, record.snapshot);
      }
      json(res, 201, {
        ok: true,
        duplicate: isDuplicate,
        brokerName: record.snapshot.brokerName,
        tenantId: tenant.id,
      });
    } catch {
      json(res, 500, { error: "Failed to save tenant requirements" });
    }
    return;
  }

  json(res, 404, { error: "Not found" });
}
