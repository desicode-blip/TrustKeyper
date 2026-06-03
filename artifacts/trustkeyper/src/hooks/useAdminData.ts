/**
 * React Query hooks for admin portal data fetching
 */
import { QueryClient, useQuery } from "@tanstack/react-query";
import {
  fetchAdminFeedback,
  fetchAdminProperties,
  fetchAdminStats,
  fetchAdminUsers,
  type AdminFeedback,
  type AdminProperty,
  type AdminStats,
  type AdminUser,
} from "@/lib/adminApi";

/** Default stale time for admin queries — 30 seconds. */
export const ADMIN_QUERY_STALE_TIME_MS = 30_000;

/** Default retry count for admin queries. */
export const ADMIN_QUERY_RETRY = 2;

/** Default garbage-collection time for admin queries — 5 minutes. */
export const ADMIN_QUERY_GC_TIME_MS = 5 * 60 * 1000;

/** Shared React Query defaults for admin portal requests. */
export const adminQueryDefaults = {
  staleTime: ADMIN_QUERY_STALE_TIME_MS,
  retry: ADMIN_QUERY_RETRY,
  gcTime: ADMIN_QUERY_GC_TIME_MS,
} as const;

/**
 * Creates a QueryClient preconfigured for admin data fetching.
 */
export function createAdminQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: adminQueryDefaults,
    },
  });
}

interface AdminQueryResult<TData> {
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Loads platform statistics for the admin dashboard.
 */
export function useAdminStats(): AdminQueryResult<AdminStats> {
  const query = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
    ...adminQueryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/**
 * Loads all registered users for the admin users view and activity feed.
 */
export function useAdminUsers(): AdminQueryResult<AdminUser[]> {
  const query = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchAdminUsers,
    ...adminQueryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/**
 * Loads all properties for the admin properties view and activity feed.
 */
export function useAdminProperties(): AdminQueryResult<AdminProperty[]> {
  const query = useQuery({
    queryKey: ["admin", "properties"],
    queryFn: fetchAdminProperties,
    ...adminQueryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/**
 * Loads all user feedback submissions for the admin feedback view.
 */
export function useAdminFeedback(): AdminQueryResult<AdminFeedback[]> {
  const query = useQuery({
    queryKey: ["admin", "feedback"],
    queryFn: fetchAdminFeedback,
    ...adminQueryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
