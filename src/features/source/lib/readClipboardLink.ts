import { isLinkValid } from "../model/useLinkForm";

export async function readClipboardLink(): Promise<string | null> {
  try {
    const text = (await navigator.clipboard.readText()).trim();
    return isLinkValid(text) ? text : null;
  } catch {
    return null;
  }
}
