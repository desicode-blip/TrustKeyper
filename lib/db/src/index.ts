export { closeDb, ensureDbReady, getDb, isEmbeddedLocalDb, pgliteDataDir } from "./client.js";
export * from "./schema/index.js";
export {
  queryAccountData,
  queryEntryByDataKey,
  queryRolesWithProfileForPhone,
  upsertAccountDataKey,
} from "./userDataQueries.js";
