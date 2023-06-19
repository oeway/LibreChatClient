import * as Tabs from '@radix-ui/react-tabs';
import { CheckIcon } from 'lucide-react';
import { ThemeContext } from '~/hooks/ThemeContext';
import React, { useState, useContext, useCallback } from 'react';
import { useClearConversationsMutation } from '~/data-provider';

export const ThemeSelector = ({ theme, onChange }: { theme: string, onChange: (value: string) => void }) => (
  <div className="flex items-center justify-between">
    <div>Theme</div>
    <select
      className="w-24 rounded border border-black/10 bg-transparent text-sm dark:border-white/20 dark:bg-gray-900"
      onChange={(e) => onChange(e.target.value)}
      value={theme}
    >
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  </div>
);

export const ClearChatsButton = ({ confirmClear, showText = true, onClick }: { confirmClear: boolean, showText: boolean, onClick: () => void }) => (
  <div className="flex items-center justify-between">
    {showText && <div>Clear all chats</div>}
    <button
      className="btn relative bg-red-600  text-white hover:bg-red-800"
      type="button"
      id="clearConvosBtn"
      onClick={onClick}
    >
      {confirmClear ? (
        <div className="flex w-full items-center justify-center gap-2" id="clearConvosTxt">
          <CheckIcon className="h-5 w-5" /> Confirm Clear
        </div>
      ) : (
        <div className="flex w-full items-center justify-center gap-2" id="clearConvosTxt">
          Clear
        </div>
      )}
    </button>
  </div>
);

function General() {
  const { theme, setTheme } = useContext(ThemeContext);
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

  const changeTheme = useCallback((value: string) => {
    setTheme(value);
  }, [setTheme]);

  return (
    <Tabs.Content value="general" role="tabpanel" className="w-full md:min-h-[300px]" >
      <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-300">
        <div className="border-b pb-3 last-of-type:border-b-0 dark:border-gray-700">
          <ThemeSelector theme={theme} onChange={changeTheme} />
        </div>
        <div className="border-b pb-3 last-of-type:border-b-0 dark:border-gray-700">
          <ClearChatsButton confirmClear={confirmClear} onClick={clearConvos} showText={true}/>
        </div>
      </div>
    </Tabs.Content>
  );
}

export default React.memo(General);
