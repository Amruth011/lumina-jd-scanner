import { toast } from "sonner";

export const generateShareUrl = (data: Record<string, unknown>) => {
  try {
    const serialized = btoa(JSON.stringify(data));
    const url = new URL(window.location.origin);
    url.searchParams.set("share", serialized);
    return url.toString();
  } catch (e) {
    console.error("Failed to generate share URL", e);
    return window.location.origin;
  }
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link Copied", {
      description: "Tactical share link has been stored in your clipboard."
    });
  } catch (e) {
    toast.error("Failed to copy link");
  }
};

export const shareToLinkedIn = (url: string, title?: string) => {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, "_blank", "width=600,height=600");
};

export const decodeShareData = (serialized: string) => {
  try {
    return JSON.parse(atob(serialized));
  } catch (e) {
    console.error("Failed to decode share data", e);
    return null;
  }
};
