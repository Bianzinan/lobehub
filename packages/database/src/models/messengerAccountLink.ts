import { and, eq, type SQL } from 'drizzle-orm';

import type { MessengerAccountLinkItem, NewMessengerAccountLink } from '../schemas';
import { messengerAccountLinks } from '../schemas';
import type { LobeChatDatabase } from '../type';

export class MessengerAccountLinkModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  // --------------- User-scoped CRUD ---------------

  /**
   * Insert or update the user's link for `(platform)`. Used by the verify-im
   * confirm flow — if the user re-links the same Telegram account they keep
   * the same row; if they link a different IM account on the same platform
   * the existing row is overwritten (one IM account per `(user, platform)`).
   *
   * Returns the resulting link row.
   */
  upsertForPlatform = async (
    params: Omit<NewMessengerAccountLink, 'userId' | 'id'>,
  ): Promise<MessengerAccountLinkItem> => {
    const existing = await this.findByPlatform(params.platform);

    if (existing) {
      const [updated] = await this.db
        .update(messengerAccountLinks)
        .set({
          activeAgentId: params.activeAgentId ?? existing.activeAgentId,
          platformUserId: params.platformUserId,
          platformUsername: params.platformUsername ?? null,
          updatedAt: new Date(),
        })
        .where(eq(messengerAccountLinks.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(messengerAccountLinks)
      .values({ ...params, userId: this.userId })
      .returning();
    return created;
  };

  delete = async (id: string) => {
    return this.db
      .delete(messengerAccountLinks)
      .where(and(eq(messengerAccountLinks.id, id), eq(messengerAccountLinks.userId, this.userId)));
  };

  deleteByPlatform = async (platform: string) => {
    return this.db
      .delete(messengerAccountLinks)
      .where(
        and(
          eq(messengerAccountLinks.userId, this.userId),
          eq(messengerAccountLinks.platform, platform),
        ),
      );
  };

  list = async (): Promise<MessengerAccountLinkItem[]> => {
    return this.db
      .select()
      .from(messengerAccountLinks)
      .where(eq(messengerAccountLinks.userId, this.userId));
  };

  findByPlatform = async (platform: string): Promise<MessengerAccountLinkItem | undefined> => {
    const [result] = await this.db
      .select()
      .from(messengerAccountLinks)
      .where(
        and(
          eq(messengerAccountLinks.userId, this.userId),
          eq(messengerAccountLinks.platform, platform),
        ),
      )
      .limit(1);
    return result;
  };

  /** Update which agent the IM session is currently routed to. */
  setActiveAgent = async (
    platform: string,
    agentId: string | null,
  ): Promise<MessengerAccountLinkItem | undefined> => {
    const conditions: SQL[] = [
      eq(messengerAccountLinks.userId, this.userId),
      eq(messengerAccountLinks.platform, platform),
    ];

    const [updated] = await this.db
      .update(messengerAccountLinks)
      .set({ activeAgentId: agentId, updatedAt: new Date() })
      .where(and(...conditions))
      .returning();

    return updated;
  };

  // --------------- System-wide static methods ---------------

  /**
   * Resolve the link row for an inbound IM message. Returns the row regardless
   * of whether `activeAgentId` is set — the router decides how to handle the
   * "no active agent" case.
   */
  static findByPlatformUser = async (
    db: LobeChatDatabase,
    platform: string,
    platformUserId: string,
  ): Promise<MessengerAccountLinkItem | undefined> => {
    const [result] = await db
      .select()
      .from(messengerAccountLinks)
      .where(
        and(
          eq(messengerAccountLinks.platform, platform),
          eq(messengerAccountLinks.platformUserId, platformUserId),
        ),
      )
      .limit(1);

    return result;
  };

  /** Static setter used by IM `/switch` (no user-scope context, but trusted by sender match). */
  static setActiveAgentById = async (
    db: LobeChatDatabase,
    linkId: string,
    agentId: string | null,
  ): Promise<MessengerAccountLinkItem | undefined> => {
    const [updated] = await db
      .update(messengerAccountLinks)
      .set({ activeAgentId: agentId, updatedAt: new Date() })
      .where(eq(messengerAccountLinks.id, linkId))
      .returning();
    return updated;
  };
}
