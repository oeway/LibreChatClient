import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogTemplate } from '../ui/';
import { ClearChatsButton } from './SettingsTabs/';
import { useClearConversationsMutation } from '~/data-provider';
import store from '~/store';

const ClearConvos = ({ open, onOpenChange }) => {
  const { newConversation } = store.useConversation();
  const { refreshConversations } = store.useConversations();
  const clearConvosMutation = useClearConversationsMutation();
  const [confirmClear, setConfirmClear] = useState(false);

  const clearConvos = useCallback(() => {
    if (confirmClear) {
      console.log('Clearing conversations...');
      clearConvosMutation.mutate({});
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  }, [confirmClear, clearConvosMutation]);

  useEffect(() => {
    if (clearConvosMutation.isSuccess) {
      refreshConversations();
      newConversation();
    }
  }, [clearConvosMutation.isSuccess, newConversation, refreshConversations]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTemplate
        title="Clear conversations"
        description="Are you sure you want to clear all conversations? This is irreversible."
        leftButtons={<ClearChatsButton showText={false} confirmClear={confirmClear} onClick={clearConvos} />}
      />
    </Dialog>
  );
};

export default ClearConvos;
