// services/assets_services.js

function normalizeAssetsResponse(apiResponse) {
  if (!apiResponse?.data?.[0]) return [];

  const assetsData = apiResponse.data[0];

  return Object.keys(assetsData).map(assetKey => {
    const asset = assetsData[assetKey];
    return asset;
  });
}

export async function fetchAssets(window = "7d") {
  const res = await fetch(
    `/model/assets?window=${window}&aggregate=type&accumulate=true`
  );

  if (!res.ok) {
    throw new Error("Assets API unavailable");
  }

  const json = await res.json();
  return normalizeAssetsResponse(json);
}