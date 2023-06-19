import { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Label } from '~/components/ui/Label.tsx';
import { Checkbox } from '~/components/ui/Checkbox.tsx';
import SelectDropDown from '../../ui/SelectDropDown';
import { cn } from '~/utils/';
import useDebounce from '~/hooks/useDebounce';
import { useUpdateTokenCountMutation } from '~/data-provider';

const defaultTextProps =
  'rounded-md border border-gray-200 focus:border-slate-400 focus:bg-gray-50 bg-transparent text-sm shadow-[0_0_10px_rgba(0,0,0,0.05)] outline-none placeholder:text-gray-400 focus:outline-none focus:ring-gray-400 focus:ring-opacity-20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-500 dark:bg-gray-700 focus:dark:bg-gray-600 dark:text-gray-50 dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] dark:focus:border-gray-400 dark:focus:outline-none dark:focus:ring-0 dark:focus:ring-gray-400 dark:focus:ring-offset-0';

function Settings(props) {
  const { readonly, context, systemMessage, jailbreak, toneStyle, setOption } = props;
  const [tokenCount, setTokenCount] = useState(0);
  const showSystemMessage = jailbreak;
  const setContext = setOption('context');
  const setSystemMessage = setOption('systemMessage');
  const setJailbreak = setOption('jailbreak');
  const setToneStyle = (value) => setOption('toneStyle')(value.toLowerCase());
  const debouncedContext = useDebounce(context, 250);
  const updateTokenCountMutation = useUpdateTokenCountMutation();

  useEffect(() => {
    if (!debouncedContext || debouncedContext.trim() === '') {
      setTokenCount(0);
      return;
    }

    const handleTextChange = (context) => {
      updateTokenCountMutation.mutate(
        { text: context },
        {
          onSuccess: (data) => {
            setTokenCount(data.count);
          }
        }
      );
    };

    handleTextChange(debouncedContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContext]);

  return (
    <div className="max-h-[350px] overflow-y-auto">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="col-span-1 flex flex-col items-center justify-start gap-6">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="toneStyle-dropdown" className="text-left text-sm font-medium">
              Tone Style <small className="opacity-40">(default: creative)</small>
            </Label>
            <SelectDropDown
              id="toneStyle-dropdown"
              title={null}
              value={`${toneStyle.charAt(0).toUpperCase()}${toneStyle.slice(1)}`}
              setValue={setToneStyle}
              availableValues={['Creative', 'Fast', 'Balanced', 'Precise']}
              disabled={readonly}
              className={cn(
                defaultTextProps,
                'flex w-full resize-none focus:outline-none focus:ring-0 focus:ring-opacity-0 focus:ring-offset-0'
              )}
              containerClassName="flex w-full resize-none"
            />
          </div>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="context" className="text-left text-sm font-medium">
              Context <small className="opacity-40">(default: blank)</small>
            </Label>
            <TextareaAutosize
              id="context"
              disabled={readonly}
              value={context || ''}
              onChange={(e) => setContext(e.target.value || null)}
              placeholder="Bing can use up to 7k tokens for 'context', which it can reference for the conversation. The specific limit is not known but may run into errors exceeding 7k tokens"
              className={cn(
                defaultTextProps,
                'flex max-h-[300px] min-h-[100px] w-full resize-none px-3 py-2'
              )}
            />
            <small className="mb-5 text-black dark:text-white">{`Token count: ${tokenCount}`}</small>
          </div>
        </div>
        <div className="col-span-1 flex flex-col items-center justify-start gap-6">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="jailbreak" className="text-left text-sm font-medium">
              Enable Sydney <small className="opacity-40">(default: false)</small>
            </Label>
            <div className="flex h-[40px] w-full items-center space-x-3">
              <Checkbox
                id="jailbreak"
                disabled={readonly}
                checked={jailbreak}
                className="focus:ring-opacity-20 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-50 dark:focus:ring-gray-600 dark:focus:ring-opacity-50 dark:focus:ring-offset-0"
                onCheckedChange={setJailbreak}
              />
              <label
                htmlFor="jailbreak"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-50"
              >
                Jailbreak <small>To enable Sydney</small>
              </label>
            </div>
          </div>
          {showSystemMessage && (
            <div className="grid w-full items-center gap-2">
              <Label
                htmlFor="systemMessage"
                className="text-left text-sm font-medium"
                style={{ opacity: showSystemMessage ? '1' : '0' }}
              >
                <a
                  href="https://github.com/danny-avila/LibreChat/blob/main/client/defaultSystemMessage.md"
                  target="_blank"
                  className="text-blue-500 transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500" rel="noreferrer"
                >
                  System Message
                </a>{' '}
                <small className="opacity-40 dark:text-gray-50">(default: blank)</small>
              </Label>

              <TextareaAutosize
                id="systemMessage"
                disabled={readonly}
                value={systemMessage || ''}
                onChange={(e) => setSystemMessage(e.target.value || null)}
                placeholder="WARNING: Misuse of this feature can get you BANNED from using Bing! Click on 'System Message' for full instructions and the default message if omitted, which is the 'Sydney' preset that is considered safe."
                className={cn(
                  defaultTextProps,
                  'flex max-h-[300px] min-h-[100px] w-full resize-none px-3 py-2 placeholder:text-red-400'
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
