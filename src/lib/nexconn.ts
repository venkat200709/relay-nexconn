import {
  NCEngine,
  LogLevel,
  AreaCode,
  ConnectionStatus,
  ConnectionStatusHandler,
  MessageHandler,
  ChannelHandler,
  DirectChannel,
  SendTextMessageParams,
  BaseChannel,
} from '@nexconn/chat';

let isEngineInitialized = false;
let currentConnectedUserId = '';

export function initializeNexconn(appKey: string): void {
  if (isEngineInitialized) return;
  NCEngine.initialize({
    appKey,
    logLevel: LogLevel.WARN,
    areaCode: AreaCode.SG,
  });
  isEngineInitialized = true;
}

export async function connectNexconn(token: string): Promise<{ success: boolean; userId?: string; code?: number }> {
  try {
    const res = await NCEngine.connect({ token });
    if (res.code === 0 && res.data?.userId) {
      currentConnectedUserId = res.data.userId;
      return { success: true, userId: res.data.userId };
    }
    return { success: false, code: res.code };
  } catch (err: any) {
    return { success: false, code: -1 };
  }
}

export async function disconnectNexconn(): Promise<void> {
  try {
    await NCEngine.disconnect();
    currentConnectedUserId = '';
  } catch {}
}

export function getCurrentConnectedUserId(): string {
  return currentConnectedUserId;
}

export function setupConnectionListener(
  handlerId: string,
  onStatusChanged: (status: string, code?: number) => void
): void {
  NCEngine.addConnectionStatusHandler(
    handlerId,
    new ConnectionStatusHandler({
      onConnectionStatusChanged({ status, code }) {
        const statusStr =
          status === ConnectionStatus.CONNECTED
            ? 'CONNECTED'
            : status === ConnectionStatus.CONNECTING
            ? 'CONNECTING'
            : 'DISCONNECTED';
        onStatusChanged(statusStr, code);
      },
    })
  );
}

export function setupMessageListener(
  handlerId: string,
  onMessageReceived: (message: any) => void
): void {
  NCEngine.addMessageHandler(
    handlerId,
    new MessageHandler({
      onMessageReceived({ messages }) {
        if (Array.isArray(messages)) {
          messages.forEach(onMessageReceived);
        } else if (messages) {
          onMessageReceived(messages);
        }
      },
    })
  );
}

export function setupTypingListener(
  handlerId: string,
  onTyping: (userId: string, targetId: string) => void
): void {
  NCEngine.addChannelHandler(
    handlerId,
    new ChannelHandler({
      onTypingStatusChanged({ channelIdentifier, userTypingStatus }) {
        if (channelIdentifier && Array.isArray(userTypingStatus) && userTypingStatus.length > 0) {
          const first = userTypingStatus[0];
          if (first && first.userId) {
            onTyping(first.userId, channelIdentifier.channelId);
          }
        }
      },
    })
  );
}

export async function sendChatMessage(targetUserId: string, text: string): Promise<boolean> {
  try {
    const channel = new DirectChannel(targetUserId);
    const params = new SendTextMessageParams({ text });
    const { code } = await channel.sendMessage(params);
    return code === 0;
  } catch {
    return false;
  }
}

export async function sendTypingIndicator(targetUserId: string): Promise<void> {
  try {
    const channel = new DirectChannel(targetUserId);
    await channel.sendTypingStatus('RC:TxtMsg');
  } catch {}
}

export async function markChannelAsRead(targetUserId: string): Promise<void> {
  try {
    const channel = new DirectChannel(targetUserId);
    await channel.clearUnreadCount();
  } catch {}
}

export async function fetchRemoteMessages(targetUserId: string): Promise<any[]> {
  try {
    const channel = new DirectChannel(targetUserId);
    const query = BaseChannel.createMessagesQuery({
      channelIdentifier: channel.identifier,
      startTime: Date.now(),
      pageSize: 40,
      isAscending: true,
    });
    const { code, data } = await query.loadNextPage();
    if (code === 0 && Array.isArray(data)) {
      return data;
    }
    return [];
  } catch {
    return [];
  }
}
