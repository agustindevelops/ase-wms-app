import { api } from './client';

/**
 * ASE-25 standalone report issue.
 *
 * POST /item/{itemId}/issue
 */

export type IssueType = 'MISSING' | 'BROKEN';

export type CreatedIssue = {
  id: string;
  type: IssueType;
  itemId: string;
  quantity: number;
  notes: string | null;
  createdAt: string;
};

export async function createItemIssue(
  itemId: string,
  body: {
    type: IssueType;
    quantity: number;
    notes?: string | null;
  },
): Promise<CreatedIssue> {
  const { data } = await api.post<{ issue: CreatedIssue }>(
    `/item/${itemId}/issue`,
    body,
  );
  return data.issue;
}
