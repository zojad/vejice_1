/* global Office */

export const isWordOnline = () => {
  if (typeof Office === "undefined" || !Office) {
    return false;
  }
  const platform = Office?.context?.platform;
  const onlineConst = Office?.PlatformType?.OfficeOnline;
  return platform === onlineConst || platform === "OfficeOnline";
};
