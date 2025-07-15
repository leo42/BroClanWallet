declare let KeyPactPort: chrome.runtime.Port | null;
declare let pingInterval: NodeJS.Timeout | null;
declare function startPing(): void;
declare function stopPing(): void;
declare function loadApprovedUrls(): Promise<string[]>;
declare function broadcastVersion(version: string): void;
declare function getUserApproval(data: any): Promise<unknown>;
declare function connectKeyPact(): Promise<unknown>;
