'use client';

import type { BuiltinInspectorProps } from '@lobechat/types';
import { cx } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { inspectorTextStyles, shinyTextStyles } from '@/styles';

import type { SubmitAgentPickArgs } from '../../../types';
import { inspectorChipStyles } from '../_styles';

export const SubmitAgentPickInspector = memo<
  BuiltinInspectorProps<SubmitAgentPickArgs, Record<string, unknown>>
>(({ args, partialArgs, isArgumentsStreaming, isLoading }) => {
  const { t } = useTranslation('plugin');
  const styles = inspectorChipStyles;

  const ids = args?.selectedTemplateIds ?? partialArgs?.selectedTemplateIds ?? [];

  if (isArgumentsStreaming && ids.length === 0) {
    return (
      <div className={cx(inspectorTextStyles.root, shinyTextStyles.shinyText)}>
        <span>{t('builtins.lobe-agent-marketplace.apiName.submitAgentPick')}</span>
      </div>
    );
  }

  return (
    <div
      style={{ gap: 4 }}
      className={cx(
        inspectorTextStyles.root,
        (isArgumentsStreaming || isLoading) && shinyTextStyles.shinyText,
      )}
    >
      <span>{t('builtins.lobe-agent-marketplace.apiName.submitAgentPick')}</span>
      {ids.length > 0 && (
        <span className={styles.meta}>
          {t('builtins.lobe-agent-marketplace.inspector.pickCount', { count: ids.length })}
        </span>
      )}
    </div>
  );
});

SubmitAgentPickInspector.displayName = 'SubmitAgentPickInspector';

export default SubmitAgentPickInspector;
