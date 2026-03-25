export function getResponseData(response) {
  return response?.data?.data ?? response?.data ?? null;
}

export function getPagination(response) {
  return response?.data?.pagination ?? {
    total: 0,
    page: 1,
    limit: 10,
  };
}

export function getErrorMessage(error, fallback = "Something went wrong") {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export async function fetchCollection(request) {
  const response = await request();
  return {
    items: getResponseData(response) ?? [],
    pagination: getPagination(response),
  };
}

export function buildSearchParams(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
