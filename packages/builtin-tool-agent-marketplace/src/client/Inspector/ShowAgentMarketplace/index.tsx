'use client';

import type { BuiltinInspectorProps } from '@lobechat/types';
import { cx } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { inspectorTextStyles, shinyTextStyles } from '@/styles';

import type { ShowAgentMarketplaceArgs } from '../../../types';
import { inspectorChipStyles } from '../_styles';

const HIDDEN_CHIP_THRESHOLD = 3;

export const ShowAgentMarketplaceInspector = memo<
  BuiltinInspectorProps<ShowAgentMarketplaceArgs, Record<string, unknown>>
>(({ args, partialArgs, isArgumentsStreaming, isLoading }) => {
  const { t } = useTranslation('plugin');
  const styles = inspectorChipStyles;

  const categoryHints = args?.categoryHints ?? partialArgs?.categoryHints ?? [];

  if (isArgumentsStreaming && categoryHints.length === 0) {
    return (
      <div className={cx(inspectorTextStyles.root, shinyTextStyles.shinyText)}>
        <span>{t('builtins.lobe-agent-marketplace.apiName.showAgentMarketplace')}</span>
      </div>
    );
  }

  const visibleHints = categoryHints.slice(0, HIDDEN_CHIP_THRESHOLD);
  const overflowCount = categoryHints.length - visibleHints.length;

  return (
    <div
      style={{ flexWrap: 'wrap', gap: 4 }}
      className={cx(
        inspectorTextStyles.root,
        (isArgumentsStreaming || isLoading) && shinyTextStyles.shinyText,
      )}
    >
      <span>{t('builtins.lobe-agent-marketplace.apiName.showAgentMarketplace')}</span>
      {visibleHints.map((slug) => (
        <span className={styles.chip} key={slug}>
          {t(`builtins.lobe-agent-marketplace.category.${slug}` as const, { defaultValue: slug })}
        </span>
      ))}
      {overflowCount > 0 && (
        <span className={styles.meta}>
          {t('builtins.lobe-agent-marketplace.inspector.moreCategories', { count: overflowCount })}
        </span>
      )}
    </div>
  );
});

ShowAgentMarketplaceInspector.displayName = 'ShowAgentMarketplaceInspector';

export default ShowAgentMarketplaceInspector;
