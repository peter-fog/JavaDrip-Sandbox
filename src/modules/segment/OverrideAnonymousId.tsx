import { FC, useState, ChangeEvent, useCallback } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';

const OverrideAnonymousId: FC = () => {
  const [newAnonymousId, setNewAnonymousId] = useState<string>('');

  const handleChangeNewAnonymousId = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const { value } = e.target;
      setNewAnonymousId(value.trim());
    },
    [setNewAnonymousId]
  );

  const onAnonymousIdOverride = useCallback(
    () => window.dispatchEvent(new CustomEvent('Reset AnonymousId', { detail: { anonymousId: newAnonymousId } })),
    [newAnonymousId]
  );

  const onReset = useCallback(() => window.dispatchEvent(new CustomEvent('Reset AnonymousId')), []);

  return (
    <div className="flex flex-col">
      <p className="font-normal uppercase mb-2">Impersonate</p>
      <div className="flex flex-row gap-6">
        <Input
          className="min-h-min w-2/3"
          inputClassName="border-slate-950"
          onChange={handleChangeNewAnonymousId}
          placeholder="Enter a profile ID..."
        />
        <Button style="primary" className="my-auto" copy="Fetch profile" onClick={onAnonymousIdOverride} />
        <Button style="primary" className="my-auto" copy="Reset profile" onClick={onReset} />
      </div>
      <span className="text-gray-500 w-2/3">Allows you to fetch another profile by ID from Segment</span>
    </div>
  );
};

export default OverrideAnonymousId;
