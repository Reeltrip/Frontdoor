import { isLinkValid } from "../model/useLinkForm";

export async function readClipboardLink(
  { requireGrantedPermission = false } = {},
): Promise<string | null> {
  try {
    if (requireGrantedPermission) {
      // Safari는 읽기 권한을 미리 확인할 수 없어서 호출하면 붙여넣기 메뉴를 띄울 수 있어요.
      const permission = await navigator.permissions?.query({
        name: "clipboard-read" as PermissionName,
      });
      if (permission?.state !== "granted") return null;
    }
    const text = (await navigator.clipboard.readText()).trim();
    return isLinkValid(text) ? text : null;
  } catch {
    return null;
  }
}
