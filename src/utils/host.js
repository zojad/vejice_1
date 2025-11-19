/* global Office */

export const isWordOnline = () => {
  const platform = Office?.context?.platform;
  const onlineConst = Office?.PlatformType?.OfficeOnline;
  return platform === onlineConst || platform === "OfficeOnline";
};
