import { Button } from "./Button";
interface Props { message: string; onRetry?: () => void; }
export function ErrorState({ message, onRetry }: Props) { return <div className="flex min-h-[260px] flex-col items-center justify-center text-center"><p className="text-sm font-medium text-red-600">Unable to load emails</p><p className="mt-1 max-w-md text-xs text-gray-500">{message}</p>{onRetry && <Button variant="outline" className="mt-4" onClick={onRetry}>Try again</Button>}</div>; }
