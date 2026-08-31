import { useCallback, useEffect, useState } from "react";
import { createSender as createSenderRequest, deleteSender as deleteSenderRequest, listSenders } from "@/api/senderApi";
import { toErrorMessage } from "@/api/client";
import type { CreateSenderInput, Sender } from "@/types/sender";

type Status = "loading" | "success" | "error";

interface UseSendersResult {
  senders: Sender[];
  status: Status;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  createSender: (input: CreateSenderInput) => Promise<Sender>;
  removeSender: (id: string) => Promise<void>;
}

export function useSenders(): UseSendersResult {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const result = await listSenders();
      setSenders(result);
      setStatus("success");
    } catch (err) {
      setErrorMessage(toErrorMessage(err));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createSender = useCallback(async (input: CreateSenderInput) => {
    const sender = await createSenderRequest(input);
    setSenders((current) => [sender, ...current]);
    return sender;
  }, []);

  const removeSender = useCallback(async (id: string) => {
    await deleteSenderRequest(id);
    setSenders((current) => current.filter((sender) => sender.id !== id));
  }, []);

  return { senders, status, errorMessage, refetch, createSender, removeSender };
}